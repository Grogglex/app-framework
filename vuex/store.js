let Vue = require('vue')
let Vuex = require('vuex')

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

store  = new Vuex.Store({
  modules: {
  },
  strict: debug
})

module.exports = store
