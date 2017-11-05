<template>
    <div v-if="0 !== 0">
        <div class="ui horizontal inverted divider">
            {{ account.username }} <i class="ui setting icon px cursor pointer" v-on:click="OpenSettingsModal"></i>
        </div>
        <div class="ui two statistics">
            <div class="ui inverted statistic">
                <div class="value">
                    <AnimatedNumber :number="account.experience" />
                </div>
                <div class="label">
                    <i class="ui star icon"></i> Experience
                </div>
            </div>
            <div class="ui inverted statistic">
                <div class="value">
                    {{ account.level }}
                </div>
                <div class="label">
                    <i class="ui trophy icon"></i> Niveau
                </div>
            </div>
        </div>

        <br>

        <div class="ui inverted tiny active orange progress" data-percent="0" id="experience-bar">
            <div class="bar"></div>
        </div>
        <div class="px center aligned">
            <AnimatedNumber :number="account.experience" /> / <AnimatedNumber :number="needed" />
        </div>

        <div class="ui basic modal" id="nick-modal">
            <div class="header">Configuration du compte :</div>
            <div class="content">
                <i class="ui user outline icon"></i> Changer de sobriquet :
                <div class="ui action input left icon">
                    <i class="inverted icon" v-bind:class="[indicators.nick]"></i>
                    <input placeholder="Entrez votre sobriquet" type="text" v-model="account.username">
                    <button class="ui button" v-on:click="UpdateNick">Envoyer</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AccountStore from '../../stores/AccountStore'
    import Connection from '../../classes/Connection'
    import Levels from '../../classes/Levels'

    import AnimatedNumber from '../AnimatedNumber.vue'

    let Socket = Connection.GetSocket()

    let Indicators = {
        nick: 'check circle',
        token: 'check circle'
    }

    export default {
        components: { AnimatedNumber },
        data () {
            return {
                account: AccountStore.state,
                indicators: Indicators
            }
        },
        mounted () {
            $('#experience-bar').progress({ percent: this.percent })
        },
        methods: {
            OpenSettingsModal () {
                jQuery("#nick-modal").modal('show')
            },
            UpdateNick () {
                this.indicators.nick = 'loading world'
                Socket.emit('account.nick', this.account.username)
            }
        },
        computed: {
            percent: function () {
                let level = this.account.level
                let low = Levels.GetThreshold(level)
                let high = Levels.GetThreshold(level + 1)

                let needed = high - low
                let actual = this.account.experience - low

                return Math.round((actual / needed) * 100)
            },
            needed: function () {
                return Math.ceil(Levels.GetThreshold(this.account.level + 1))
            }
        },
        watch: {
            percent: function () {
                $('#experience-bar').progress({ percent: this.percent })
            }
        }
    }

    Socket.on('account.nick', payload => {
        Indicators.nick = payload.success ? 'check circle' : 'remove circle'
        AccountStore.username = payload.nick
    })

    Socket.on('experience', experience => {
        AccountStore.setExperience(experience)
    })
</script>

<style>
    .ui.progress {
        display: inline;
    }
</style>