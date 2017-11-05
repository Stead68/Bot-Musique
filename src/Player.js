const fs = require('fs')
const os = require('os')
const _ = require('lodash')

const ipcMain = require('electron').ipcMain

class Player {
    constructor () {
        this.isPlaying = false
        this.state = 'EN ATTENTE'
        this.current = null

        this.lastUpdate = 0

        this.times = {
            elapsed: 0,
            duration: 0
        }

        ipcMain.on('play', () => {
            this.state = 'LECTURE EN COURS'

            this.lastUpdate = 0

            this.times = {
                elapsed: 0,
                duration: 0
            }

            // Broadcast state of player to everybody.
            this.BroadcastState()
        })

        ipcMain.on('time', (event, elapsed, duration) => {
            if (this.current) {
                elapsed = Math.round(elapsed)
                duration = Math.round(duration)

                if (this.lastUpdate == 0)
                    this.lastUpdate = elapsed

                if (this.lastUpdate > 0) {
                    let delta = elapsed - this.lastUpdate

                    if (delta >= 10) {
                        let amount = 3 + Math.floor(Math.random() * 4)
                            amount *= this.current.multiplier

                        this.current.owner.AddExperience(amount)

                        // Lotterie
                        let rand = Math.random() * 100
                        let bonus = 0

                        if (rand < 0.1)
                            bonus = Math.floor(Math.random() * 900) + 100
                        else if (rand < 1)
                            bonus = Math.floor(Math.random() * 90) + 10
                        else if (rand < 10)
                            bonus = Math.floor(Math.random() * 9) + 1

                        bonus *= this.current.multiplier

                        this.current.owner.AddExperience(bonus)
                        this.lastUpdate = elapsed
                    }
                }

                // Anti flood from bot to clients.
                if (this.times.elapsed != elapsed || this.times.duration != duration) {
                    this.times.elapsed = elapsed
                    this.times.duration = duration

                    this.BroadcastState()
                    this.BroadcastTimes()
                }
            }
        })

        ipcMain.on('end', (event, blocked) => {
            this.current.blocked = blocked
            History.unshift(this.current)

            if (History.length > 30)
                History.pop()

            this.current.owner.EnableMultiplier(!this.current.busted)

            this.isPlaying = false
            this.current = null
            this.times = { elapsed: 0, duration: 0 }

            // Reset votes.
            for (let key in Clients) {
                Clients[key].hasVoted = false
            }

            this.BroadcastHistory()
            this.BroadcastVotes()

            if (Queue.length > 0) {
                this.Play()
            } else {
                this.state = 'EN ATTENTE'

                // Broadcast state of player to everybody.
                this.BroadcastState()
            }
        })
    }

    /**
     * Send queue to all connected client.
     */
    BroadcastQueue (socket = null) {
        let payload = []

        for (let track of Queue) {
            payload.push({
                link: track.link,
                title: track.title,
                owner: track.owner.serialize()
            })
        }

        // Optimize networking with broadcast.
        let destination = (socket) ? socket : io

        destination.emit('queue', payload)
    }

    /**
     * Send history to all connected client.
     */
    BroadcastHistory (socket = null) {
        let payload = []

        for (let track of History) {
            payload.push({
                link: track.link,
                title: track.title,
                owner: track.owner.serialize(),
                busted: track.busted,
                blocked: track.blocked
            })
        }

        // Optimize networking with broadcast.
        let destination = (socket) ? socket : io

        destination.emit('history', payload)
    }

    BroadcastVotes (socket = null) {
        let payload = []
        let votes = _.filter(Clients, client => client.hasVoted)

        for (let vote of votes) {
            payload.push(vote.serialize())
        }

        // Optimize networking with broadcast.
        let destination = (socket) ? socket : io

        destination.emit('votes', payload)
    }

    BroadcastState (socket = null) {
        let payload = {
            state: this.state
        }

        if (this.current) {
            payload.current =  {
                title: this.current.title,
                link: this.current.link,
                owner: this.current.owner.serialize(),
                multiplier: this.current.multiplier
            }
        }

        // Optimize networking with broadcast.
        let destination = (socket) ? socket : io

        destination.emit('state', payload)
    }

    BroadcastTimes (socket = null) {
        // Optimize networking with broadcast.
        let destination = (socket) ? socket : io

        destination.emit('times', this.times)
    }

    BroadcastConnected (socket = null) {
        let payload = [ ]

        for (let key in Clients) {
            let user = Clients[key]

            if (user.isConnected)
                payload.push(user.serialize())
        }

        // Optimize networking with broadcast.
        let destination = (socket) ? socket : io

        destination.emit('users', payload)
    }

    Play () {
        let track = Queue.shift()

        this.BroadcastQueue()

        this.state = 'CHARGEMENT'
        this.current = track
        this.isPlaying = true

        // Roll dice for multiplier
        if (Clients[this.current.owner.token].multiplierEnabled) {
            let rand = Math.floor(Math.random() * 24) + 1

            switch (rand) {
                case 17:
                case 18:
                    this.current.multiplier = 2
                    break
                case 19:
                case 20:
                    this.current.multiplier = 3
                    break
                case 21:
                case 22:
                    this.current.multiplier = 4
                    break
                case 23:
                case 24:
                    this.current.multiplier = 5
                    break
            }
        }

        this.BroadcastState()
        this.BroadcastTimes()

        console.log('Lecture en cours de ' + track.link)

        Browser.webContents.send('play', track.link)
    }

    PlayNext() {
        this.current.busted = true
        Browser.webContents.send('stop')
    }
}

module.exports = Player