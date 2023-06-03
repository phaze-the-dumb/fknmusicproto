const MusicMetaServer = require('./server');

let s = new MusicMetaServer({ debug: true });

s.on('ActivityUpdated', a => console.log(s.activity, a.activity.length));