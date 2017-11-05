<template>
    <span>{{ displayNumber | humanify }}</span>
</template>

<script>
    export default {
        props: {
            number: { type: Number, default: 0 }
        },
        data () {
            return {
                interval: false,
                displayNumber: 0
            }
        },
        mounted () {
            this.increment()
        },
        watch: {
            number: function () {
                this.increment()
            }
        },
        methods: {
            increment () {
                clearInterval(this.interval)

                if (this.number == this.displayNumber) {
                    return
                }

                this.interval = window.setInterval((function () {
                    if (this.displayNumber != this.number) {
                        let change = (this.number - this.displayNumber) / 10
                        change = change >= 0 ? Math.ceil(change) : Math.floor(change)

                        this.displayNumber = this.displayNumber + change
                    }
                }).bind(this), 20);
            }
        },
        filters: {
            humanify: function (value) {
                return value.toLocaleString()
            }
        }
    }
</script>