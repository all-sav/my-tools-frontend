<template>
  <div class="app">
    <Login v-if="!isAuthenticated" @login-success="handleLoginSuccess" />
    <template v-else>
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
          <span>👤 {{ gitlabUsername }}</span> • 
          <button @click="logout" class="logout-btn">ВЫХОД</button>
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
        <TerminalPanel 
          ref="terminalPanel"
          @close="handleTerminalClose"
        />
      </div>

      <div class="status-bar">
        <div class="status-bar-left">
          <span>🔒 HTTPS</span> • 
          <span>UTF-8</span> • 
          <span>Unix (LF)</span>
        </div>
        <div class="status-bar-center">
          <span class="route-info">{{ $route.path }}</span>
        </div>
        <div class="status-bar-right">
          <span>👤 {{ gitlabUsername }}</span>
          <div class="status-separator">•</div>
          <button v-if="!terminalVisible" @click="showTerminal" class="show-terminal-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 17L8 21L4 25" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(90 12 12)"/>
            </svg>
            Show Terminal
          </button>
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

const websocket = useWebSocketStore()
const terminal = useTerminalStore()
const route = useRoute()
const router = useRouter()
const terminalPanel = ref(null)

const isAuthenticated = ref(false)
const gitlabUsername = ref('')
const gitlabUserId = ref(null)

const terminalVisible = computed(() => terminalPanel.value?.isVisible ?? true)

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

const logout = () => {
  websocket.disconnect()
  
  localStorage.removeItem('auth_token')
  localStorage.removeItem('gitlab_username')
  localStorage.removeItem('gitlab_user_id')
  
  document.cookie = 'gitlab_user_id=; path=/; max-age=0; secure; samesite=strict'
  document.cookie = 'gitlab_username=; path=/; max-age=0; secure; samesite=strict'
  
  isAuthenticated.value = false
  gitlabUsername.value = ''
  gitlabUserId.value = null
  
  router.push('/')
}

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', basePath: '/dashboard' },
  { key: 'mergenator', label: 'Mergenator', basePath: '/mergenator' }
]

const isActiveMenuItem = (item) => {
  return route.path.startsWith(item.basePath)
}

const navigateTo = (item) => {
  if (route.path.startsWith(item.basePath)) {
    return
  }
  router.push(item.basePath)
}

const handleTerminalClose = () => {}

const showTerminal = () => {
  if (terminalPanel.value) {
    terminalPanel.value.show()
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  background-color: #2b2b2b;
  height: 100vh;
  line-height: 1.5;
  color: #a9b7c6;
  overflow: hidden;
}

.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  background-color: #3c3f41;
  border-right: 1px solid #1e1f22;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
  box-shadow: inset -2px 0 0 #2a2b2e;
}

.sidebar-header {
  padding: 12px 12px 6px 18px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #7a8b99;
  border-bottom: 1px solid #323436;
  margin-bottom: 8px;
}

.menu {
  list-style: none;
  padding: 4px 0;
}

.menu-item {
  padding: 6px 12px 6px 28px;
  margin: 2px 6px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #b7b7b7;
  transition: background-color 0.15s, color 0.15s;
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 2px solid transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
}

.menu-item::before {
  content: "📄";
  font-size: 14px;
  opacity: 0.8;
  filter: grayscale(30%);
  width: 18px;
  display: inline-block;
  margin-right: 8px;
}

.menu-item[data-key="dashboard"]::before {
  content: "📊";
}

.menu-item[data-key="mergenator"]::before {
  content: "🔄";
}

.menu-item:hover {
  background-color: #4b4f52;
  color: #eeeeee;
}

.menu-item.active {
  background-color: #2f6a9f;
  color: white;
  border-left: 2px solid #589df6;
}

.menu-item.active::before {
  opacity: 1;
  filter: none;
}

.sidebar-footer {
  margin-top: auto;
  padding: 12px 8px;
  border-top: 1px solid #2b2b2b;
  font-size: 11px;
  color: #6a7a84;
  margin-left: 8px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-panel {
  flex: 1;
  background-color: #2b2b2b;
  overflow-y: auto;
  padding: 18px 22px;
  color: #a9b7c6;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.content-panel::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.content-panel::-webkit-scrollbar-track {
  background: #313335;
  border-radius: 4px;
}

.content-panel::-webkit-scrollbar-thumb {
  background: #4f5a5f;
  border-radius: 4px;
  border: 2px solid #313335;
}

.content-panel::-webkit-scrollbar-thumb:hover {
  background: #5f6a70;
}

.status-bar {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 300px;
  background-color: #3f4345;
  color: #a0a9b1;
  font-size: 11px;
  padding: 2px 16px;
  border-top: 1px solid #1e1f22;
  z-index: 200;
  box-shadow: -1px -1px 0 #2b2b2b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 24px;
}

.status-bar-left,
.status-bar-center,
.status-bar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-bar-center {
  color: #6897bb;
  font-family: monospace;
}

.status-separator {
  color: #5f6a70;
  margin: 0 2px;
}

.route-info {
  color: #6897bb;
  font-family: monospace;
}

.logout-btn {
  background: none;
  border: 1px solid #f44336;
  color: #f44336;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 4px;
}

.logout-btn:hover {
  background: #f44336;
  color: white;
}

.show-terminal-btn {
  background: none;
  border: 1px solid #589df6;
  color: #589df6;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.show-terminal-btn:hover {
  background: #589df6;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .status-bar {
    left: 200px;
  }
  
  .status-bar-center {
    display: none;
  }
}
</style>