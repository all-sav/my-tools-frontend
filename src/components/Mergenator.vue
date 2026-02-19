<template>
  <div>
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

    <!-- Контент Mergenator -->
    <h2>👋 Welcome to Mergenator</h2>
    <p>Это компонент Mergenator. Выбрано меню <span class="tag"><strong>Mergenator</strong></span>.</p>
    <p>Здесь будет функционал для слияния данных:</p>
    <pre>
📂 Функции Mergenator:
    ├── 🔄 Объединение массивов
    ├── 🔀 Слияние объектов
    ├── 📊 Агрегация данных
    └── 🧮 Математические операции
    </pre>
    
    <!-- Контент в зависимости от активного таба -->
    <div v-if="activeTab === 'merge'" class="demo-content">
      <h3>🔄 Режим слияния</h3>
      <p>Выберите тип слияния:</p>
      <select v-model="selectedMergeType">
        <option value="array">Объединение массивов</option>
        <option value="object">Слияние объектов</option>
        <option value="aggregate">Агрегация данных</option>
      </select>
      <p v-if="selectedMergeType" class="mt-2">
        Выбрано: <span class="tag">{{ selectedMergeType }}</span>
      </p>
    </div>
    <div v-else-if="activeTab === 'split'" class="demo-content">
      <h3>✂️ Режим разделения</h3>
      <p>Настройки разделения данных:</p>
      <input 
        type="text" 
        v-model="splitDelimiter"
        placeholder="Разделитель..." 
      />
      <p v-if="splitDelimiter" class="mt-2">
        Разделитель: <span class="tag">{{ splitDelimiter }}</span>
      </p>
    </div>
    <div v-else-if="activeTab === 'transform'" class="demo-content">
      <h3>⚡ Режим трансформации</h3>
      <p>Преобразование данных:</p>
      <label>
        <input type="checkbox" v-model="transformUppercase"> В верхний регистр
      </label>
      <br>
      <label>
        <input type="checkbox" v-model="transformTrim"> Обрезать пробелы
      </label>
    </div>

    <!-- Информация о текущем URL -->
    <div class="url-info">
      <small>Текущий URL: {{ $route.path }} | Активный таб: {{ activeTab }}</small>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Определяем props
const props = defineProps({
  tab: {
    type: String,
    default: 'merge'
  }
})

// Флаг для показа табов
const showTabs = ref(true)

// Активная вкладка
const activeTab = ref('merge')

// Состояния для демо-контента
const selectedMergeType = ref('array')
const splitDelimiter = ref(',')
const transformUppercase = ref(false)
const transformTrim = ref(false)

// Список вкладок для Mergenator
const tabs = ref([
  { name: 'merge.php', routeName: 'merge' },
  { name: 'split.php', routeName: 'split' },
  { name: 'transform.php', routeName: 'transform' }
])

// Установка активной вкладки и обновление URL
const setActiveTab = (tab) => {
  activeTab.value = tab.routeName
  
  // Обновляем URL с параметром таба
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
    } else {
      // Если таб не существует, редиректим на дефолтный
      router.replace({
        name: 'mergenator-with-tab',
        params: { tab: 'merge' }
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
})
</script>

<style scoped>
.tag {
  color: #6a8759;
}

.demo-content {
  margin-top: 20px;
  padding: 15px;
  background-color: #1e1f22;
  border-radius: 8px;
  border: 1px solid #41474a;
}

select, input[type="text"] {
  background-color: #313335;
  color: #a9b7c6;
  border: 1px solid #464a4d;
  padding: 5px 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-family: 'JetBrains Mono', monospace;
  width: 100%;
  max-width: 300px;
}

select:focus, input:focus {
  outline: none;
  border-color: #589df6;
}

input[type="checkbox"] {
  margin-right: 8px;
  accent-color: #589df6;
}

label {
  display: block;
  margin: 8px 0;
  color: #a9b7c6;
  cursor: pointer;
}

.mt-2 {
  margin-top: 10px;
}

.fake-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 16px;
  border-bottom: 1px solid #404448;
  padding-bottom: 0;
  flex-wrap: wrap;
}

.fake-tab {
  background-color: #313335;
  color: #8f9aa3;
  padding: 6px 16px;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  font-size: 12px;
  border: 1px solid #404448;
  border-bottom: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.fake-tab.active-tab {
  background-color: #2b2b2b;
  color: #bbbbbb;
  border-bottom: 2px solid #589df6;
  margin-bottom: -1px;
}

.fake-tab:hover:not(.active-tab) {
  background-color: #404448;
  color: #ffffff;
}

.url-info {
  margin-top: 20px;
  padding: 8px;
  background-color: #1e1f22;
  border-radius: 4px;
  color: #6897bb;
  font-family: monospace;
  font-size: 11px;
  border: 1px solid #41474a;
}
</style>