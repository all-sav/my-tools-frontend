<template>
  <div class="terminal-panel">
    <div class="terminal-header">
      <div class="terminal-header-left">
        <div class="terminal-led" :class="{ active: terminal.messageCount > 0 }"></div>
        <span class="terminal-title">TERMINAL</span>
      </div>
      
      <div class="terminal-header-right">
        <span class="terminal-status">{{ terminal.messageCount }} messages</span>
        <button class="terminal-clear-btn" @click="terminal.clearMessages" title="Clear console">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Контент терминала -->
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
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useTerminalStore } from '@/stores/terminal'
import '@/assets/terminal.css'

const terminal = useTerminalStore()
const terminalContent = ref(null)
const autoScroll = ref(true)
const userScrolled = ref(false)

// Обработчик скролла
const handleScroll = () => {
  if (!terminalContent.value) return
  const { scrollTop, scrollHeight, clientHeight } = terminalContent.value
  const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10
  userScrolled.value = !isAtBottom
  autoScroll.value = isAtBottom
}

// Скролл вниз
const scrollToBottom = () => {
  if (terminalContent.value && autoScroll.value) {
    terminalContent.value.scrollTop = terminalContent.value.scrollHeight
  }
}

onMounted(() => {
  if (terminalContent.value) {
    terminalContent.value.addEventListener('scroll', handleScroll)
  }
})

// Следим за новыми сообщениями
watch(() => terminal.messageCount, () => {
  nextTick(scrollToBottom)
})

defineExpose({ scrollToBottom })
</script>