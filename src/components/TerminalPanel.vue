<template>
  <div class="terminal-panel" :class="{ collapsed: isCollapsed }">
    <div class="terminal-panel-header" @click="toggleCollapse">
      <div class="header-left">
        <button class="collapse-btn" @click.stop="toggleCollapse">
          <svg :class="{ rotated: !isCollapsed }" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="terminal-title">TERMINAL</span>
        <span class="terminal-badge" v-if="terminal.messageCount > 0">{{ terminal.messageCount }}</span>
      </div>
      <div class="header-right">
        <div class="ws-status-compact" :class="wsStatusClass">
          <span class="ws-dot"></span>
          <span class="ws-text">{{ wsStatusText }}</span>
        </div>
        <button class="header-btn" @click.stop="clearTerminal" title="Clear console">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="header-btn" @click.stop="closeTerminal" title="Close terminal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    
    <transition name="slide">
      <div v-show="!isCollapsed" class="terminal-panel-content">
        <div class="terminal" ref="terminalContainer">
          <div class="terminal-content" ref="terminalContent">
            <div v-for="(line, index) in terminal.formattedMessages" 
                 :key="index" 
                 class="terminal-line" 
                 :class="line.type">
              <span class="terminal-prompt">{{ line.prompt }}</span>
              <span class="terminal-text" v-html="line.text"></span>
              <span class="terminal-details">{{ line.timestamp }}</span>
            </div>
            <div v-if="terminal.messageCount === 0" class="terminal-line terminal-empty">
              <span class="terminal-prompt">$</span>
              <span class="terminal-text">Ready to create merge requests...</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useWebSocketStore } from '@/stores/websocket'
import { useTerminalStore } from '@/stores/terminal'
import '@/assets/terminal.css'

const websocket = useWebSocketStore()
const terminal = useTerminalStore()

const isCollapsed = ref(false)
const terminalContainer = ref(null)
const terminalContent = ref(null)
const isVisible = ref(true)
const autoScroll = ref(true)
const userScrolled = ref(false)

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

// Обработчик скролла
const handleScroll = () => {
  if (!terminalContent.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = terminalContent.value
  const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10
  
  if (!isAtBottom) {
    userScrolled.value = true
    autoScroll.value = false
  } else {
    userScrolled.value = false
    autoScroll.value = true
  }
}

// Функция скролла вниз
const scrollToBottom = () => {
  if (terminalContent.value && autoScroll.value) {
    terminalContent.value.scrollTop = terminalContent.value.scrollHeight
  }
}

// Загружаем состояние из localStorage
onMounted(() => {
  const savedState = localStorage.getItem('terminal_collapsed')
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true'
  }
  
  if (terminalContent.value) {
    terminalContent.value.addEventListener('scroll', handleScroll)
  }
})

// Сохраняем состояние
watch(isCollapsed, (value) => {
  localStorage.setItem('terminal_collapsed', value)
})

// Следим за новыми сообщениями
watch(() => terminal.messageCount, () => {
  nextTick(() => {
    if (terminalContent.value && !isCollapsed.value && autoScroll.value) {
      scrollToBottom()
    }
  })
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  if (!isCollapsed.value) {
    nextTick(() => {
      autoScroll.value = true
      userScrolled.value = false
      scrollToBottom()
    })
  }
}

const clearTerminal = () => {
  terminal.clearMessages()
}

const closeTerminal = () => {
  isVisible.value = false
  emit('close')
}

const emit = defineEmits(['close'])

defineExpose({
  isVisible,
  show: () => { 
    isVisible.value = true 
    nextTick(() => {
      autoScroll.value = true
      userScrolled.value = false
      scrollToBottom()
    })
  }
})
</script>