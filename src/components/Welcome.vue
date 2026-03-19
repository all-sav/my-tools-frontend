<template>
  <div class="welcome-container">
    <div class="welcome-header">
      <h1 class="glitch" data-text="⚡ Добро пожаловать, оператор ⚡">
        {{ greeting }} {{ gitlabUsername }}
      </h1>
      <p class="subtitle">Терминал управления слиянием веток и мониторинга стендов</p>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="spinner"></div>
      <span>Загрузка статистики...</span>
    </div>

    <!-- Статистика -->
    <div v-else class="stats-grid">
      <div class="stat-card" :class="{ 'has-data': stats.mrCreated > 0 }">
        <div class="stat-icon">
          <IconMerge />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.mrCreated }}</div>
          <div class="stat-label">открытых MR</div>
          <div class="stat-detail" v-if="stats.mrByRepo">
            <span class="repo-badge" v-if="stats.mrByRepo.frontend">
              <IconFrontend /> {{ stats.mrByRepo.frontend }}
            </span>
            <span class="repo-badge" v-if="stats.mrByRepo.backend">
              <IconBackend /> {{ stats.mrByRepo.backend }}
            </span>
          </div>
        </div>
      </div>

      <div class="stat-card" :class="{ 'has-data': stats.activeBranches > 0 }">
        <div class="stat-icon">
          <IconBranches />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.activeBranches }}</div>
          <div class="stat-label">активных веток</div>
          <div class="stat-detail" v-if="stats.branchesByRepo">
            <span class="repo-badge" v-if="stats.branchesByRepo.frontend">
              <IconFrontend /> {{ stats.branchesByRepo.frontend }}
            </span>
            <span class="repo-badge" v-if="stats.branchesByRepo.backend">
              <IconBackend /> {{ stats.branchesByRepo.backend }}
            </span>
          </div>
        </div>
      </div>

      <div class="stat-card" :class="{ 'has-data': terminalStore.messageCount > 0 }">
        <div class="stat-icon">
          <IconTerminalMessages />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ terminalStore.messageCount }}</div>
          <div class="stat-label">сообщений в терминале</div>
        </div>
      </div>

      <div class="stat-card" :class="{ 
        'online': websocketStore.isConnected, 
        'offline': !websocketStore.isConnected 
      }">
        <div class="stat-icon">
          <span class="status-dot"></span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ websocketStore.isConnected ? 'ONLINE' : 'OFFLINE' }}</div>
          <div class="stat-label">WebSocket</div>
          <div class="stat-detail" v-if="websocketStore.clientId">
            ID: {{ shortClientId }}
          </div>
        </div>
      </div>
    </div>

    <!-- Быстрые действия -->
    <div class="quick-actions">
      <h3>⚡ Быстрые действия</h3>
      <div class="action-buttons">
        <button class="action-btn" @click="goToMergenator('frontend')">
          <span class="btn-icon"><IconFrontend /></span>
          <span>Frontend MR</span>
          <span class="btn-badge" v-if="stats.mrByRepo?.frontend">{{ stats.mrByRepo.frontend }}</span>
        </button>
        <button class="action-btn" @click="goToMergenator('backend')">
          <span class="btn-icon"><IconBackend /></span>
          <span>Backend MR</span>
          <span class="btn-badge" v-if="stats.mrByRepo?.backend">{{ stats.mrByRepo.backend }}</span>
        </button>
        <button class="action-btn" @click="openTerminal">
          <span class="btn-icon">📟</span>
          <span>Открыть терминал</span>
        </button>
      </div>
    </div>

    <!-- Справка по командам -->
    <div class="help-section">
      <h3>📖 Справка по Mergenator</h3>
      <div class="help-grid">
        <div class="help-item">
          <code class="help-command">create-mr</code>
          <span class="help-desc">создать MR из ветки</span>
        </div>
        <div class="help-item">
          <code class="help-command">delete-ci-branch</code>
          <span class="help-desc">удалить CI ветку</span>
        </div>
        <div class="help-item">
          <code class="help-command">close-mr</code>
          <span class="help-desc">закрыть существующий MR</span>
        </div>
        <div class="help-item">
          <code class="help-command">--repo frontend|backend</code>
          <span class="help-desc">выбор репозитория</span>
        </div>
      </div>
    </div>

    <!-- Информация о системе -->
    <div class="system-info">
      <div class="info-line">
        <span class="info-label">Версия ядра:</span>
        <span class="info-value">Mergenator v2.0 (PhpStorm Dark)</span>
      </div>
      <div class="info-line">
        <span class="info-label">Режим доступа:</span>
        <span class="info-value">оператор {{ gitlabUsername }}</span>
      </div>
      <div class="info-line">
        <span class="info-label">Последнее обновление:</span>
        <span class="info-value">{{ lastUpdated }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTerminalStore } from '@/stores/terminal'
import { useWebSocketStore } from '@/stores/websocket'
import { statsApi } from '@/services/api'

import IconMerge from '@/components/icons/IconMerge.vue'
import IconFrontend from '@/components/icons/IconFrontend.vue'
import IconBackend from '@/components/icons/IconBackend.vue'
import IconBranches from '@/components/icons/IconBranches.vue'
import IconTerminalMessages from '@/components/icons/IconTerminalMessages.vue'

const router = useRouter()
const terminalStore = useTerminalStore()
const websocketStore = useWebSocketStore()

// Состояния
const gitlabUsername = ref(localStorage.getItem('gitlab_username') || 'оператор')
const isLoading = ref(true)
const lastUpdated = ref('—')

// Статистика
const stats = ref({
  mrCreated: 0,
  activeBranches: 0,
  mrByRepo: {
    frontend: 0,
    backend: 0
  },
  branchesByRepo: {
    frontend: 0,
    backend: 0
  }
})

// Приветствие в зависимости от времени
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '👋 Доброе утро,'
  if (hour < 18) return '👋 Добрый день,'
  return '👋 Добрый вечер,'
})

// Короткий Client ID для WebSocket
const shortClientId = computed(() => {
  if (!websocketStore.clientId) return ''
  return websocketStore.clientId.substring(0, 8) + '…'
})

// Загрузка статистики
const loadStats = async () => {
  isLoading.value = true
  try {
    const response = await statsApi.getStats()
    if (!response.data?.success) {
      throw new Error(response.data?.data?.message || 'Failed to load stats')
    }
    stats.value = response.data.data
    lastUpdated.value = new Date().toLocaleTimeString()
  } catch (error) {
    console.error('Failed to load stats:', error)
    terminalStore.error('Ошибка загрузки статистики')
  } finally {
    isLoading.value = false
  }
}

// Навигация
const goToMergenator = (tab) => {
  router.push({ name: 'mergenator-with-tab', params: { tab } })
}

const openTerminal = () => {
  terminalStore.toggleTerminal()
}

onMounted(() => {
  loadStats()
  terminalStore.system('Welcome: статистика загружена')
})
</script>

<style scoped>
.welcome-container {
  padding: 0px 20px;
  color: #a9b7c6;
  font-family: 'JetBrains Mono', monospace;
}

.welcome-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #00ff9d;
  padding-bottom: 20px;
}

.glitch {
  font-size: 28px;
  font-weight: 600;
  color: #00fff3;
  letter-spacing: 3px;
  position: relative;
  text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
  margin-bottom: 8px;
}

.subtitle {
  color: #8f9aa3;
  font-size: 14px;
  margin-top: 8px;
}

/* Индикатор загрузки */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  background: #1e1f22;
  border: 1px solid #3d6857;
  border-radius: 8px;
  margin-bottom: 30px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 255, 157, 0.3);
  border-radius: 50%;
  border-top-color: #00ff9d;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.stat-card {
  background: radial-gradient(circle at top left, #22252b, #191a1f);
  border: 1px solid #2f3b46;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff9d, transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card.has-data {
  border-color: #00ff9d;
}

.stat-card.online {
  border-color: #00ff9d;
}

.stat-card.offline {
  border-color: #f28b82;
  opacity: 0.7;
}

.stat-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 30% 30%, #353b45, #22252b);
  border-radius: 8px;
  color: #00ff9d;
  box-shadow: 0 0 12px rgba(0, 255, 157, 0.15);
}

.stat-icon .status-dot {
  width: 24px;
  height: 24px;
  background-color: #00ff9d;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ff9d;
}

.offline .stat-icon .status-dot {
  background-color: #f28b82;
  box-shadow: 0 0 10px #f28b82;
}

.stats-grid > .stat-card:nth-child(1) .stat-icon {
  color: #00ff9d;
}

.stats-grid > .stat-card:nth-child(2) .stat-icon {
  color: #ffc66d;
}

.stats-grid > .stat-card:nth-child(3) .stat-icon {
  color: #7d3cff;
}

.stats-grid > .stat-card:nth-child(4) .stat-icon {
  color: #00fff3;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #00ff9d;
  line-height: 1.2;
}

.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  color: #8f9aa3;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-detail {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: #8f9aa3;
}

.repo-badge {
  background: #2b2b2b;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #3d6857;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Быстрые действия */
.quick-actions {
  margin-bottom: 30px;
}

.quick-actions h3 {
  color: #ffc66d;
  font-size: 16px;
  margin-bottom: 16px;
  border-left: 3px solid #7d3cff;
  padding-left: 12px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  background: #1e1f22;
  border: 1px solid #3d6857;
  border-radius: 6px;
  padding: 10px 20px;
  color: #a9b7c6;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  position: relative;
}

.action-btn:hover {
  border-color: #00ff9d;
  background: rgba(0, 255, 157, 0.05);
  color: #00ff9d;
  transform: translateX(4px);
}

.btn-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
}

.btn-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.btn-badge {
  background: #7d3cff;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 4px;
}

/* Справка */
.help-section {
  margin-bottom: 30px;
}

.help-section h3 {
  color: #bbcc77;
  font-size: 16px;
  margin-bottom: 16px;
  border-left: 3px solid #00ff9d;
  padding-left: 12px;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  background: #1e1f22;
  border: 1px solid #3d6857;
  border-radius: 8px;
  padding: 16px;
}

.help-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.help-command {
  color: #cb7d4a;
  background: #2b2b2b;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  display: inline-block;
  width: fit-content;
}

.help-desc {
  color: #8f9aa3;
  font-size: 11px;
  margin-left: 4px;
}

/* Системная информация */
.system-info {
  background: #1e1f22;
  border: 1px solid #3d6857;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.info-line {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed #3d6857;
}

.info-line:last-child {
  border-bottom: none;
}

.info-label {
  color: #8f9aa3;
  font-size: 12px;
  text-transform: uppercase;
}

.info-value {
  color: #00ff9d;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}
</style>