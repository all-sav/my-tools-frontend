import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    backendProjectId: '',
    frontendProjectId: '',
    backendStandBranch: '',
    frontendStandBranch: '',
    ciMainBranch: '',
    requiredPrefix: '',
    prefix: '',
    ciPrefix: '',
    dockerComposePaths: []
  }),

  getters: {
    isConfigured: (state) => {
      return state.backendProjectId && 
             state.frontendProjectId && 
             state.backendStandBranch && 
             state.frontendStandBranch && 
             state.ciMainBranch && 
             state.requiredPrefix && 
             state.prefix && 
             state.ciPrefix
    }
  },

  actions: {
    updateFromObject(data) {
      this.backendProjectId = data.backendProjectId || ''
      this.frontendProjectId = data.frontendProjectId || ''
      this.backendStandBranch = data.backendStandBranch || ''
      this.frontendStandBranch = data.frontendStandBranch || ''
      this.ciMainBranch = data.ciMainBranch || ''
      this.requiredPrefix = data.requiredPrefix || ''
      this.prefix = data.prefix || ''
      this.ciPrefix = data.ciPrefix || ''
      this.dockerComposePaths = Array.isArray(data.dockerComposePaths) ? data.dockerComposePaths : []
    },

    resetToDefaults() {
      this.backendProjectId = ''
      this.frontendProjectId = ''
      this.backendStandBranch = ''
      this.frontendStandBranch = ''
      this.ciMainBranch = ''
      this.requiredPrefix = ''
      this.prefix = ''
      this.ciPrefix = ''
      this.dockerComposePaths = []
    }
  }
})