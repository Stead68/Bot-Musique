<template>
    <div class="number" :class="[ number.color ]" :style="{ left: left }">
        {{ number.number }}
    </div>
</template>

<script>
    export default {
        props: {
            position: Number,
            number: Object,
            offset: Number
        },
        computed: {
            left: function () {
                return ((this.position * 100) - this.offset) + 'px'
            }
        }
    }
</script>

<style>
    .number {
        width: 100px;
        height: 100px;
        text-align: center;
        vertical-align: middle;
        font-size: 50px;
        padding-top: 40px;
        float: left;
        position: absolute;
    }

    .number.green {
        background: #21ba45;
    }

    .number.red {
        background: #db2828;
    }

    .number.black {
        background: #1b1c1d;
    }
</style>