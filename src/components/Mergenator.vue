<template>
  <div class="mergenator-container">
    <!-- Табы для Mergenator -->
    <div class="fake-tabs" v-if="showTabs">
      <div
        v-for="tab in tabs"
        :key="tab.name"
        class="fake-tab"
        :class="{ 'active-tab': activeTab === tab.routeName }"
        @click="setActiveTab(tab)"
      >
        {{ tab.name }}
      </div>
    </div>

    <!-- Заголовок в зависимости от таба -->
    <h2>{{ activeTab === 'frontend' ? '🖥️ Frontend Merger' : '⚙️ Backend Merger' }}</h2>
    
    <!-- Форма создания MR -->
    <div class="mr-form">
      <div class="input-wrapper" :class="{ 'error': !isBranchNameValid && branchName }">
        <input 
          type="text" 
          v-model="branchName"
          placeholder="source_branch (например: feature/new-component)"
          :disabled="isLoading"
          @keyup.enter="createMR"
        />
      </div>
      
      <!-- Кнопки действий -->
      <div class="action-buttons">
        <button 
          @click="createMR" 
          :disabled="!isBranchNameValid || isLoading"
          class="btn-action btn-primary"
          :title="'Создать MR в ' + (activeTab === 'frontend' ? 'Frontend' : 'Backend')"
        >
          <span v-if="isLoading" class="spinner"></span>
          <template v-else>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V20M12 20L18 14M12 20L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Create MR
          </template>
        </button>
        
        <button 
          @click="deleteCIBranch" 
          :disabled="!isBranchNameValid || isLoading"
          class="btn-action btn-warning"
          title="Удалить CI ветку"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Delete CI branch
        </button>
        
        <button 
          @click="closeMR" 
          :disabled="!isBranchNameValid || isLoading"
          class="btn-action btn-danger"
          title="Закрыть MR"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Close MR
        </button>
      </div>
      
      <!-- Блок ошибки (всплывающий под инпутом) -->
      <transition name="slide-fade">
        <div v-if="errorMessage" class="error-popup">
          <span class="error-icon">⚠️</span>
          {{ errorMessage }}
        </div>
      </transition>
    </div>

    <!-- Терминал для вывода сообщений (в стиле PhpStorm) -->
    <div class="terminal">
      <div class="terminal-header">
        <div class="terminal-title">
          <span class="terminal-icon">▶</span>
          Console Output
        </div>
        <div class="terminal-actions">
          <button @click="clearTerminal" class="terminal-btn" title="Clear console">⌧</button>
        </div>
      </div>
      <div class="terminal-content" ref="terminalContent">
        <div v-for="(line, index) in terminalLines" :key="index" class="terminal-line" :class="line.type">
          <span class="terminal-prompt">{{ line.prompt }}</span>
          <span class="terminal-text">{{ line.text }}</span>
          <span v-if="line.details" class="terminal-details">{{ line.details }}</span>
        </div>
        <div v-if="!terminalLines.length" class="terminal-line terminal-empty">
          <span class="terminal-prompt">$</span>
          <span class="terminal-text">Ready to create merge requests...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import '@/assets/mergenator.css'
import '@/assets/terminal.css'

const route = useRoute()
const router = useRouter()

// Определяем props
const props = defineProps({
  tab: {
    type: String,
    default: 'frontend'
  }
})

// Флаг для показа табов
const showTabs = ref(true)

// Активная вкладка
const activeTab = ref('frontend')

// Состояния для формы MR
const branchName = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// Терминал
const terminalLines = ref([])
const terminalContent = ref(null)

// Список вкладок для Mergenator
const tabs = ref([
  { name: 'Frontend', routeName: 'frontend' },
  { name: 'Backend', routeName: 'backend' },
])

// Валидация названия ветки
const isBranchNameValid = computed(() => {
  return branchName.value && branchName.value.length >= 3
})

// Добавление строки в терминал
const addTerminalLine = (text, type = 'info', details = null) => {
  const prompt = type === 'error' ? '✗' : type === 'success' ? '✓' : '$'
  
  terminalLines.value.push({
    text,
    type,
    prompt,
    details,
    timestamp: new Date().toLocaleTimeString()
  })
  
  // Скролл вниз
  nextTick(() => {
    if (terminalContent.value) {
      terminalContent.value.scrollTop = terminalContent.value.scrollHeight
    }
  })
}

// Очистка терминала
const clearTerminal = () => {
  terminalLines.value = []
  addTerminalLine('Console cleared', 'system')
}

// Очистка ошибки
const clearError = () => {
  errorMessage.value = ''
}

// Создание MR
const createMR = async () => {
  if (!isBranchNameValid.value || isLoading.value) return

  isLoading.value = true
  clearError()

  const repo = activeTab.value === 'frontend' ? 'frontend' : 'backend'
  
  addTerminalLine(`create-mr --source-branch=${branchName.value} --repo=${repo}`, 'command')

  try {
    const response = await fetch('/api/merge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        source_branch: branchName.value,
        repo: repo,
        action: 'create'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(data);
    
    if (typeof data == 'object') {
      if (data.success === 'success') {
        addTerminalLine(data.message, 'success')
        branchName.value = ''
      } else {
        errorMessage.value = data.data.message
        addTerminalLine(`Error: ${data.data.message}`, 'error')
      }
    } else {
      errorMessage.value = 'Неверный формат ответа от сервера'
      addTerminalLine('Invalid server response format', 'error')
    } 

  } catch (error) {
    console.error('Ошибка при создании MR:', error)
    errorMessage.value = `Ошибка соединения: ${error.message}`
    addTerminalLine(`Connection error: ${error.message}`, 'error')
  } finally {
    isLoading.value = false
  }
}

// Удаление CI ветки
const deleteCIBranch = async () => {
  addTerminalLine(`Эта кнопка пока в разработке...`, 'system')
}

// Закрытие MR
const closeMR = async () => {
  addTerminalLine(`Эта кнопка пока в разработке...`, 'system')
}

// Установка активной вкладки и обновление URL
const setActiveTab = (tab) => {
  activeTab.value = tab.routeName
  
  clearError()
  addTerminalLine(`Switched to ${tab.name} repository`, 'system')
  
  router.push({
    name: 'mergenator-with-tab',
    params: { tab: tab.routeName }
  })
}

// Следим за изменением параметра tab в URL
watch(() => route.params.tab, (newTab) => {
  if (newTab) {
    const tabExists = tabs.value.some(t => t.routeName === newTab)
    if (tabExists) {
      activeTab.value = newTab
      clearError()
    } else {
      router.replace({
        name: 'mergenator-with-tab',
        params: { tab: 'frontend' }
      })
    }
  }
}, { immediate: true })

// При монтировании проверяем параметр из URL
onMounted(() => {
  if (route.params.tab) {
    const tabExists = tabs.value.some(t => t.routeName === route.params.tab)
    if (tabExists) {
      activeTab.value = route.params.tab
    }
  } else if (props.tab) {
    const tabExists = tabs.value.some(t => t.routeName === props.tab)
    if (tabExists) {
      activeTab.value = props.tab
    }
  }
  
  addTerminalLine('Mergenator v1.0 initialized', 'system')
  addTerminalLine('Type a branch name and click the arrow to create MR', 'system')
})
</script>
