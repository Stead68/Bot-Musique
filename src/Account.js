const crypto = require('crypto')
const Database = require('./Database')
const Client = require('./Client')

class Account {
    static Plug (socket) {
        socket.on('account.login', async data => {
            let payload = { success: true }

            let username = data.username
            let password = crypto.createHash('whirlpool').update(data.password).digest('hex')

            let account = await Database.hgetallAsync(`Protoxyde:BotV3:Account:${username.toLowerCase()}`)

            if (!account || account.password !== password) {
                payload.success = false
                payload.message = `Le compte n'existe pas ou le mot de passe est incorrect.`
            }

            if (payload.success) {
                payload.token = account.token
            }

            // Very basic anti brute-force
            setTimeout(() => {
                socket.emit('account.token', payload)
            }, 250)
        })

        socket.on('account.nick', async nick => {
            let payload = { success: true }

            nick = (nick !== undefined && nick !== null) ? nick : ''

            if (nick.length < 4 || nick.length > 32) {
                payload.success = false
            } else {
                payload.success = true
                payload.nick = nick

                Clients[Sockets[socket.id]].nick = nick

                await Database.hsetAsync(`Protoxyde:BotV3:Account:${Clients[Sockets[socket.id]].username}`, 'nick', nick)

                Player.BroadcastConnected()
            }

            // Very basic anti brute-force.
            setTimeout(() => {
                socket.emit('account.nick', payload)
            }, 250)
        })

        socket.on('account.password', async data => {
            let payload = { success: true }

            let password = data.password
            let passwordConfirmation = data.passwordConfirmation

            let username = Clients[Sockets[socket.id]].username

            if (!password || !passwordConfirmation || password !== passwordConfirmation || password.length < 4 || password.length > 64) {
                payload.success = false
            } else {
                let hash = crypto.createHash('whirlpool').update(password).digest('hex')

                await Database.hsetAsync(`Protoxyde:BotV3:Account:${username}`, 'password', hash)

                payload.success = true
            }

            socket.emit('account.password', payload)
        })

        // When a user uses token to login.
        socket.on('account.token', async token => {
            let payload = { success: true }
            let username = await Database.getAsync(`Protoxyde:BotV3:Token:${token}`)

            if (!username) {
                payload.success = false
            }

            if (payload.success) {
                // Token exists.
                let user = await Database.hgetallAsync(`Protoxyde:BotV3:Account:${username}`)

                Sockets[socket.id] = token

                if (Clients[token] === undefined) {
                    Clients[token] = new Client(token, username, user.nick, user.experience, socket)
                }

                Clients[token].isConnected = true

                payload.nick = user.nick
                payload.experience = user.experience

                // Add socket to client's room
                socket.join(token)

                console.log(`|ACCOUNT| Account ${username} (${user.nick}) #${user.token} signed-in using AuthToken.`)

                Player.BroadcastConnected()
            }

            socket.emit('account.logged', payload)
        })

        // When a user creates an account.
        socket.on('account.register', async data => {
            let payload = { success: true }

            let username = data.username
            let password = data.password
            let passwordConfirmation = data.passwordConfirmation

            if (!/^[a-zA-Z0-9_-]{4,32}$/.test(username)) {
                payload.success = false
                payload.message = `Le nom d'utilisateur doit être comprit entre 4 et 32 caractères alphanumériques, - ou _.`
            }

            let accountKey = `Protoxyde:BotV3:Account:${username.toLowerCase()}`
            let alreadyTaken = await Database.existsAsync(accountKey)

            if (alreadyTaken) {
                payload.success = false
                payload.message = `Le nom d'utilisateur est déjà utilisé.`
            }

            if (password === undefined || passwordConfirmation === undefined || password.length < 4 || password.length > 64) {
                payload.success = false
                payload.message = `Les deux mots de passe doivent être identique et doivent être comprient entre 4 et 64 caractères.`
            }

            if (payload.success) {
                let token = crypto.randomBytes(8).toString('hex')
                let username = data.username.trim()
                let password = crypto.createHash('whirlpool').update(data.password).digest('hex')

                let tokenKey = `Protoxyde:BotV3:Token:${token}`

                // Create an entry to link a token to an user.
                await Database.setAsync(tokenKey, username.toLowerCase())

                // Create user.
                await Database.hmsetAsync(accountKey,
                    'nick', 'LongDuZob_' + Math.floor(Math.random() * 9999999),
                    'password', password,
                    'experience', 0,
                    'token', token
                )

                console.log(`|ACCOUNT| Account ${username} created.`)

                payload.token = token
            }

            socket.emit('account.registered', payload)
        })
    }
}

module.exports = Account