<template>
    <span>
        <span class="ui violet label">{{ username }}</span> <i class="ui star icon"></i><AnimatedNumber :number="experience" /> <i class="ui trophy icon"></i>{{ level }}
    </span>
</template>

<script>
    import Levels from '../../classes/Levels'
    import AnimatedNumber from '../AnimatedNumber.vue'

    export default {
        components: { AnimatedNumber },
        props: {
            username: { type: String },
            experience: { type: Number }
        },
        computed: {
            level: function () {
                return Levels.GetLevel(this.experience)
            }
        }
    }
</script>