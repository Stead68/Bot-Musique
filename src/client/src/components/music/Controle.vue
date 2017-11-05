<script src="../../../dist/build.js"></script>
<template>
    <div class="px center aligned">
        <div class="ui horizontal inverted divider">{{ Status.state }}</div>
        <div v-if="Status.current">
            <a :href="Status.current.link">
                <b>{{ Status.current.title }}</b>
            </a>

            <br>
            <br>

            <UserLabel :username="Status.current.owner.nick" :experience="Status.current.owner.experience" />

            <br>
            <br>

            <span v-if="timesReceived">
                <i class="ui wait icon"></i><b>{{ Status.times.elapsed | timefy }} / {{ Status.times.duration | timefy }}</b>
            </span>

            <i class="ui star half empty icon"></i>XP ×{{ Status.current.multiplier }}

            <br>
            <br>

            <button class="ui orange button" v-on:click="Skip">
                <i class="ui fast forward icon"></i> SUIVANT
            </button>
        </div>
        <div v-else>Aucune musique en cours de lecture</div>
    </div>
</template>

<script>
    import Connection from '../../classes/Connection'
    import StatusStore from '../../stores/StatusStore'
    import UserLabel from '../labels/User.vue'

    export default {
        components: { UserLabel },
        data () {
            return {
                Status: StatusStore
            }
        },
        computed: {
            timesReceived: function () { return this.Status.times.duration > 0 }
        },
        methods: {
            Skip () {
                Socket.emit('skip')
            }
        },
        filters: {
            timefy: seconds => {
                let minutes = Math.floor(seconds / 60)
                    seconds = seconds % 60

                minutes = (minutes < 10) ? '0' + minutes : minutes
                seconds = (seconds < 10) ? '0' + seconds : seconds

                return `${minutes}:${seconds}`
            }
        }
    }

    let Socket = Connection.GetSocket()

    Socket.on('state', status => {
        StatusStore.state = status.state
        StatusStore.current = status.current
    })

    Socket.on('times', times => {
        StatusStore.times = times
    })
</script>