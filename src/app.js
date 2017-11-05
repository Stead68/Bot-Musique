const path = require('path')
const url = require('url')
const express = require('express')
const http = require('http')
const crypto = require('crypto')
const socketio = require('socket.io')
const _ = require('lodash')
const app = express()

const Electron = require('electron').app
const BrowserWindow = require('electron').BrowserWindow

const Database = require('./Database')
const Track = require('./Track')
const VideoPlayer = require('./Player')
const Client = require('./Client')
const Account = require('./Account')
const Roulette = require('./Roulette')

global.Player = null
global.Browser = null
global.Queue = []
global.History = []

global.Clients = { } // Store connected clients.
global.Sockets = { } // Link sockets to client.

app.use('/', express.static(path.resolve(__dirname, 'client')))

const unsecure = http.createServer(app)

global.io = new socketio(unsecure)

io.on('connect', socket => {
    // When client connect to the bot.
    Player.BroadcastState(socket)
    Player.BroadcastTimes(socket)
    Player.BroadcastQueue(socket)
    Player.BroadcastHistory(socket)
    Player.BroadcastVotes(socket)

    Account.Plug(socket)
    Roulette.Plug(socket)

    socket.on('skip', () => {
        // Client isn't connected.
        if (Clients[Sockets[socket.id]] === undefined)
            return

        // Client already voted.
        if (Clients[Sockets[socket.id]].hasVoted)
            return

        let client = Clients[Sockets[socket.id]]

        // OK, client can vote.
        client.hasVoted = true

        let threshold = _.filter(Clients, client => client.isConnected).length / 2
        let count = _.filter(Clients, client => client.hasVoted).length

        if (count >= threshold) {
            // Reset votes
            for (let key in Clients) {
                Clients[key].hasVoted = false
            }

            // Skip current track
            Player.PlayNext()
        }

        // Broadcast votes.
        Player.BroadcastVotes()
    })

    // When client sends a link to server.
    socket.on('push', async link => {
        if (Clients[Sockets[socket.id]] === undefined)
            return

        let track = new Track(link, Clients[Sockets[socket.id]])

        if (await track.Verify()) {
            // Add track to the queue.
            await Queue.push(track)
            console.log(`La vidéo ${link} a été ajouté a la file d'attente par ${track.owner.nick}.`)

            // Send queue to everybody.
            Player.BroadcastQueue()

            if (!Player.isPlaying) {
                Player.Play()
            }
        }
    })

    socket.on('connection.ping', timestamp => {
        socket.emit('connection.pong', timestamp)
    })

    socket.on('disconnect', () => {
        if (Clients[Sockets[socket.id]] === undefined)
            return

        let threshold = _.filter(Clients, client => client.isConnected).length / 2
        let count = _.filter(Clients, client => client.hasVoted).length

        if (count > threshold) {
            // Reset votes
            for (let key in Clients) {
                Clients[key].hasVoted = false
            }

            // Skip current track
            Player.PlayNext()
        }

        // Broadcast votes.
        Player.BroadcastVotes()

        // Delete the client itself only if no other instance are associated to it.
        let token = Sockets[socket.id]

        io.of(token).clients((error, clients) => {
            if (clients.length === 0) {
                Clients[token].isConnected = false
                Clients[token].hasVoted = false
            }

            // Broadcast list
            Player.BroadcastConnected()
        })

        // Delete socket
        delete Sockets[socket.id]
    })
})

Electron.on('ready', () => {
    Browser = new BrowserWindow({ width: 800, height: 600 })

    // YouTube's headers hack to by-pass headers to load youtube inside an iFrame.
    Browser.webContents.session.webRequest.onHeadersReceived({}, (d, c) => {
        if (d.responseHeaders['x-frame-options'] || d.responseHeaders['X-Frame-Options']){
            delete d.responseHeaders['x-frame-options'];
            delete d.responseHeaders['X-Frame-Options'];
        }

        let host = url.parse(d.url).host
        let path = url.parse(d.url).pathname

        switch (host) {
            // ADS-DOMAINS
            case 'ade.googlesyndication.com':
            case 'yt3.ggpht.com':
            case 's0.2mdn.net':
            case 'googleads.g.doubleclick.net':
            case 'ad.doubleclick.net':
            case 'files.adform.net':
            case 'secure-ds.serving-sys.com':
            case 'pagead2.googlesyndication.com':
            case 'www.google.fr':
                c({ cancel: true })
                break
            default:
                switch (path) {
                    // PATH
                    case '/api/stats/playback':
                    case '/player_204':
                    case '/ptracking':
                    case '/csi_204':
                    case '/api/stats/qoe':
                    case '/youtubei/v1/log_event':
                    case '/youtubei/v1/log_interaction':
                    case '/get_midroll_info':
                    case '/yts/jsbin/www-pagead-id-vflJZeyi4/www-pagead-id.js':
                    case '/yts/jsbin/www-pagead-id-vflJZeyi4':
                        c({ cancel: true })
                        break
                    default:
                        c({ cancel: false, responseHeaders: d.responseHeaders })
                }
        }
    });


    Browser.loadURL(`file:///${__dirname}/index.html`)

    // Create video player
    Player = new VideoPlayer()

    // Create webserver
    unsecure.listen(8085)

    // Init roulette
    Roulette.Init()
})

process.on(
    "unhandledRejection",
    function handleWarning( reason, promise ) {

        console.log( "[PROCESS] Unhandled Promise Rejection" )
        console.log( "- - - - - - - - - - - - - - - - - - -" )
        console.log( reason )
        console.log( "- -"  )

    }
)