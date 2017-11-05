const BASE_XP = 2000
const BASE_EXPONENT = 1.20
const MAX_LEVELS = 100

class Levels {
    constructor () {
        this.levels = [ ]

        for (let i = 0; i < MAX_LEVELS; i++)
            this.levels[i] = BASE_XP * Math.pow(i, BASE_EXPONENT)

        this.levels[this.levels.length] = Math.pow(2, 64)
    }

    GetLevel (experience) {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (experience >= this.levels[i])
                return i + 1
        }
    }

    GetThreshold (level) {
        return this.levels[level - 1]
    }
}

export default new Levels()