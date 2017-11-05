import io from 'socket.io-client'
import AccountStore from '../stores/AccountStore'

class Connection {
    constructor() {
        this.state = {
            isConnected: false,
            isAuthed: false,
            latency: null,
            authToken: localStorage.getItem('Protoxyde:AuthToken') || null
        }

        this.socket = io()

        this.socket.on('connect', () => {
            this.state.isConnected = true

            if (this.state.authToken !== null) {
                console.log(`|CONNEXION| Utilisation du token pour une connexion rapide.`)
                this.socket.emit('account.token', this.state.authToken)
            }

            this.socket.emit('connection.ping', Date.now())
        })

        this.socket.on('account.logged', data => {
            console.log('|CONNEXION| Vous êtes connecté.')

            if (!data.success) {
                alert('Impossible de charger votre compte depuis le token. La page va se recharger.')
                window.localStorage.removeItem('Protoxyde:AuthToken')
                window.location.reload(true)
            } else {
                this.state.isAuthed = true
                this.state.authToken = localStorage.getItem('Protoxyde:AuthToken')

                AccountStore.state.nickname = data.nick
                AccountStore.setExperience(data.experience)
            }
        })

        this.socket.on('disconnect', () => {
            this.state.isConnected = false
        })

        this.socket.on('connection.pong', timestamp => {
            this.state.latency = Date.now() - timestamp
            let self = this

            setTimeout(() => {
                self.socket.emit('connection.ping', Date.now())
            }, 2500)
        })

        this.socket.connect(`${window.location.protocol}//${window.location.host}:${window.location.port}`)
    }

    GetSocket() {
        return this.socket
    }
}

export default new Connection()