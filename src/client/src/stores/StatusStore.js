class StatusStore {
    constructor () {
        return {
            state: 'EN ATTENTE',
            current: null,
            times: { elapsed: 0, duration: 0 }
        }
    }
}

export default new StatusStore()