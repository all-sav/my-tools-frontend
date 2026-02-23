<template>
  <div class="ws-indicator-compact" @click="showTooltip = !showTooltip">
    <span class="ws-dot" :class="statusClass"></span>
    <span class="ws-text">WS: {{ statusText }}</span>
    <span class="ws-badge" v-if="messageCount > 0">{{ messageCount }}</span>
    
    <transition name="fade">
      <div v-if="showTooltip" class="ws-tooltip" @click.stop>
        <div class="tooltip-header">
          <span>WebSocket Details</span>
          <button @click="showTooltip = false" class="tooltip-close">✕</button>
        </div>
        <div class="tooltip-content">
          <div class="tooltip-row">
            <span class="tooltip-label">Статус:</span>
            <span class="tooltip-value" :class="statusClass">{{ statusText }}</span>
          </div>
          <div class="tooltip-row" v-if="clientId">
            <span class="tooltip-label">Client ID:</span>
            <span class="tooltip-value client-id">{{ shortClientId }}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Сообщений:</span>
            <span class="tooltip-value">{{ messageCount }}</span>
          </div>
          <div class="tooltip-row" v-if="lastMessage">
            <span class="tooltip-label">Последнее:</span>
            <span class="tooltip-value last-message">{{ lastMessage }}</span>
          </div>
          <button @click="reconnect" class="tooltip-btn" :disabled="isReconnecting">
            🔄 {{ isReconnecting ? 'Переподключение...' : 'Переподключиться' }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWebSocketStore } from '@/services/websocket'

const websocket = useWebSocketStore()
const showTooltip = ref(false)
const isReconnecting = ref(false)
const lastMessage = ref('')

// Счетчик сообщений (только пользовательские)
const messageCount = computed(() => websocket.messages.value.length)

// Следим за последним сообщением
watch(() => websocket.messages.value, (messages) => {
  if (messages.length > 0) {
    const last = messages[messages.length - 1]
    lastMessage.value = last.text.length > 30 
      ? last.text.substring(0, 30) + '...' 
      : last.text
  }
}, { deep: true })

const statusText = computed(() => {
  const status = websocket.status.value
  return {
    'OPEN': 'Online',
    'CONNECTING': 'Connecting',
    'CLOSED': 'Offline',
    'disconnected': 'Offline',
    'connected': 'Online',
    'error': 'Error'
  }[status] || status
})

const statusClass = computed(() => {
  const status = websocket.status.value
  return {
    'OPEN': 'online',
    'connected': 'online',
    'CONNECTING': 'connecting',
    'CLOSED': 'offline',
    'disconnected': 'offline',
    'error': 'error'
  }[status] || 'offline'
})

const clientId = computed(() => websocket.clientId.value)

const shortClientId = computed(() => {
  if (!clientId.value) return ''
  return clientId.value.substring(0, 6) + '…'
})

const reconnect = async () => {
  if (isReconnecting.value) return
  
  isReconnecting.value = true
  const userId = websocket.currentUserId.value
  
  if (userId) {
    websocket.disconnect()
    setTimeout(() => {
      websocket.connect(userId)
      isReconnecting.value = false
      showTooltip.value = false
    }, 1000)
  } else {
    isReconnecting.value = false
  }
}

// Закрываем тултип при клике вне
const handleClickOutside = (e) => {
  if (!e.target.closest('.ws-indicator-compact')) {
    showTooltip.value = false
  }
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<style scoped>
.ws-indicator-compact {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  position: relative;
  transition: background-color 0.2s ease;
}

.ws-indicator-compact:hover {
  background-color: #4b4f52;
}

.ws-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.ws-dot.online {
  background-color: #4caf50;
  box-shadow: 0 0 8px #4caf50;
  animation: pulse 2s infinite;
}

.ws-dot.connecting {
  background-color: #ffc107;
  animation: pulse 1s infinite;
}

.ws-dot.offline {
  background-color: #f44336;
}

.ws-dot.error {
  background-color: #ff9800;
  animation: pulse 0.5s infinite;
}

.ws-text {
  color: #a9b7c6;
  font-size: 11px;
}

.ws-badge {
  background-color: #2f6a9f;
  color: white;
  font-size: 9px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  line-height: 1;
}

.ws-tooltip {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  width: 260px;
  background-color: #1e1f22;
  border: 1px solid #00ff9d;
  border-radius: 6px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #313335;
  border-bottom: 1px solid #404448;
  border-radius: 6px 6px 0 0;
  color: #00ff9d;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.tooltip-close {
  background: none;
  border: none;
  color: #8f9aa3;
  cursor: pointer;
  font-size: 14px;
  padding: 0 4px;
}

.tooltip-close:hover {
  color: #ffffff;
}

.tooltip-content {
  padding: 12px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #313335;
}

.tooltip-row:last-child {
  border-bottom: none;
}

.tooltip-label {
  color: #8f9aa3;
  font-size: 11px;
}

.tooltip-value {
  color: #a9b7c6;
  font-size: 11px;
  font-weight: 500;
}

.tooltip-value.online {
  color: #4caf50;
}

.tooltip-value.connecting {
  color: #ffc107;
}

.tooltip-value.offline {
  color: #f44336;
}

.tooltip-value.error {
  color: #ff9800;
}

.client-id {
  font-family: 'JetBrains Mono', monospace;
  color: #6897bb;
}

.last-message {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #cb7d4a;
}

.tooltip-btn {
  width: 100%;
  margin-top: 10px;
  padding: 6px;
  background-color: #313335;
  border: 1px solid #464a4d;
  color: #a9b7c6;
  font-size: 11px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tooltip-btn:hover:not(:disabled) {
  background-color: #404448;
  border-color: #00ff9d;
  color: #ffffff;
}

.tooltip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>