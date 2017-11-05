const _ = require('lodash')

let clients = { }

clients['sq54d5qs64dqs'] = { user: 'john', ip: '192.168.1.2', voted: true }
clients['sdfsdfdsfsdf'] = { user: 'doe', ip: '192.168.2.3', voted: false }
clients['sq54d5qdfsdfs64dqs'] = { user: 'stead', ip: '122.178.1.2', voted: true }
clients['sq54d5sfdsfqs64dqs'] = { user: 'vort', ip: '192.148.1.66', voted: true }

_.each(clients, client => console.log)