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

    <h2>
      <component :is="activeTab === 'frontend' ? IconFrontend : IconBackend" />
      {{ activeTab === 'frontend' ? 'Frontend Merger' : 'Backend Merger' }}
    </h2>
    
    <!-- Форма создания MR -->
    <div class="mr-form">
      <div class="input-wrapper" :class="{
        'error': apiError,
        'warn': branchName && !isBranchNameValid
      }">
        <input 
          type="text" 
          v-model="branchName"
          placeholder="source_branch (например: feature/new-component)"
          :disabled="isLoading"
          @keyup.enter="createMR"
        />
      </div>

      <!-- Подсказка о минимальной длине (только если поле непустое и невалидное) -->
      <div class="input-hint" v-if="branchName && !isBranchNameValid">
        <span class="hint-icon">ℹ️</span>
        <span>Минимум 3 символа</span>
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
            <IconMergeCreate />
            Create MR
          </template>
        </button>
        
        <button 
          @click="deleteCIBranch" 
          :disabled="!isBranchNameValid || isLoading"
          class="btn-action btn-warning"
          title="Удалить CI ветку"
        >
          <IconDeleteBranch />
          Delete CI branch
        </button>
        
        <button 
          @click="closeMR" 
          :disabled="!isBranchNameValid || isLoading"
          class="btn-action btn-danger"
          title="Закрыть MR"
        >
          <IconCloseMR />
          Close MR
        </button>
      </div>
      
      <!-- Блок ошибки -->
      <transition name="slide-fade">
        <div v-if="errorMessage" class="error-popup">
          <span class="error-icon">⚠️</span>
          <span v-html="errorMessage"></span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mergenatorApi } from '@/services/api'
import { useTerminalStore } from '@/stores/terminal'
import { useSystemStore } from '@/stores/system'

// Иконки
import IconFrontend from '@/components/icons/IconFrontend.vue'
import IconBackend from '@/components/icons/IconBackend.vue'
import IconMergeCreate from '@/components/icons/IconMergeCreate.vue'
import IconDeleteBranch from '@/components/icons/IconDeleteBranch.vue'
import IconCloseMR from '@/components/icons/IconCloseMR.vue'

import '@/assets/mergenator.css'

const route = useRoute()
const router = useRouter()
const terminal = useTerminalStore()
const systemStore = useSystemStore()
const apiError = ref(false)

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

// Список вкладок для Mergenator
const tabs = ref([
  { name: 'Frontend', routeName: 'frontend' },
  { name: 'Backend', routeName: 'backend' },
])

// Валидация названия ветки
const isBranchNameValid = computed(() => {
  return branchName.value && branchName.value.length >= 3
})

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

  terminal.isExpanded = true;

  if (!systemStore.isComponentActive('mergenator')) {
    systemStore.activeComponents.mergenator = true;
    terminal.system('Mergenator v2.0 initialized')
  }
})

onUnmounted(() => {
  terminal.isExpanded = false;
})

// Обработка ответа от API
const handleApiResponse = (response) => {
  apiError.value = false
  
  if (response.data && typeof response.data === 'object') {
    if (response.data.success === true) {
      if (response.data.data?.mrUrl) {
        terminal.success("Merge Request успешно создан:\n<a href=\""+response.data.data.mrUrl+"\" target=\"_blank\">"+response.data.data.mrUrl+"</a>")
      } else {
        terminal.success(response.data.data?.message || 'Операция выполнена успешно')
      }
      return true
    } else {
      apiError.value = true
      let errorMsg = 'Неизвестная ошибка'
      
      if (response.data.data?.message) {
        errorMsg = response.data.data.message
      } else if (response.data.message) {
        errorMsg = response.data.message
      }
      
      errorMessage.value = errorMsg.replace(/<[^>]*>/g, '')
      terminal.error(errorMsg)
      return false
    }
  } else {
    errorMessage.value = 'Неверный формат ответа от сервера'
    terminal.error('Invalid server response format')
    return false
  }
}

// Обработка ошибок API
const handleApiError = (error) => {
  apiError.value = true
  
  let errorMsg = 'Ошибка соединения'
  
  if (error.response) {
    if (error.response.data?.data?.message) {
      errorMsg = error.response.data.data.message
    } else if (error.response.data?.message) {
      errorMsg = error.response.data.message
    } else {
      errorMsg = `Ошибка ${error.response.status}`
    }
  } else if (error.request) {
    errorMsg = 'Сервер не отвечает'
  } else {
    errorMsg = error.message
  }
  
  errorMessage.value = errorMsg.replace(/<[^>]*>/g, '')
  terminal.error(`Connection error: ${errorMsg}`)
}

// Создание MR
const createMR = async () => {
  if (!isBranchNameValid.value || isLoading.value) return
  apiError.value = false

  isLoading.value = true
  errorMessage.value = ''

  const repo = activeTab.value === 'frontend' ? 'frontend' : 'backend'
  
  terminal.command(`create-mr --source-branch=${branchName.value} --repo=${repo}`)

  try {
    const response = await mergenatorApi.createMR(branchName.value, repo)
    handleApiResponse(response)
  } catch (error) {
    handleApiError(error)
  } finally {
    isLoading.value = false
  }
}

// Удаление CI ветки
const deleteCIBranch = async () => {
  terminal.system(`Эта кнопка пока в разработке...`)
}

// Закрытие MR
const closeMR = async () => {
  terminal.system(`Эта кнопка пока в разработке...`)
}

// Установка активной вкладки
const setActiveTab = (tab) => {
  activeTab.value = tab.routeName
  errorMessage.value = ''
  terminal.system(`Switched to ${tab.name} repository`)
  
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
      errorMessage.value = ''
    } else {
      router.replace({
        name: 'mergenator-with-tab',
        params: { tab: 'frontend' }
      })
    }
  }
}, { immediate: true })
</script>

<style scoped>
.input-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: -8px;
  margin-bottom: 12px;
  font-size: 11px;
  color: #ffc107; /* жёлтый */
}

.hint-icon {
  font-size: 12px;
}
</style>
