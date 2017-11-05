import Levels from '../classes/Levels'

class AccountStore {
    constructor() {
        this.state = {
            token: '',
            nickname: '',
            experience: 0,
            mail: '',
            level: 1,
            latency: 999
        }
    }

    setExperience (experience) {
        this.state.experience = experience
        this.state.level = Levels.GetLevel(this.state.experience)
    }
}

export default new AccountStore ()