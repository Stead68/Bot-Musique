const Database = require('./Database')

class Client {
    constructor (token, username, nick, experience, socket) {
        this.token = token
        this.username = username
        this.nick = nick
        this.experience = parseInt(experience, 10)
        this.ip = socket.request.headers['x-forwarded-for'] || socket.request.headers['x-real-ip'] || socket.request.connection.remoteAddress

        this.isConnected = true // If no socket are linked to that user it will turn to false
        this.hasVoted = false // Anti-cheat: Avoid user to vote multiple times.
        this.multiplierEnabled = true // Anti-cheat: if last music was busted, multiplier is disabled.
    }

    async AddExperience (amount) {
        this.experience = await Database.hincrbyAsync(`Protoxyde:BotV3:Account:${this.username}`, 'experience', amount)

        // Ensure that global client is also updated.
        if (Clients[this.token]) {
            Clients[this.token].experience = this.experience
        }

        // Broadcast to all instance
        io.to(this.token).emit('experience', this.experience)

        Player.BroadcastConnected()
    }

    async RemoveExperience (amount) {
        this.experience = await Database.hincrbyAsync(`Protoxyde:BotV3:Account:${this.username}`, 'experience', -Math.abs(amount))

        // Ensure that global client is also updated.
        if (Clients[this.token]) {
            Clients[this.token].experience = this.experience
        }

        io.to(this.token).emit('experience', this.experience)

        Player.BroadcastConnected()
    }

    EnableMultiplier (bool) {
        if (Clients[this.token]) {
            Clients[this.token].multiplierEnabled = bool
        }

        this.multiplierEnabled = bool
    }

    serialize () {
        return {
            nick: this.nick,
            experience: this.experience
        }
    }
}

module.exports = Client