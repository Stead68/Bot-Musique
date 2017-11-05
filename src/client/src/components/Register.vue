<template>
    <div class="ui segments">
        <div class="ui violet inverted center aligned segment">
            Inscription
        </div>
        <div class="ui inverted center aligned segment">
            <div class="ui negative message" v-if="errorMessage">
                <div class="header">
                    Aww hell noo!
                </div>
                <p>{{ errorMessage }}</p>
            </div>
            <div class="ui inverted form">
                <div class="ui field fluid inverted transparent">
                    <label for="username">Nom d'utilisateur</label>
                    <input type="text" placeholder="Nom d'utilisateur" id="username" v-model="username">
                </div>
                <div class="ui field fluid inverted transparent">
                    <label for="password">Mot de passe</label>
                    <input type="password" placeholder="Mot de passe" id="password" v-model="password">
                </div>
                <div class="ui field fluid inverted transparent">
                    <label for="passwordConfirmation">Confirmation</label>
                    <input type="password" placeholder="Mot de passe" id="passwordConfirmation" v-model="passwordConfirmation">
                </div>

                <button class="ui violet button" @click="register" :disabled="busy">
                    <i class="ui refresh hourglass half icon" v-if="busy"></i> Inscription
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import Connection from '../classes/Connection'

    let Socket = Connection.GetSocket()

    export default {
        data () {
            return {
                username: '',
                password: '',
                passwordConfirmation: '',
                busy: false,
                errorMessage: ''
            }
        },
        methods: {
            register () {
                if (this.username !== '' && this.password !== '' && this.passwordConfirmation !== '') {
                    this.busy = true
                    this.errorMessage = ''

                    let payload = {
                        username: this.username,
                        password: this.password,
                        passwordConfirmation: this.passwordConfirmation
                    }

                    Socket.emit('account.register', payload)
                }
            }
        },
        mounted () {
            Socket.on('account.registered', (data) => {
                if (!data.success) {
                    this.busy = false
                    this.errorMessage = data.message
                } else {
                    console.log(`|INSCRIPTION| Compte crée avec succès.`)
                    window.localStorage.setItem('Protoxyde:AuthToken', data.token)
                    console.log(`|CONNEXION| Utilisation du token pour une connexion rapide.`)
                    Socket.emit('account.token', data.token)
                }
            })
        }
    }
</script>