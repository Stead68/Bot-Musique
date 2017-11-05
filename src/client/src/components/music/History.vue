<template>
    <div>
        <div class="ui horizontal inverted divider">
            Historique
        </div>

        <span v-if="history.tracks.length == 0">Il n'y a aucune musique dans l'historique.</span>

        <div class="ui relaxed divided inverted list">
            <div class="item" v-for="track of history.tracks">
                <i class="large music middle aligned icon"></i>
                <div class="content">
                    <a class="header" v-bind:href="track.link">
                        {{ track.title }}
                        <div class="ui orange label" v-if="track.busted">Busted</div>
                        <div class="ui red label" v-if="track.blocked">Non disponible</div>
                    </a>
                    <div class="description">Ajouté par <UserLabel :username="track.owner.nick" :experience="track.owner.experience" /></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Connection from '../../classes/Connection'
    import HistoryStore from '../../stores/HistoryStore'
    import UserLabel from '../labels/User.vue'

    let Socket = Connection.GetSocket()

    export default {
        components: {
            UserLabel
        },
        data () {
            return {
                history: HistoryStore
            }
        }
    }

    Socket.on('history', tracks => {
        HistoryStore.tracks = tracks
    })
</script>