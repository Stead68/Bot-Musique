<template>
    <div>
        <div class="ui horizontal inverted divider" v-if="votes.users.length > 0">
            Busted by
        </div>

        <div class="ui inverted vertical list">
            <div class="item" v-for="client of votes.users">
                <i class="ui user icon"></i>
                <div class="content">
                    <div class="header">{{ client.nick }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Connection from '../../classes/Connection'
    import BustedStore from '../../stores/BustedStore'

    let Socket = Connection.GetSocket()

    export default {
        data () {
            return {
                votes: BustedStore
            }
        }
    }

    Socket.on('votes', users => {
        BustedStore.users = users
    })
</script>

<style>
    .fade-enter-active {
        transition: opacity .5s
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0
    }
</style>