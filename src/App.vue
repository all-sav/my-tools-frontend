<template>
  <div class="app">
    <Login v-if="!isAuthenticated" @login-success="handleLoginSuccess" />
    <template v-else>
      <div class="sidebar">
        <div class="sidebar-header" @click="router.push('/')" style="cursor: pointer;">
          <span class="logo">⚡ MyTools</span>
        </div>
        <ul class="menu">
          <li
            v-for="item in menuItems"
            :key="item.key"
            class="menu-item"
            :class="{ active: isActiveMenuItem(item) }"
            @click="navigateTo(item)"
          >
            <component :is="item.icon" />
            <span>{{ item.label }}</span>
          </li>
        </ul>
        <div class="sidebar-footer">
          <div class="company-logo">
            <span class="logo-accent">⚡</span>
            <span class="logo-text">ANDAGAR</span>
            <span class="logo-year">© 2026</span>
          </div>
          <div class="company-tagline">web development</div>
        </div>
      </div>

      <div class="main-content">
        <div class="content-panel">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>

        <!-- Терминал -->
        <transition name="slide-up">
          <TerminalPanel 
            v-if="terminalVisible"
            ref="terminalPanel"
            @close="closeTerminal"
          />
        </transition>

        <!-- Статус-бар -->
        <div class="status-bar">
          <div class="status-bar-left">
            <button 
              class="terminal-tab" 
              :class="{ active: terminal.isExpanded }"
              @click="terminal.toggleTerminal"
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                :class="{ rotated: terminal.isExpanded }"
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>TERMINAL</span>
            </button>
            
            <span class="route-info">{{ $route.path }}</span>
          </div>

          <div class="status-bar-center"></div>

          <div class="status-bar-right">
            <span>🔒 HTTPS</span>
            <span class="separator">•</span>
            <span>UTF-8</span>
            <span class="separator">•</span>
            <span>Unix (LF)</span>
            <span class="separator">•</span>
            <WebSocketRadar />

            <span class="separator">•</span>
            <span>👤 {{ gitlabUsername }}</span>
            
            <button @click="logout" class="logout-btn" title="Logout">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 16L21 12M21 12L17 8M21 12H7M13 16V17C13 19.2091 11.2091 21 9 21H6C3.79086 21 2 19.2091 2 17V7C2 4.79086 3.79086 3 6 3H9C11.2091 3 13 4.79086 13 7V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Login from '@/components/Login.vue'
import TerminalPanel from '@/components/TerminalPanel.vue'
import { useWebSocketStore } from '@/stores/websocket'
import { useTerminalStore } from '@/stores/terminal'
import { authApi } from '@/services/api'
import WebSocketRadar from '@/components/WebSocketRadar.vue'

import IconDashboard from '@/components/icons/IconDashboard.vue'
import IconMerge from '@/components/icons/IconMerge.vue'

const websocket = useWebSocketStore()
const terminal = useTerminalStore()
const route = useRoute()
const router = useRouter()

const isAuthenticated = ref(false)
const gitlabUsername = ref('')
const gitlabUserId = ref(null)

const terminalVisible = computed(() => terminal.isExpanded)

// Статус WebSocket
const wsStatusText = computed(() => {
  const status = websocket.status
  return {
    'OPEN': 'ONLINE',
    'connected': 'ONLINE',
    'connecting': 'SYNC',
    'CONNECTING': 'SYNC',
    'disconnected': 'OFF',
    'CLOSED': 'OFF',
    'error': 'ERR'
  }[status] || 'OFF'
})

const wsStatusClass = computed(() => {
  const status = websocket.status
  return {
    'OPEN': 'online',
    'connected': 'online',
    'connecting': 'connecting',
    'CONNECTING': 'connecting',
    'disconnected': 'offline',
    'CLOSED': 'offline',
    'error': 'error'
  }[status] || 'offline'
})

onMounted(() => {
  checkAuth()
})

const checkAuth = () => {
  const token = localStorage.getItem('auth_token')
  const username = localStorage.getItem('gitlab_username')
  const userId = localStorage.getItem('gitlab_user_id')

  if (token && username && userId) {
    isAuthenticated.value = true
    gitlabUsername.value = username
    gitlabUserId.value = userId
    
    if (!websocket.isConnected) {
      websocket.connect(parseInt(userId))
    }
  }
}

const handleLoginSuccess = (userData) => {
  isAuthenticated.value = true
  gitlabUsername.value = userData.username
  gitlabUserId.value = userData.userId
}

const logout = async () => {
  try {
    // Отправляем запрос на бэкенд для инвалидации токена
    await authApi.logout();
  } catch (error) {
    console.error('Logout API error:', error);
    // Даже если ошибка, продолжаем локальную очистку
  } finally {
    // Отключаем WebSocket
    websocket.disconnect();
    
    authApi.clearLocalSession()
    
    // Сбрасываем состояние
    isAuthenticated.value = false;
    gitlabUsername.value = '';
    gitlabUserId.value = null;
    
    // Редирект на главную
    router.push('/');
  }
};

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', basePath: '/dashboard', icon: IconDashboard },
  { key: 'mergenator', label: 'Mergenator', basePath: '/mergenator', icon: IconMerge }
]

const isActiveMenuItem = (item) => route.path.startsWith(item.basePath)
const navigateTo = (item) => {
  if (route.path.startsWith(item.basePath)) return
  router.push(item.basePath)
}

const closeTerminal = () => {
  terminal.isExpanded = false
}
</script>