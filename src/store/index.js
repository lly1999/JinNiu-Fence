import { createStore } from 'vuex'
import ModuleFench from './fence'
import ModuleUser from './user'

export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    fence: ModuleFench,
    user: ModuleUser
  }
})
