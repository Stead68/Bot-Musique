<template>
    <div>
        <div class="ui inverted segment violet center aligned">
            <div class="ui inverted button">
                <i class="ui users icon"></i> Utilisateurs connectés
            </div>
        </div>

        <div class="ui inverted vertical list">
            <div class="item" v-for="client of connected.users">
                <i class="ui middle aligned user icon"></i>
                <div class="content">
                    <div class="header">
                        <UserLabel :username="client.nick" :experience="client.experience" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ConnectedStore from '../../stores/ConnectedStore'
    import UserLabel from '../labels/User.vue'

    export default {
        components: {
            UserLabel: UserLabel
        },
        data () {
            return {
                connected: ConnectedStore
            }
        }
    }
</script>