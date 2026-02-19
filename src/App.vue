<template>
  <div class="app">
    <div class="sidebar">
      <div class="sidebar-header">📌 PRIMARY MENUS</div>
      <ul class="menu">
        <li
          v-for="item in menuItems"
          :key="item.key"
          class="menu-item"
          :class="{ active: isActiveMenuItem(item) }"
          :data-key="item.key"
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', basePath: '/dashboard' },
  { key: 'mergenator', label: 'Mergenator', basePath: '/mergenator' }
]

// Функция для проверки активности пункта меню
const isActiveMenuItem = (item) => {
  // Проверяем, начинается ли текущий путь с basePath пункта меню
  return route.path.startsWith(item.basePath)
}

// Навигация по меню
const navigateTo = (item) => {
  // Если текущий путь уже начинается с basePath, не делаем редирект
  if (route.path.startsWith(item.basePath)) {
    return
  }
  
  // Переходим на базовый путь, откуда будет редирект на дефолтный таб
  router.push(item.basePath)
}
</script>

<style>
/* Все существующие стили остаются из main.css */

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
</style>