<template>
    <div class="ui modal" id="config">
        <div class="header">
            Paramètres du compte
        </div>
        <div class="content">
            <div class="ui form">
                <div class="ui field">
                    <label for="nickname">Sobriquet :</label>

                    <div class="ui action left icon input">
                        <i class="ui icon" :class="[ icons.nickname ]"></i>
                        <input type="text" placeholder="Enter tags" id="nickname" v-model="account.nickname">
                        <button class="ui violet button" @click="changeNick">Changer</button>
                    </div>
                </div>
                <div class="ui divider" />

                <div class="ui negative message" v-if="errorMessages.password">
                    <div class="header">
                        Impossible de changer de mot de passe.
                    </div>
                    <ul>
                        <li>Les deux mots de passe doivent être identiques.</li>
                        <li>Le mot de passe doit être comprit entre 4 et 64 caractères.</li>
                    </ul>
                </div>

                <div class="ui info message" v-if="successMessages.password">
                    <div class="header">
                        Yarr!
                    </div>
                    Votre mot de passe a été changé avec succès.
                </div>

                <div class="ui fields">
                    <div class="ui field">
                        <label for="password">Changer de mot de passe</label>
                        <input type="password" id="password" v-model="password">
                    </div>

                    <div class="ui field">
                        <label for="passwordConfirmation">Confirmation</label>
                        <input type="password" id="passwordConfirmation" v-model="passwordConfirmation">
                    </div>

                    <div class="ui field">
                        <label for="">Changer de mot de passe</label>
                        <button class="ui violet button" @click="changePassword">Envoyer</button>
                    </div>
                </div>
            </div>

            <div class="ui divider" />

            <div class="px center aligned">
                <button class="ui icon orange button" @click="disconnect">
                    <i class="ui warning sign icon"></i>
                    Se déconnecter du compte
                </button>
            </div>
        </div>
        <div class="actions">
            <div class="ui violet button" @click="close">Fermer</div>
        </div>
    </div>
</template>

<script>
    import AccountStore from '../stores/AccountStore'
    import Connection from '../classes/Connection'

    let Socket = Connection.GetSocket()

    let Icons = {
        nickname: 'checkmark'
    }

    let ErrorMessages = {
        password: false
    }

    let SuccessMessages = {
        password: false
    }

    export default {
        data () {
            return {
                account: AccountStore.state,
                password: '',
                passwordConfirmation: '',
                icons: Icons,
                errorMessages: ErrorMessages,
                successMessages: SuccessMessages
            }
        },
        mounted () {
            this.$parent.$on('config:show', this.open)
        },
        methods: {
            close () {
                $('#config').modal('hide')
            },
            open () {
                $('#config').modal('show')
            },
            changeNick () {
                Socket.emit('account.nick', this.account.nickname)
            },
            changePassword () {
                this.errorMessages.password = false
                this.successMessages.password = false

                Socket.emit('account.password', {
                    password: this.password,
                    passwordConfirmation: this.passwordConfirmation
                })
            },
            disconnect () {
                window.localStorage.removeItem('Protoxyde:AuthToken')
                window.location.reload(true)
            }
        },
        watch: {
            'account.nickname': () => {
                Icons.nickname = 'warning'
            }
        }
    }

    Socket.on('account.nick', data => {
        if (!data.success) {
            Icons.nickname = 'remove'
            return
        }

        Icons.nickname = 'checkmark'
        AccountStore.state.nickname = data.nick
    })

    Socket.on('account.password', data => {
        ErrorMessages.password = !data.success
        SuccessMessages.password = data.success
    })
</script>

<style>
    /* Fix semantic-ui bug ? */
    .ui.action.input input {
        color: rgb(50, 50, 50);
    }
    .ui.action.input input:not(:focus) {
        background: inherit;
        color: inherit;
    }
</style>