<template>
  <div>
    <!-- Табы для Dashboard -->
    <div class="fake-tabs">
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

    <!-- Контент вкладок -->
    <div v-if="activeTab === 'welcome'">
      <h2>👋 Здравствуйте, ребятишки!</h2>
      <p>Это панель управления стендом. Здесь можно <span class="tag"><strong>будет</strong></span> многое :)</p>
      <p><b>Структура управления стендом:</b></p>
      <pre>
📂 composer.json
📁 src/
    📄 index.php
    📄 helper.php
📁 vendor/
      </pre>
      <h3>🔥 Быстрые ссылки</h3>
      <ul style="margin-left: 20px; color: #a9b7c6;">
        <li><code>Ctrl+Shift+A</code> — поиск действий</li>
        <li><code>Alt+Enter</code> — показать исправления</li>
        <li><code>Shift дважды</code> — поиск везде</li>
      </ul>
      <br>
      <p>❤️ Наслаждайтесь тёмной темой.</p>
    </div>

    <div v-else-if="activeTab === 'project'">
      <h2>📁 Project Structure</h2>
      <p>Текущая структура проекта (пример):</p>
      <pre>
my-project/
 ├── .idea/
 ├── src/
 │    ├── Controller/
 │    │    └── IndexController.php
 │    ├── Entity/
 │    │    └── User.php
 │    └── Repository/
 ├── templates/
 │    └── base.html.twig
 ├── config/
 │    └── routes.yaml
 ├── public/
 │    └── index.php
 └── composer.json
      </pre>
      <p><span class="tag">// 12 файлов, 3 папки</span></p>
    </div>

    <!-- Информация о текущем URL (для демонстрации) -->
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
    default: 'welcome'
  }
})

// Активная вкладка
const activeTab = ref('welcome')

// Список вкладок для Dashboard
const tabs = ref([
  { name: 'Welcome.php', routeName: 'welcome' },
  { name: 'project.xml', routeName: 'project' }
])

// Установка активной вкладки и обновление URL
const setActiveTab = (tab) => {
  activeTab.value = tab.routeName
  
  // Обновляем URL с параметром таба, но сохраняем тот же маршрут
  router.push({
    name: 'dashboard-with-tab',
    params: { tab: tab.routeName }
  })
}

// Следим за изменением параметра tab в URL
watch(() => route.params.tab, (newTab) => {
  if (newTab && newTab !== activeTab.value) {
    // Проверяем, существует ли такой таб
    const tabExists = tabs.value.some(t => t.routeName === newTab)
    if (tabExists) {
      activeTab.value = newTab
    } else {
      // Если таб не существует, редиректим на дефолтный
      router.replace({
        name: 'dashboard-with-tab',
        params: { tab: 'welcome' }
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
.fake-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 16px;
  border-bottom: 1px solid #404448;
  padding-bottom: 0;
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

.tag {
  color: #6a8759;
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