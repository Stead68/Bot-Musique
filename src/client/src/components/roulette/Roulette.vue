<template>
    <div>
        <Renderer :offset="roulette.random" :isSpinning="roulette.isSpinning" :nextSpinIn="roulette.nextSpinIn"></Renderer>

        <div class="px center aligned">
            <p>
                MONTANT DU PARI
            </p>
            <div class="ui right labeled left input">
                <input type="number" placeholder="Votre pari" v-model="amount">

                <a class="ui label red" @click="decrease(1000)">-1000</a>
                <a class="ui label red" @click="decrease(100)">-100</a>
                <a class="ui label red" @click="decrease(10)">-10</a>
                <a class="ui label green" @click="increase(10)">+10</a>
                <a class="ui label green" @click="increase(100)">+100</a>
                <a class="ui label green" @click="increase(1000)">+1000</a>
                <a class="ui label gray" @click="raz()">RàZ</a>
            </div>

            <br>

            <div class="ui inverted statistic">
                <div class="value">
                    <AnimatedNumber :number="roulette.jackpot" />
                </div>
                <div class="label">
                    <i class="ui database icon"></i> JACKPOT
                </div>
            </div>
        </div>

        <br>

        <div class="ui equal width grid">
            <div class="column">
                <div class="ui inverted segment red center aligned">
                    <button class="ui inverted button" :disabled="roulette.isSpinning" @click="bet('red')">
                        <i class="ui diamond icon"></i> PARIER SUR ROUGE
                    </button>
                </div>

                <div class="ui inverted red vertical list">
                    <div class="item" v-for="bet of bets.red">
                        <i class="ui middle aligned user icon"></i>
                        <div class="content">
                            <div class="header">
                                <Bet :nick="bet.client.nick" :amount="bet.amount" :luck="bet.luck" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="column">
                <div class="ui inverted segment green center aligned">
                    <button class="ui inverted button" :disabled="roulette.isSpinning" @click="bet('green')">
                        <i class="ui diamond icon"></i> PARIER SUR VERT
                    </button>
                </div>

                <div class="ui inverted vertical list">
                    <div class="item" v-for="bet of bets.green">
                        <i class="ui middle aligned user icon"></i>
                        <div class="content">
                            <div class="header">
                                <Bet :nick="bet.client.nick" :amount="bet.amount" :luck="bet.luck" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="column">
                <div class="ui inverted segment black center aligned">
                    <button class="ui inverted button" :disabled="roulette.isSpinning" @click="bet('black')">
                        <i class="ui diamond icon"></i> PARIER SUR NOIR
                    </button>
                </div>

                <div class="ui inverted vertical list">
                    <div class="item" v-for="bet of bets.black">
                        <i class="ui middle aligned user icon"></i>
                        <div class="content">
                            <div class="header">
                                <Bet :nick="bet.client.nick" :amount="bet.amount" :luck="bet.luck" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="column">
                <Connected></Connected>
            </div>
        </div>
    </div>
</template>

<script>
    import NumberComponent from './Number.vue'
    import ConnectedComponent from './Connected.vue'

    import AnimatedNumber from '../AnimatedNumber.vue'
    import Bet from './labels/Bet.vue'
    import Renderer from './Renderer.vue'

    import AccountStore from '../../stores/AccountStore'
    import BetsStore from './stores/BetsStore'

    import Connection from '../../classes/Connection'

    let Socket = Connection.GetSocket()

    let RouletteStore = {
        jackpot: 0,
        isSpinning: false
    }

    export default {
        components: {
            Number: NumberComponent,
            AnimatedNumber: AnimatedNumber,
            Connected: ConnectedComponent,
            Renderer: Renderer,
            Bet: Bet
        },
        data () {
            return {
                amount: 0,
                bets: BetsStore.state,
                roulette: RouletteStore
            }
        },
        methods: {
            decrease (qty) {
                if (this.amount >= qty)
                    this.amount = parseInt(this.amount, 10) - qty
            },
            increase (qty) {
                if (this.amount + qty < AccountStore.state.experience) {
                    this.amount = parseInt(this.amount, 10) + qty
                }
            },
            raz () {
                this.amount = 0
            },
            bet (type) {
                Socket.emit('roulette.bet', { type: type, amount: this.amount })
            }
        }
    }

    Socket.on('roulette.bets', (payload) => {
        BetsStore.state.red = payload.red
        BetsStore.state.green = payload.green
        BetsStore.state.black = payload.black
    })

    Socket.on('roulette.jackpot', jackpot => {
        RouletteStore.jackpot = jackpot
    })

    Socket.on('roulette.status', data => {
        RouletteStore.isSpinning = data.isSpinning
    })
</script>