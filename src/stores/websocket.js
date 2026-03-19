import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useWebSocket } from '@vueuse/core'
import { useTerminalStore } from './terminal'

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    clientId: null,
    isAuthenticated: false,
    currentUserId: null,
    wsInstance: null,
    status: 'disconnected'
  }),
  
  getters: {
    isConnected: (state) => state.status === 'OPEN' || state.status === 'connected'
  },
  
  actions: {
    connect(userId) {
      if (this.wsInstance) {
        this.wsInstance.close()
      }
      
      const terminal = useTerminalStore()
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws`
      
      console.log('🔌 Connecting WebSocket for user:', userId)
      
      this.isAuthenticated = true
      this.currentUserId = userId
      this.status = 'connecting'
      
      const { status, data, send, close } = useWebSocket(wsUrl, {
        autoConnect: true,
        autoReconnect: {
          retries: 3,
          delay: 1000,
          onFailed: () => {
            console.error('WebSocket reconnection failed')
            this.status = 'failed'
          }
        },
        heartbeat: {
          enabled: true,
          interval: 30000,
          message: JSON.stringify({ type: 'ping' })
        },
        onConnected: () => {
          console.log('✅ WebSocket connected')
          this.status = 'connected'
          
          if (this.isAuthenticated && this.currentUserId && this.clientId) {
            const authMsg = JSON.stringify({
              type: 'auth',
              userId: this.currentUserId,
              clientId: this.clientId
            })
            send(authMsg)
          }
        },
        onDisconnected: () => {
          console.log('❌ WebSocket disconnected')
          this.status = 'disconnected'
        },
        onError: (error) => {
          console.error('WebSocket error:', error)
          this.status = 'error'
        }
      })
      
      this.wsInstance = { status, data, send, close }
      
      // Следим за входящими сообщениями
      watch(data, (newData) => {
        if (!newData) return
        
        try {
          const parsed = typeof newData === 'string' ? JSON.parse(newData) : newData
          
          // Пропускаем служебные сообщения
          if (parsed.type === 'pong' || parsed.type === 'ping') {
            return
          }
          
          if (parsed.clientID) {
            this.clientId = parsed.clientID
            console.log('📡 Received client ID:', parsed.clientID)
            
            if (this.isAuthenticated && this.currentUserId) {
              const authMsg = JSON.stringify({
                type: 'auth',
                userId: this.currentUserId,
                clientId: this.clientId
              })
              send(authMsg)
            }
            return
          }
          
          if (parsed.type === 'auth_success') {
            console.log('🔐 WebSocket auth successful for user:', parsed.userId)
            return
          }
          
          // Конвертируем тип и отправляем в терминал
          let messageType = 'default'
          switch (parsed.type) {
            case 'header':
              messageType = 'header'
              break
            case 'error':
              messageType = 'error'
              break
            case 'success':
              messageType = 'success'
              break
          }
          
          terminal.addMessage(parsed.message || '', messageType)
          
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      })
    },
    
    disconnect() {
      if (this.wsInstance) {
        this.wsInstance.close()
        this.wsInstance = null
      }
      this.isAuthenticated = false
      this.currentUserId = null
      this.clientId = null
      this.status = 'disconnected'
    },
    
    sendMessage(message, type = 'default') {
      if (this.wsInstance && this.wsInstance.status.value === 'OPEN') {
        const msg = JSON.stringify({ message, type })
        this.wsInstance.send(msg)
      } else {
        console.warn('WebSocket is not connected')
      }
    }
  }
})