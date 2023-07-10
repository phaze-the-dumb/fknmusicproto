// ==UserScript==
// @name        Listen Brainz Metadata
// @match       https://listenbrainz.org/user/*
// @version     1.0
// @author      Phaze#6193
// ==/UserScript==

class MusicMetaClient{
    constructor( opts = { debug: false } ){
        this.opts = opts;
        this.ws = null;
        this.open = false;
        this.media = {
            type: 'ClientUpdate',
            songTitle: null,
            songArtist: null,
            songAlbum: null,
            duration: null,
            elapsed: null,
            playing: false,
            source: null
        }

        this.attemptConnection();
    }
    attemptConnection(){
        this.ws = new WebSocket('ws://127.0.0.1:40309');

        this.ws.onclose = () => {
            if(this.opts.debug)
                console.log('Cannot connect to any server, is it running? Trying again in 5 seconds.');

            this.open = false;
            setTimeout(() => this.attemptConnection(), 5000);
        }

        this.ws.onopen = () => {
            this.open = true;
            this.onSongDataChange();
        }
    }
    onSongDataChange(){
        if(this.open === false)return;

        if(this.opts.debug)
            console.log('Updating metadata server');

        this.ws.send(JSON.stringify(this.media))
    }
    updateMeta(meta){
        if(
            meta.songTitle !== this.media.songTitle ||
            meta.songAlbum !== this.media.songAlbum ||
            meta.songArtist !== this.media.songArtist ||
            meta.duration !== this.media.duration ||
            meta.elapsed !== this.media.elapsed ||
            meta.playing !== this.media.playing
        ) {
            this.media = meta;
            this.onSongDataChange();
        }
    }
}

let musicInfo = new MusicMetaClient();

setInterval(() => {
    if(
        !document.querySelector('.playing-now > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)') ||
        !document.querySelector('.playing-now > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > a:nth-child(1)')
    )return;

    musicInfo.updateMeta({
        type: 'ClientUpdate',
        songTitle: document.querySelector('.playing-now > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)').innerText,
        songArtist: document.querySelector('.playing-now > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > a:nth-child(1)').innerText,
        songAlbum: null,
        duration: -1,
        elapsed: -1,
        playing: true,
        source: 'Listen Brainz'
    })
}, 1000);
