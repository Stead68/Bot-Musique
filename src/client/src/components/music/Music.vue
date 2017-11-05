<template>
    <div>
        <div class="ui grid">
            <div class="ui eight wide column">
                <Submit></Submit>
                <Queue></Queue>
                <History></History>
            </div>
            <div class="ui four wide column">
                <Controle></Controle>
                <Busted></Busted>
            </div>
            <div class="ui four wide column">
                <Profil></Profil>
                <Connected></Connected>
            </div>
        </div>
        <div class="ui basic modal px center aligned" id="receiving-data">
            <div class="header"><i class="ui cloud download icon"></i></div>
            <div class="content">
                Synchronisation en cours...
            </div>
        </div>
    </div>
</template>

<script>
    import SubmitComponent from './Submit.vue'
    import QueueComponent from './Queue.vue'
    import HistoryComponent from './History.vue'
    import ControleComponent from './Controle.vue'
    import BustedComponent from './Busted.vue'
    import ProfilComponent from './Profil.vue'
    import ConnectedComponent from './Connected.vue'

    import AccountStore from '../../stores/AccountStore'
    import ConnectedStore from '../../stores/ConnectedStore'

    import Connection from '../../classes/Connection'

    let Socket = Connection.GetSocket()

    export default {
        name: 'App',
        components: {
            Submit: SubmitComponent,
            Queue: QueueComponent,
            History: HistoryComponent,
            Controle: ControleComponent,
            Busted: BustedComponent,
            Profil: ProfilComponent,
            Connected: ConnectedComponent
        }
    }

    Socket.on('logged', () => {
        $('#receiving-data').modal('hide')
    })
</script>

<style>
    .fade-enter-active, .fade-leave-active {
        transition: opacity 1s
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0
    }
</style>