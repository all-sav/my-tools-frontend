<template>
  <div class="app">
    <div class="sidebar">
      <div class="sidebar-header">📌 PRIMARY MENUS</div>
      <ul class="menu">
        <li
          v-for="item in menuItems"
          :key="item.key"
          class="menu-item"
          :class="{ active: $route.name === item.key }"
          :data-icon="item.key"
          @click="navigateTo(item)"
        >
          {{ item.label }}
        </li>
      </ul>
      <div class="sidebar-footer">
        <span>🔍 Structure</span> • <span>🕒 History</span> • <span>📦 TODO</span>
      </div>
    </div>

    <div class="content-panel">
      <!-- имитация вкладок редактора с роутингом -->
      <div class="fake-tabs">
        <div
          v-for="tab in editorTabs"
          :key="tab.name"
          class="fake-tab"
          :class="{ 'active-tab': $route.name === tab.routeName }"
          @click="navigateToTab(tab)"
        >
          {{ tab.name }}
        </div>
      </div>

      <!-- Здесь будет отображаться текущий компонент страницы -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <div class="status-bar">
      <span>🔒 HTTPS</span> • 
      <span>UTF-8</span> • 
      <span>Unix (LF)</span> • 
      <span>PHP 8.2</span> • 
      <span>💬 0:0</span> •
      <span class="route-info">{{ $route.path }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', routeName: 'dashboard', path: '/dashboard' },
  { key: 'mergenator', label: 'Mergenator', routeName: 'mergenator', path: '/mergenator' }
]

const editorTabs = ref([
  { name: 'Welcome.php', routeName: 'welcome', path: '/welcome', active: true },
  { name: 'project.xml', routeName: 'project', path: '/project', active: false }
])

// Следим за изменением маршрута и обновляем активные вкладки
watch(() => route.name, (newRouteName) => {
  editorTabs.value = editorTabs.value.map(tab => ({
    ...tab,
    active: tab.routeName === newRouteName
  }))
}, { immediate: true })

// Навигация по меню
const navigateTo = (item) => {
  router.push({ name: item.routeName })
}

// Навигация по вкладкам
const navigateToTab = (tab) => {
  router.push({ name: tab.routeName })
}
</script>

<style>
/* Все существующие стили остаются */

/* Добавим анимацию для перехода между страницами */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Стиль для информации о маршруте в статус-баре */
.route-info {
  color: #6897bb;
  font-family: monospace;
}

/* Обновим стили для табов, добавим курсор-поинтер */
.fake-tab {
  cursor: pointer;
  transition: all 0.2s ease;
}

.fake-tab:hover:not(.active-tab) {
  background-color: #404448;
  color: #ffffff;
}
</style>