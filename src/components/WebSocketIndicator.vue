<template>
  <div class="websocket-indicator" :class="statusClass" @click="toggleDetails">
    <div class="indicator-content">
      <span class="indicator-dot"></span>
      <span class="indicator-text">WS: {{ statusText }}</span>
      <span class="indicator-arrow">{{ showDetails ? '▼' : '▲' }}</span>
    </div>
    
    <transition name="slide-fade">
      <div v-if="showDetails" class="indicator-details">
        <div class="detail-row">
          <span class="detail-label">Статус:</span>
          <span class="detail-value" :class="statusClass">{{ statusText }}</span>
        </div>
        <div class="detail-row" v-if="websocket.clientId">
          <span class="detail-label">Client ID:</span>
          <span class="detail-value client-id">{{ shortClientId }}</span>
        </div>
        <div class="detail-row" v-if="websocket.currentUserId">
          <span class="detail-label">User ID:</span>
          <span class="detail-value">{{ websocket.currentUserId }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Сообщений:</span>
          <span class="detail-value">{{ websocket.messages.value.length }}</span>
        </div>
        <div class="detail-row" v-if="lastMessage">
          <span class="detail-label">Последнее:</span>
          <span class="detail-value last-message">{{ lastMessage }}</span>
        </div>
        <div class="detail-actions">
          <button @click.stop="copyClientId" class="detail-btn" v-if="websocket.clientId">
            📋 Копировать ID
          </button>
          <button @click.stop="reconnect" class="detail-btn" :disabled="isReconnecting">
            🔄 {{ isReconnecting ? 'Переподключение...' : 'Переподключиться' }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWebSocketClient } from '@/services/websocket'

const websocket = useWebSocketClient()
const showDetails = ref(false)
const isReconnecting = ref(false)
const lastMessage = ref('')

// Следим за последним сообщением
watch(() => websocket.messages.value, (messages) => {
  if (messages.length > 0) {
    const last = messages[messages.length - 1]
    lastMessage.value = last.text.length > 30 
      ? last.text.substring(0, 30) + '...' 
      : last.text
  }
}, { deep: true })

// Статус и класс
const statusText = computed(() => {
  const status = websocket.status.value
  return {
    'OPEN': 'Подключено',
    'CONNECTING': 'Подключение...',
    'CLOSED': 'Отключено',
    'disconnected': 'Отключено',
    'connected': 'Подключено',
    'error': 'Ошибка'
  }[status] || status
})

const statusClass = computed(() => {
  const status = websocket.status.value
  return {
    'OPEN': 'status-connected',
    'connected': 'status-connected',
    'CONNECTING': 'status-connecting',
    'CLOSED': 'status-disconnected',
    'disconnected': 'status-disconnected',
    'error': 'status-error'
  }[status] || 'status-disconnected'
})

// Короткий Client ID
const shortClientId = computed(() => {
  if (!websocket.clientId.value) return ''
  return websocket.clientId.value.substring(0, 8) + '...'
})

// Копирование ID
const copyClientId = () => {
  if (websocket.clientId.value) {
    navigator.clipboard.writeText(websocket.clientId.value)
    // Можно добавить уведомление
  }
}

// Переподключение
const reconnect = async () => {
  if (isReconnecting.value) return
  
  isReconnecting.value = true
  const userId = websocket.currentUserId.value
  
  if (userId) {
    websocket.disconnect()
    setTimeout(() => {
      websocket.connect(userId)
      isReconnecting.value = false
    }, 1000)
  } else {
    isReconnecting.value = false
  }
}

// Переключение деталей
const toggleDetails = () => {
  showDetails.value = !showDetails.value
}
</script>

<style scoped>
.websocket-indicator {
  position: fixed;
  bottom: 30px;
  right: 20px;
  z-index: 1000;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  user-select: none;
}

.indicator-content {
  background-color: #1e1f22;
  border: 1px solid #404448;
  border-radius: 20px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.indicator-content:hover {
  border-color: #00ff9d;
  box-shadow: 0 0 15px rgba(0, 255, 157, 0.2);
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-connected .indicator-dot {
  background-color: #4caf50;
  box-shadow: 0 0 10px #4caf50;
  animation: pulse 2s infinite;
}

.status-connecting .indicator-dot {
  background-color: #ffc107;
  animation: pulse 1s infinite;
}

.status-disconnected .indicator-dot {
  background-color: #f44336;
}

.status-error .indicator-dot {
  background-color: #ff9800;
  animation: pulse 0.5s infinite;
}

.indicator-text {
  color: #a9b7c6;
  font-size: 11px;
  font-weight: 500;
}

.indicator-arrow {
  color: #8f9aa3;
  font-size: 10px;
  margin-left: 4px;
}

/* Детальная информация */
.indicator-details {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 10px;
  width: 280px;
  background-color: #1e1f22;
  border: 1px solid #00ff9d;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #313335;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #8f9aa3;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #a9b7c6;
  font-size: 12px;
  font-weight: 500;
}

.detail-value.status-connected {
  color: #4caf50;
}

.detail-value.status-connecting {
  color: #ffc107;
}

.detail-value.status-disconnected {
  color: #f44336;
}

.detail-value.status-error {
  color: #ff9800;
}

.client-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #6897bb;
}

.last-message {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #cb7d4a;
}

.detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #313335;
}

.detail-btn {
  flex: 1;
  background-color: #313335;
  border: 1px solid #464a4d;
  color: #a9b7c6;
  font-size: 11px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.detail-btn:hover:not(:disabled) {
  background-color: #404448;
  border-color: #00ff9d;
  color: #ffffff;
}

.detail-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Анимации */
@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Адаптивность */
@media (max-width: 768px) {
  .websocket-indicator {
    bottom: 20px;
    right: 10px;
  }
  
  .indicator-details {
    width: 260px;
    right: 0;
  }
}
</style>