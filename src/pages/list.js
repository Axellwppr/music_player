import Vue from 'vue'
import App from './playList.vue'
import vuetify from '../plugins/vuetify'

Vue.config.productionTip = false;

new Vue({
    vuetify,
    render: function(h) { return h(App) }
}).$mount('#app')