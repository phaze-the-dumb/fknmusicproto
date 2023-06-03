// ==UserScript==
// @name        Spotify Music Metadata
// @match       https://open.spotify.com/*
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
            playing: false
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

let convertTime = ( str ) => {
    let splitTime = str.split(':');

    if(splitTime.length === 2){
        let seconds = parseInt(splitTime[1]);
        let minutes = parseInt(splitTime[0]);

        seconds += minutes * 60;
        return seconds;
    }
    
    if(splitTime.length === 3){
        let seconds = parseInt(splitTime[2]);
        let minutes = parseInt(splitTime[1]);
        let hours = parseInt(splitTime[0]);

        minutes += hours * 60;
        seconds += minutes * 60;
        return seconds;
    }
}

let musicInfo = new MusicMetaClient();

setInterval(() => {
    if(
        !document.querySelector('div.eMzEmF > span:nth-child(1) > a:nth-child(1)') ||
        !document.querySelector('div.gpNta6i8q3KYJC6WBZQC:nth-child(1)') ||
        !document.querySelector('.playback-bar__progress-time-elapsed') ||
        !document.querySelector('.vnCew8qzJq3cVGlYFXRI')
    )return;

    musicInfo.updateMeta({
        type: 'ClientUpdate',
        songTitle: document.querySelector('div.eMzEmF > span:nth-child(1) > a:nth-child(1)').innerText,
        songArtist: document.querySelector('div.gpNta6i8q3KYJC6WBZQC:nth-child(1)').innerText,
        songAlbum: null,
        duration: convertTime(document.querySelector('div.Type__TypeElement-sc-goli3j-0:nth-child(3)').innerText),
        elapsed: convertTime(document.querySelector('.playback-bar__progress-time-elapsed').innerText),
        playing: document.querySelector('.vnCew8qzJq3cVGlYFXRI').getAttribute('label') === 'Pause'
    })
}, 1000);
