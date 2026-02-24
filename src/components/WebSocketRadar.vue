<template>
  <div class="websocket-radar" :class="statusClass">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Внешний круг (основа) -->
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.3"/>
      
      <!-- Внутренний круг (пульс) -->
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1" fill="none" opacity="0.6">
        <animate
          v-if="isActive"
          attributeName="r"
          values="5;7;5"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      
      <!-- Вращающаяся линия радара -->
      <g v-if="isActive" :style="{ transform: `rotate(${rotation}deg)`, transformOrigin: '12px 12px' }">
        <line x1="12" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <animate
            attributeName="opacity"
            values="0.2;1;0.2"
            dur="2s"
            repeatCount="indefinite"
          />
        </line>
        <circle cx="22" cy="12" r="1.5" fill="currentColor">
          <animate
            attributeName="opacity"
            values="0.2;1;0.2"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
      
      <!-- Центральная точка -->
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
    <span class="radar-text">WS</span>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useWebSocketStore } from '@/stores/websocket'

const websocket = useWebSocketStore()

const rotation = ref(0)
let interval = null

const isActive = computed(() => {
  return websocket.status === 'connected' || websocket.status === 'connecting'
})

const statusClass = computed(() => {
  return {
    'status-connected': websocket.status === 'connected' || websocket.status === 'OPEN',
    'status-connecting': websocket.status === 'connecting' || websocket.status === 'CONNECTING',
    'status-disconnected': websocket.status === 'disconnected' || websocket.status === 'CLOSED',
    'status-error': websocket.status === 'error'
  }
})

// Вращение радара только в активных состояниях
onMounted(() => {
  if (isActive.value) {
    interval = setInterval(() => {
      rotation.value = (rotation.value + 1) % 360
    }, 30) // Плавное вращение
  }
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

// Следим за изменением статуса
import { watch } from 'vue'
watch(() => websocket.status, (newStatus) => {
  if (isActive.value) {
    if (!interval) {
      interval = setInterval(() => {
        rotation.value = (rotation.value + 1) % 360
      }, 30)
    }
  } else {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }
})
</script>

<style scoped>
.websocket-radar {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8f9aa3;
  transition: color 0.3s ease;
}

.websocket-radar.status-connected {
  color: #00ff9d;
}

.websocket-radar.status-connecting {
  color: #ff00ff;
  animation: pulse 1s infinite;
}

.websocket-radar.status-disconnected {
  color: #f28b82;
}

.websocket-radar.status-error {
  color: #ff00ff;
  animation: pulse 0.5s infinite;
}

.radar-text {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

svg {
  filter: drop-shadow(0 0 5px currentColor);
}
</style>