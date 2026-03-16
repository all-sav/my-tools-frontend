<template>
  <div class="settings-container">
    <h2>⚙️ Настройки Mergenator</h2>
    <p class="settings-subtitle">Параметры подключения к GitLab и настройки веток</p>

    <div class="settings-grid">
      <!-- GitLab Project IDs -->
      <div class="settings-group">
        <h3>GitLab Project IDs</h3>
        <div class="settings-field">
          <label>Backend Project ID</label>
          <input 
            type="text" 
            v-model="settings.backendProjectId" 
            placeholder="21"
            @input="debouncedSave"
          />
        </div>
        <div class="settings-field">
          <label>Frontend Project ID</label>
          <input 
            type="text" 
            v-model="settings.frontendProjectId" 
            placeholder="22"
            @input="debouncedSave"
          />
        </div>
      </div>

      <!-- Stand Branches -->
      <div class="settings-group">
        <h3>Стендовые ветки</h3>
        <div class="settings-field">
          <label>Backend Stand Branch</label>
          <input 
            type="text" 
            v-model="settings.backendStandBranch" 
            placeholder="my-backend-branch-on-server"
            @input="debouncedSave"
          />
        </div>
        <div class="settings-field">
          <label>Frontend Stand Branch</label>
          <input 
            type="text" 
            v-model="settings.frontendStandBranch" 
            placeholder="my-frontend-branch-on-server"
            @input="debouncedSave"
          />
        </div>
      </div>

      <!-- CI Settings -->
      <div class="settings-group">
        <h3>CI настройки</h3>
        <div class="settings-field">
          <label>CI Main Branch</label>
          <input 
            type="text" 
            v-model="settings.ciMainBranch" 
            placeholder="my-branch-with-addons"
            @input="debouncedSave"
          />
        </div>
      </div>

      <!-- Prefixes -->
      <div class="settings-group">
        <h3>Префиксы веток</h3>
        <div class="settings-field">
          <label>Prefix</label>
          <input 
            type="text" 
            v-model="settings.prefix" 
            placeholder="prefix-for-branches/"
            @input="debouncedSave"
          />
        </div>
        <div class="settings-field">
          <label>CI Prefix</label>
          <input 
            type="text" 
            v-model="settings.ciPrefix" 
            placeholder="CI-"
            @input="debouncedSave"
          />
        </div>
        <div class="settings-field">
          <label>Required Prefix</label>
          <input 
            type="text" 
            v-model="settings.requiredPrefix" 
            placeholder="prefix-for-branches/TASK-"
            @input="debouncedSave"
          />
        </div>
      </div>
    </div>

    <!-- Индикатор сохранения -->
    <div class="settings-footer">
      <div class="save-status" :class="{ 'saved': saveStatus === 'saved', 'error': saveStatus === 'error' }">
        <span v-if="saveStatus === 'saving'">💾 Сохранение...</span>
        <span v-else-if="saveStatus === 'saved'">✅ Сохранено</span>
        <span v-else-if="saveStatus === 'error'">❌ Ошибка сохранения</span>
        <span v-else> </span>
      </div>
      <button class="reset-btn" @click="resetToDefaults" :disabled="!settings.isConfigured">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M9 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Сбросить
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { debounce } from 'lodash-es'
import { settingsApi } from '@/services/api'
import { convertKeysToCamel, convertKeysToSnake } from '@/utils/caseConverter'

const settings = useSettingsStore()
const saveStatus = ref('')
const isLoading = ref(true)

// Загружаем настройки при монтировании
onMounted(() => {
  loadFromRemote()
})

const loadFromRemote = async () => {
  isLoading.value = true
  try {
    const response = await settingsApi.getByModule("mergenator") // todo: Нужно загружать все настройки(но пока у нас жеж только один модуль)
    if (response.data.success) {
      settings.updateFromObject(convertKeysToCamel(response.data.data))
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
    settings.loadFromStorage()
  } finally {
    isLoading.value = false
  }
}

const saveToRemote = async () => {
  saveStatus.value = 'saving'
  try {
    const data = convertKeysToSnake({
      backend_project_id: settings.backendProjectId,
      frontend_project_id: settings.frontendProjectId,
      backend_stand_branch: settings.backendStandBranch,
      frontend_stand_branch: settings.frontendStandBranch,
      ci_main_branch: settings.ciMainBranch,
      required_prefix: settings.requiredPrefix,
      prefix: settings.prefix,
      ci_prefix: settings.ciPrefix
    })
    await settingsApi.save("mergenator", data)
    saveStatus.value = 'saved'
    settings.saveToStorage()
    setTimeout(() => {
      if (saveStatus.value === 'saved') saveStatus.value = ''
    }, 2000)
  } catch (error) {
    console.error('Failed to save settings:', error)
    saveStatus.value = 'error'
    setTimeout(() => {
      if (saveStatus.value === 'error') saveStatus.value = ''
    }, 2000)
  }
}

// Дебаунс для сохранения (чтобы не сохранять при каждом символе)
const debouncedSave = debounce(async () => {
  await saveToRemote()
}, 500)

const resetToDefaults = () => {
  if (confirm('Сбросить все настройки? Это действие нельзя отменить.')) {
    settings.resetToDefaults()
    saveStatus.value = 'saved'
    setTimeout(() => {
      if (saveStatus.value === 'saved') saveStatus.value = ''
    }, 2000)
  }
}
</script>

<style scoped>
.settings-container {
  color: #a9b7c6;
  font-family: 'JetBrains Mono', monospace;
}

.settings-container h2 {
  color: #00ff9d;
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 12px;
  border-left: 3px solid #7d3cff;
  padding-left: 16px;
}

.settings-subtitle {
  color: #8f9aa3;
  font-size: 12px;
  margin-bottom: 12px;
  margin-left: 19px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.settings-group {
  background: #1e1f22;
  border: 1px solid #3d6857;
  padding: 16px;
}

.settings-group h3 {
  color: #00ff9d;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #3d6857;
  padding-bottom: 8px;
  margin: 0px 0 8px 0;
}

.settings-field {
  margin-bottom: 12px;
}

.settings-field label {
  display: block;
  color: #8f9aa3;
  font-size: 11px;
  text-transform: uppercase;
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}

.settings-field input {
  width: 100%;
  background: #0a0c0e;
  border: 1px solid #3d6857;
  padding: 10px 12px;
  color: #a9b7c6;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  transition: all 0.2s ease;
}

.settings-field input:focus {
  outline: none;
  border-color: #00ff9d;
  box-shadow: 0 0 0 1px rgba(0, 255, 157, 0.3);
}

.settings-field input::placeholder {
  color: #5f6a70;
  font-style: italic;
  opacity: 0.5;
}

.settings-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #3d6857;
}

.save-status {
  font-size: 12px;
  color: #8f9aa3;
}

.save-status.saved {
  color: #00ff9d;
}

.save-status.error {
  color: #f28b82;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #7d3cff;
  color: #7d3cff;
  padding: 6px 12px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover:not(:disabled) {
  background-color: rgba(125, 60, 255, 0.1);
}

.reset-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: #8f9aa3;
  color: #8f9aa3;
}

.reset-btn svg {
  stroke: currentColor;
}
</style>