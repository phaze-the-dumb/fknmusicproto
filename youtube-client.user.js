// ==UserScript==
// @name        Youtube Music Metadata
// @match       https://www.youtube.com/watch
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
        !document.querySelector('h1.style-scope:nth-child(2) > yt-formatted-string:nth-child(2)') ||
        !document.querySelector('.ytp-time-duration') ||
        !document.querySelector('ytd-video-owner-renderer.ytd-watch-metadata > div:nth-child(2) > ytd-channel-name:nth-child(1) > div:nth-child(1) > div:nth-child(1) > yt-formatted-string:nth-child(1) > a:nth-child(1)') ||
        !document.querySelector('.ytp-play-button')
    )return;

    musicInfo.updateMeta({
        type: 'ClientUpdate',
        songTitle: document.querySelector('h1.style-scope:nth-child(2) > yt-formatted-string:nth-child(2)').innerText,
        songArtist: document.querySelector('ytd-video-owner-renderer.ytd-watch-metadata > div:nth-child(2) > ytd-channel-name:nth-child(1) > div:nth-child(1) > div:nth-child(1) > yt-formatted-string:nth-child(1) > a:nth-child(1)').innerText,
        songAlbum: null,
        duration: convertTime(document.querySelector('.ytp-time-duration').innerText),
        elapsed: convertTime(document.querySelector('.ytp-time-current').innerText),
        playing: document.querySelector('.ytp-play-button').getAttribute('tooltip') === 'Pause',
        source: 'Youtube'
    })
}, 1000);
