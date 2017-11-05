<template>
    <div>
        <canvas id="crash"></canvas>
    </div>
</template>

<script>
    let CrashStore = {
        isMounted: false,
        crashAnimation: {
            started: 0
        }
    }

    export default {
        data () {
            return {
                state: CrashStore
            }
        },
        mounted () {
            this.state.isMounted = true
            this.canvas = document.querySelector('#crash')
            this.context = this.canvas.getContext('2d')

            this.state.crashAnimation.started = Date.now()

            this.render()
        },
        destroyed () {
            this.state.isMounted = false
        },
        methods: {
            render () {
                if (!this.state.isMounted)
                    return

                this.canvas.width = this.canvas.offsetWidth
                this.canvas.height = this.canvas.offsetHeight

                // Draw axis
                this.context.strokeStyle = 'white'
                this.context.lineWidth = 1

                this.context.beginPath()
                this.context.moveTo(50, 50)
                this.context.lineTo(50, this.canvas.height - 50)
                this.context.stroke()

                this.context.beginPath()
                this.context.moveTo(50, this.canvas.height - 50)
                this.context.lineTo(this.canvas.width - 50, this.canvas.height - 50)
                this.context.stroke()


                requestAnimationFrame(this.render)
            },
            exponential(t) {
                return Math.exp(t/18000)
            }
        }
    }
</script>

<style>
    #crash {
        width: 100%;
        height: 800px;
    }
</style>