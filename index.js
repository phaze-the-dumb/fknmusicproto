const MusicMetaServer = require('./server');

let s = new MusicMetaServer({ debug: true });

s.on('ActivityUpdated', a => console.log(a.media));