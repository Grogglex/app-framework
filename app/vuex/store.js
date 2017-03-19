let Vue = require('vue')
let Vuex = require('vuex')

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

// Strict prevents modifying the store outside of
// the mutation methods. The store is available in
// components by using either maps(mapgetters/mapstate)
// or by directily referencing the store as this.$store
let store  = new Vuex.Store({
  modules: {
  },
  strict: debug
})

module.exports = store
