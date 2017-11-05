<template>
    <div>
        <div class="ui horizontal inverted divider">
            File d'attente
        </div>

        <span v-if="queue.tracks.length == 0">Il n'y a aucune musique dans la file d'attente.</span>

        <div class="ui relaxed divided inverted list">
            <div class="item" v-for="track of queue.tracks">
                <i class="large music middle aligned icon"></i>
                <div class="content">
                    <a class="header" v-bind:href="track.link">{{ track.title }}</a>
                    <div class="description">Ajouté par <UserLabel :username="track.owner.nick" :experience="track.owner.experience" /></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Connection from '../../classes/Connection'
    import QueueStore from '../../stores/QueueStore'
    import UserLabel from '../labels/User.vue'

    let Socket = Connection.GetSocket()

    export default {
        components: { UserLabel },
        data () {
            return {
                queue: QueueStore
            }
        }
    }

    Socket.on('queue', (tracks) => {
        QueueStore.tracks = tracks
    })
</script>