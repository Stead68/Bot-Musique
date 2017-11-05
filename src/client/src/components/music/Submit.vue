<template>
    <div>
        <div class="ui horizontal inverted divider">
            Lien YouTube de la vidéo
        </div>

        <div class="ui action input">
            <input placeholder="http://<lien de la vidéo>" type="text" v-model="link">

            <button class="ui orange button" v-on:click="SendLink">Envoyer</button>
        </div>
    </div>
</template>

<script>
    import Connection from '../../classes/Connection'

    export default {
        data () {
            return {
                link: ''
            }
        },
        methods: {
            SendLink () {
                if (this.link != '') {
                    Connection.GetSocket().emit('push', this.link)
                    this.link = ''
                }
            }
        }
    }
</script>

<style>
    .ui.action.input {
        width: 100%;
        height: 36px;
    }
    
    .ui.action.input input {
        background: rgba(0, 0, 0, 0.2);
        -webkit-border-radius: 0;
        -moz-border-radius: 0;
        border-radius: 0;
        color: #ffffff;
    }
    
    .ui.button.input .button {
        -webkit-border-radius: 0;
        -moz-border-radius: 0;
        border-radius: 0 !important;
    }
</style>