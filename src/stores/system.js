import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', {
  state: () => ({
    activeComponents: {},
  }),

  actions: {
    isComponentActive(name) {
      return this.activeComponents.hasOwnProperty(name)
    },
    setComponentUnactive(name) {
      Reflect.deleteProperty(this.activeComponents, name)
    },
  },
})