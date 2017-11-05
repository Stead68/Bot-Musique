import Vue from 'vue'
import VueRouter from 'vue-router'

// Component
import Roulette from './components/roulette/Roulette.vue'
import Music from './components/music/Music.vue'
import Crash from './components/crash/Crash.vue'
import App from './components/App.vue'

// Initialise app
const Routes = [
    { name: 'music', path: '/', component: Music },
    { name: 'roulette', path: '/roulette', component: Roulette },
    { name: 'crash', path: '/crash', component: Crash }
]

const Router = new VueRouter({ routes: Routes })

Vue.use(VueRouter)

new Vue({
    router: Router,
    el: '#app',
    render: h => h(App)
})