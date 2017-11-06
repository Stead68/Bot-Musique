const NUMBERS = [
    { number: 0, color: 'green' },
    { number: 32, color: 'red' },
    { number: 15, color: 'black' },
    { number: 19, color: 'red' },
    { number: 4, color: 'black' },
    { number: 21, color: 'red' },
    { number: 2, color: 'black' },
    { number: 25, color: 'red' },
    { number: 17, color: 'black' },
    { number: 34, color: 'red' },
    { number: 6, color: 'black' },
    { number: 27, color: 'red' },
    { number: 13, color: 'black' },
    { number: 36, color: 'red' },
    { number: 11, color: 'black' },
    { number: 30, color: 'red' },
    { number: 8, color: 'black' },
    { number: 23, color: 'red' },
    { number: 10, color: 'black' },
    { number: 5, color: 'red' },
    { number: 24, color: 'black' },
    { number: 16, color: 'red' },
    { number: 33, color: 'black' },
    { number: 1, color: 'red' },
    { number: 20, color: 'black' },
    { number: 14, color: 'red' },
    { number: 31, color: 'black' },
    { number: 9, color: 'red' },
    { number: 22, color: 'black' },
    { number: 18, color: 'red' },
    { number: 29, color: 'black' },
    { number: 7, color: 'red' },
    { number: 28, color: 'black' },
    { number: 12, color: 'red' },
    { number: 35, color: 'black' },
    { number: 3, color: 'red' },
    { number: 26, color: 'black' }
]

const ONE_TURN_AND_HALF = 5500
const FULL_TURN_WIDTH = 3700

const JACKPOT_THRESHOLD = 30000

class Roulette {
    static Init () {
        Roulette.IsSpinning = false
        Roulette.NextSpinIn = Date.now()
        Roulette.Bets = {  }
        Roulette.LastRewards = [ ]
        Roulette.Jackpot = 66241

        Roulette._Spin()
    }

    static _Spin () {
        Roulette.IsSpinning = true
        Roulette.NextSpinIn = Date.now()
        Roulette._BroadcastStatus()

        let random = Math.floor(Math.random() * FULL_TURN_WIDTH)
        let pickedCase = Math.floor((random % FULL_TURN_WIDTH) / 100)
        let picked = NUMBERS[pickedCase]

        io.emit('roulette.spin', { random: random, picked: picked })

        setTimeout(Roulette._EndSpin, 10000, picked)
    }

    static _EndSpin (picked) {
        // Compute rewards
        let jackpotWon = false
        let jackpotWinner = null

        let gained = []
        let lost = []

        for (let token in Roulette.Bets) {
            let betPool = Roulette.Bets[token]

            for (let k in betPool) {
                let bet = betPool[k]

                if (picked.color === bet.type) {
                    let client = bet.client

                    client.AddExperience(bet.reward)
                    console.log(`|ROULETTE| ${bet.client.username} à gagné !`)

                    // Compute jackpot rand
                    let luck = bet.luck
                    let rand = Math.random() * 100

                    if (rand <= luck) {
                        jackpotWon = true
                        jackpotWinner = client
                        client.AddExperience(Math.floor(Roulette.Jackpot * 0.70))
                    } else {
                        gained.push(bet)
                    }
                } else {
                    lost.push(bet)
                }
            }
        }

        if (jackpotWon) {
            let gainedPool = Roulette.Jackpot * 0.20
            let lostPool = Roulette.Jackpot * 0.10

            let gainedReward = Math.round(gainedPool / gained.length)
            let lostReward = Math.round(lostPool / lost.length)

            for (let k of gained) {
                gained[k].client.AddExperience(gainedReward)
            }

            for (let k of lost) {
                lost[k].client.AddExperience(lostReward)
            }

            if (gained.length === 0)
                jackpotWinner.AddExperience(gainedPool)

            if (lost.length === 0)
                jackpotWinner.AddExperience(lostPool)

            Roulette.Jackpot = 0
        }

        Roulette.Bets = { }
        Roulette.IsSpinning = false
        Roulette.NextSpinIn = Date.now() + 15000

        Roulette._BroadcastBets()
        Roulette._BroadcastStatus()
        Player.BroadcastConnected()

        setTimeout(Roulette._Spin, 15000)
    }

    static Plug(socket) {
        Roulette._BroadcastBets(socket)
        Roulette._BroadcastStatus(socket)
        Roulette._BroadcastJackpot(socket)

        socket.on('roulette.bet', async payload => {
            // A spin is in progress...
            if (Roulette.IsSpinning)
                return

            let client = Clients[Sockets[socket.id]]

            // Client is not signed-in.
            if (client === undefined)
                return

            if (isNaN(parseInt(payload.amount, 10)) || payload.amount <= 0)
                return

            payload.amount = Math.ceil(parseInt(payload.amount, 10))

            // Client doesn't have enough experience to bet.
            if (payload.amount > client.experience)
                return

            /**
             * Place bet into pool.
             */
            let betPool = Roulette.Bets[client.token] = Roulette.Bets[client.token] || { }

            // Disable the ability to bet in red and black at the same time.
            if ((payload.type === 'red' && betPool.black !== undefined) || (payload.type === 'black' && betPool.red !== undefined))
                return

            if (betPool[payload.type]) {
                betPool[payload.type].setAmount(betPool[payload.type].amount + payload.amount)
            } else {
                betPool[payload.type] = new Bet(client, payload.type, payload.amount)
            }

            Roulette.Jackpot += payload.amount / 50

            client.RemoveExperience(payload.amount)
            Roulette._BroadcastBets()
            Roulette._BroadcastJackpot()
        })
    }

    static _BroadcastStatus(socket = null) {
        let payload = {
            isSpinning: Roulette.IsSpinning,
            nextSpinIn: Roulette.NextSpinIn - Date.now()
        }

        if (socket) {
            socket.emit('roulette.status', payload)
        } else {
            io.emit('roulette.status', payload)
        }
    }

    static _BroadcastBets () {
        let payload = {
            red: [ ],
            green: [ ],
            black: [ ]
        }

        for (let token in Roulette.Bets) {
            let betPool = Roulette.Bets[token]

            for (let k in betPool) {
                let bet = betPool[k]

                payload[bet.type].push(bet.serialize())
            }
        }

        io.emit('roulette.bets', payload)
    }

    static _BroadcastJackpot() {
        io.emit('roulette.jackpot', Math.round(Roulette.Jackpot))
    }
}

class Bet {
    constructor (client, type, amount) {
        this.client = client
        this.type = type

        // Will be set in setAmount method.
        this.reward = 0
        this.luck = 0

        this.setAmount(amount)
    }

    setAmount (amount) {
        this.amount = amount

        switch (this.type) {
            case 'red':
            case 'black':
                this.reward = this.amount * 2
                break
            case 'green':
                this.reward = this.amount * 35
                break
        }

        this.luck = (1 - Math.pow(0.99, (this.reward / JACKPOT_THRESHOLD))) * 100
    }

    serialize () {
        return {
            client: this.client.serialize(),
            type: this.type,
            amount: this.amount,
            reward: this.reward,
            luck: this.luck
        }
    }
}

module.exports = Roulette