<template>
    <div>
        <div v-if="connection.isConnected">
            <div v-if="connection.authToken">
                <div v-if="connection.isAuthed">
                    <Navigation></Navigation>
                    <router-view></router-view>
                    <Bottom></Bottom>
                </div>
                <div class="ui container" v-else>
                    <div class="px center aligned fullscreen message">
                        <i class="ui hourglass half violet colored icon"></i>
                        <p class="ui blue colored">
                            Téléchargement des données bancaires...
                        </p>
                    </div>
                </div>
            </div>
            <div class="ui container" v-else>
                <div class="ui centered grid">
                    <div class="six wide tablet four wide computer column">
                        <Login></Login>
                    </div>
                    <div class="six wide tablet four wide computer column">
                        <Register></Register>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <div class="ui container">
                <div class="px center aligned fullscreen message">
                    <i class="ui warning violet colored sign icon"></i>
                    <p class="ui blue colored">
                        La connexion au serveur a été interrompue inopinément.<br>
                        Tentative de reconnection en cours...
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Connection from '../classes/Connection'

    import Navigation from './Navigation.vue'
    import Login from './Login.vue'
    import Register from './Register.vue'
    import Bottom from './Bottom.vue'

    import ConnectedStore from '../stores/ConnectedStore'

    let Socket = Connection.GetSocket()

    export default {
        functional: false,
        components: {
            Navigation, Login, Register, Bottom
        },
        data () {
            return {
                connection: Connection.state
            }
        }
    }

    Socket.on('users', users => {
        ConnectedStore.users = users
    })
</script>

<style>
    .fullscreen.message {
        padding: 50px;
        font-size: 20px;
        line-height: 50px;
        animation: 1s alternate infinite fadeInOut;
    }

    .fullscreen.message .icon {
        font-size: 100px;
    }

    @keyframes fadeInOut {
        0% {
            opacity: 0.2;
        }
        100% {
            opacity: 1;
        }
    }
</style>