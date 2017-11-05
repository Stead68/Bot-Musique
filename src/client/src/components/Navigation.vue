<template>
    <div>
        <div class="ui top inverted fixed menu">
            <router-link to="/" class="item">Musique</router-link>
            <router-link to="/roulette" class="item">Roulette</router-link>

            <div class="right menu">
                <span class="item" v-if="connection.latency"><i class="ui exchange icon"></i> {{ connection.latency }}ms</span>
                <span class="item"><i class="ui star icon"></i> <AnimatedNumber :number="me.experience" /></span>
                <span class="item"><i class="ui user icon"></i> {{ me.nickname }}</span>
                <div class="item">
                    <button class="ui icon black button" @click="showConfig">
                        <i class="ui setting icon"></i>
                    </button>
                </div>
            </div>
        </div>
        <Config />
    </div>
</template>

<script>
    import Connection from '../classes/Connection'
    import AccountStore from '../stores/AccountStore'
    import AnimatedNumber from './AnimatedNumber.vue'
    import Config from './Config.vue'

    export default {
        components: { AnimatedNumber, Config },
        data () {
            return {
                me: AccountStore.state,
                connection: Connection.state
            }
        },
        methods: {
            showConfig () {
                this.$emit('config:show')
            }
        }
    }
</script>