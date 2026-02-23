import { defineStore } from 'pinia'

export const useTerminalStore = defineStore('terminal', {
  state: () => ({
    messages: [],
    maxMessages: 1000, // Лимит сообщений
  }),
  
  getters: {
    // Форматированные сообщения для отображения
    formattedMessages: (state) => state.messages.map(msg => ({
      ...msg,
      prompt: getPromptForType(msg.type)
    })),
    
    // Количество сообщений
    messageCount: (state) => state.messages.length,
    
    // Последнее сообщение
    lastMessage: (state) => state.messages[state.messages.length - 1]
  },
  
  actions: {
    // Основной метод добавления сообщения
    addMessage(text, type = 'default') {
      this.messages.push({
        text,
        type,
        timestamp: new Date().toLocaleTimeString()
      })
      
      // Ограничиваем количество сообщений
      if (this.messages.length > this.maxMessages) {
        this.messages.shift()
      }
    },
    
    // Очистка терминала
    clearMessages() {
      this.messages = []
    },
    
    // Специализированные методы для разных типов
    system(text) {
      this.addMessage(text, 'system')
    },
    
    error(text) {
      this.addMessage(text, 'error')
    },
    
    success(text) {
      this.addMessage(text, 'success')
    },
    
    command(text) {
      this.addMessage(text, 'command')
    },
    
    header(text) {
      this.addMessage(text, 'header')
    },
    
    default(text) {
      this.addMessage(text, 'default')
    }
  }
})

// Вспомогательная функция
function getPromptForType(type) {
  const prompts = {
    'error': '✗',
    'success': '✓',
    'header': '▶',
    'default': '$',
    'system': '$',
    'command': '>'
  }
  return prompts[type] || '$'
}