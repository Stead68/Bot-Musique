<template>
    <span>
        <span class="ui violet label">{{ nick }}</span>
        <i class="ui star icon"></i><AnimatedNumber :number="amount" />
        <i class="ui database icon"></i>{{ (luck).toFixed(3) }} <i class="ui percent icon"></i>
    </span>
</template>

<script>
    import AnimatedNumber from '../../AnimatedNumber.vue'

    export default {
        components: { AnimatedNumber },
        props: {
            nick: { type: String },
            amount: { type: Number },
            luck: { type: Number }
        },
        computed: {
            level: function () {
                return Levels.GetLevel(this.experience)
            }
        }
    }
</script>