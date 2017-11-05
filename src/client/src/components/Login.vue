<template>
    <div class="ui segments">
        <div class="ui violet inverted center aligned segment">
            Connexion
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

                <button class="ui violet button" @click="login" :disabled="busy">
                    <i class="ui refresh hourglass half icon" v-if="busy"></i> Connexion
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
                errorMessage: '',
                busy: false
            }
        },
        methods: {
            login () {
                if (this.username !== '' && this.password !== '') {
                    this.busy = true
                    this.errorMessage = ''

                    let payload = {
                        username: this.username,
                        password: this.password
                    }

                    Socket.emit('account.login', payload)
                }
            }
        },
        mounted () {
            Socket.on('account.token', data => {
                if (!data.success) {
                    this.busy = false
                    this.errorMessage = data.message
                } else {
                    window.localStorage.setItem('Protoxyde:AuthToken', data.token)
                    Socket.emit('account.token', data.token)
                }
            })
        }
    }
</script>