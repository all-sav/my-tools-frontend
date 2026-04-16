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
    loadFromStorage() {
      this.backendProjectId = localStorage.getItem('settings_backendProjectId') || ''
      this.frontendProjectId = localStorage.getItem('settings_frontendProjectId') || ''
      this.backendStandBranch = localStorage.getItem('settings_backendStandBranch') || ''
      this.frontendStandBranch = localStorage.getItem('settings_frontendStandBranch') || ''
      this.ciMainBranch = localStorage.getItem('settings_ciMainBranch') || ''
      this.requiredPrefix = localStorage.getItem('settings_requiredPrefix') || ''
      this.prefix = localStorage.getItem('settings_prefix') || ''
      this.ciPrefix = localStorage.getItem('settings_ciPrefix') || ''
      try {
        const raw = localStorage.getItem('settings_dockerComposePaths')
        this.dockerComposePaths = raw ? JSON.parse(raw) : []
      } catch (_e) {
        this.dockerComposePaths = []
      }
    },

    saveToStorage() {
      localStorage.setItem('settings_backendProjectId', this.backendProjectId)
      localStorage.setItem('settings_frontendProjectId', this.frontendProjectId)
      localStorage.setItem('settings_backendStandBranch', this.backendStandBranch)
      localStorage.setItem('settings_frontendStandBranch', this.frontendStandBranch)
      localStorage.setItem('settings_ciMainBranch', this.ciMainBranch)
      localStorage.setItem('settings_requiredPrefix', this.requiredPrefix)
      localStorage.setItem('settings_prefix', this.prefix)
      localStorage.setItem('settings_ciPrefix', this.ciPrefix)
      localStorage.setItem('settings_dockerComposePaths', JSON.stringify(this.dockerComposePaths || []))
    },

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
      this.saveToStorage()
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
      this.saveToStorage()
    }
  }
})