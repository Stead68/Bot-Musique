<template>
    <div>
        <canvas id="renderer"></canvas>
    </div>
</template>

<script>
    import Numbers from './constants/Numbers'
    import Connection from '../../classes/Connection'

    const Socket = Connection.GetSocket()

    let RendererStore = {
        isMounted: false,
        isReady: false,
        random: 0,
        picked: null,
        rouletteAnimation: {
            i: 0,
            ti: 0,
            sv: 0,
            fv: 0,
            offset: 0
        },
        context: {
            rendered: Date.now()
        }
    }

    export default {
        data () {
            return {
                state: RendererStore,
            }
        },
        mounted () {
            this.state.isMounted = true

            if (!this.state.isSpinning)
                this.state.isReady = true

            this.renderer = document.querySelector('#renderer')
            this.context = this.renderer.getContext('2d')

            this.render()
        },
        destroyed () {
            this.state.isMounted = false
            this.state.isReady = false
        },
        methods: {
            render: function () {
                if (!this.state.isMounted)
                    return

                // Resize canvas
                this.renderer.width = this.renderer.offsetWidth
                this.renderer.height = this.renderer.offsetHeight

                const TITLE_OFFSET = 20
                const SUBTITLE_OFFSET = 40
                const ROULETTE_OFFSET = 80

                const CENTER_X = Math.round(this.renderer.offsetWidth / 2)

                const ELAPSED = Date.now() - this.state.context.rendered

                const COLORS = {
                    red: '#db2828',
                    green: '#21ba45',
                    black: '#1b1c1d'
                }

                if (this.state.rouletteAnimation.ti) {
                    // Compute offset
                    let fv = (this.state.random + 3700 * 2) - CENTER_X

                    let iterations = Date.now() - this.state.rouletteAnimation.i

                    if (iterations > this.state.rouletteAnimation.ti)
                        iterations = this.state.rouletteAnimation.ti

                    this.state.rouletteAnimation.offset = Math.easeOutCubic(iterations, this.state.rouletteAnimation.sv, fv, this.state.rouletteAnimation.ti)
                } else {
                    this.state.rouletteAnimation.offset = 0
                }

                // Draw cases
                for (let i = 0; i < Numbers.length; i++) {
                    let n = Numbers[i]

                    let x = (i * 100) - (this.state.rouletteAnimation.offset % 3700)
                    let w = 100

                    let tx = x

                    if (x < 0 && x > -100) {
                        x = 0
                        w = x + 100
                    }

                    let fillColor = COLORS[n.color]

                    this.context.fillStyle = fillColor
                    this.context.fillRect(x, ROULETTE_OFFSET, x + w, 100)
                    this.context.font = '40px Arial'
                    this.context.textAlign = 'center'
                    this.context.fillStyle = '#ffffff'
                    this.context.fillText(n.number, tx + 50, ROULETTE_OFFSET + 65)
                }

                // Draw HUD
                this.context.lineWidth = 1
                this.context.strokeStyle = '#333333'

                this.context.beginPath() // Ligne 1
                this.context.moveTo(0, ROULETTE_OFFSET - 10)
                this.context.lineTo(CENTER_X - 20, ROULETTE_OFFSET - 10)
                this.context.stroke()

                this.context.beginPath() // Ligne 2
                this.context.moveTo(CENTER_X + 20, ROULETTE_OFFSET - 10)
                this.context.lineTo(this.renderer.width, ROULETTE_OFFSET - 10)
                this.context.stroke()

                this.context.beginPath() // Ligne 3
                this.context.moveTo(0, ROULETTE_OFFSET + 110)
                this.context.lineTo(CENTER_X - 20, ROULETTE_OFFSET + 110)
                this.context.stroke()

                this.context.beginPath() // Ligne 4
                this.context.moveTo(CENTER_X + 20, ROULETTE_OFFSET + 110)
                this.context.lineTo(this.renderer.width, ROULETTE_OFFSET + 110)
                this.context.stroke()

                this.context.lineWidth = 1
                this.context.strokeStyle = '#ffffff'

                this.context.beginPath() // Triangle 1
                this.context.moveTo(CENTER_X - 5, ROULETTE_OFFSET - 12)
                this.context.lineTo(CENTER_X + 5, ROULETTE_OFFSET - 12)
                this.context.lineTo(CENTER_X, ROULETTE_OFFSET - 7)
                this.context.lineTo(CENTER_X - 5, ROULETTE_OFFSET - 12)
                this.context.fill()

                this.context.beginPath() // Triangle 2
                this.context.moveTo(CENTER_X - 5, ROULETTE_OFFSET + 112)
                this.context.lineTo(CENTER_X + 5, ROULETTE_OFFSET + 112)
                this.context.lineTo(CENTER_X, ROULETTE_OFFSET + 107)
                this.context.lineTo(CENTER_X - 5, ROULETTE_OFFSET + 112)
                this.context.fill()

                let title = ''
                let subtitle = ''

                let left = ((this.state.nextSpinIn - Date.now()) / 1000).toFixed(2)

                if (this.state.isSpinning) {
                    if (this.state.isReady) {
                        title = 'La roulette tourne'
                        subtitle = 'Un instant'
                    } else {
                        let ajusted = 15 + 10 + parseInt(left, 10)

                        title = `Un lancé est en cours`
                        subtitle = `Prochain lancé dans ${ajusted}s.`
                    }
                } else if (left < 12) {
                    title = `Prochain lancé dans ${left}s.`
                    subtitle = 'Préparez vos paris!'
                } else {
                    title = `Prochain lancé dans ${left}s.`

                    if (this.state.picked) {
                        this.context.fillStyle = COLORS[this.state.picked.color]
                        this.context.fillRect(CENTER_X - 50, SUBTITLE_OFFSET - 15, 100, 20)

                        subtitle = 'NUMÉRO ' + this.state.picked.number
                    } else {
                        subtitle = 'Préparez vos paris!'
                    }
                }

                // Draw title
                this.context.fillStyle = "#ffffff"
                this.context.font = 'lighter 25px Arial'
                this.context.fillText(title, CENTER_X, TITLE_OFFSET)

                // Draw subtitle
                this.context.font = '15px Arial'
                this.context.fillText(subtitle, CENTER_X, SUBTITLE_OFFSET)

                // Draw progress
                let width = 0

                if (!this.state.isSpinning && left > 0) {
                    width = Math.round(left / 15 * this.renderer.width)
                }

                if (this.state.isSpinning && left < 0) {
                    width = Math.round(Math.abs(left) / 10 * this.renderer.width)
                }

                let x = (this.renderer.width - width) / 2

                this.context.beginPath()
                this.context.moveTo(x, ROULETTE_OFFSET - 25)
                this.context.lineTo(x + width, ROULETTE_OFFSET - 25)
                this.context.lineWidth = 4
                this.context.strokeStyle = '#6435c9'
                this.context.stroke()

                // Draw shadow
                let quart = this.renderer.width / 4

                let gradient_left = this.context.createLinearGradient(0, 0, quart, 0)
                    gradient_left.addColorStop(0, 'rgba(0, 0, 0, 1')
                    gradient_left.addColorStop(1, 'rgba(0, 0, 0, 0)')

                this.context.fillStyle = gradient_left
                this.context.fillRect(0, ROULETTE_OFFSET, quart, 100)

                let gradient_right = this.context.createLinearGradient(this.renderer.width - quart, 0, this.renderer.width, 0)
                    gradient_right.addColorStop(0, 'rgba(0, 0, 0, 0')
                    gradient_right.addColorStop(1, 'rgba(0, 0, 0, 1)')

                this.context.fillStyle = gradient_right
                this.context.fillRect(this.renderer.width - quart, ROULETTE_OFFSET, quart, 100)

                this.state.context.rendered = Date.now()
                requestAnimationFrame(this.render)
            }
        }
    }

    Socket.on('roulette.spin', (data) => {
        if (!RendererStore.isMounted)
            return

        RendererStore.isReady = true

        RendererStore.random = data.random
        RendererStore.picked = data.picked

        RendererStore.rouletteAnimation.i = Date.now() // Iterations count
        RendererStore.rouletteAnimation.ti = 10000 // Total iterations
        RendererStore.rouletteAnimation.sv = 0

    })

    Socket.on('roulette.status', (data) => {
        RendererStore.isSpinning = data.isSpinning
        RendererStore.nextSpinIn = data.nextSpinIn + Date.now()
    })

    Math.easeOutCubic = (currentIteration, startValue, changeInValue, totalIterations) => {
        return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 3) + 1) + startValue;
    }
</script>

<style>
    canvas {
        width: 100%;
        height: 200px;
    }
</style>