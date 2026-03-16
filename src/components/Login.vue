<template>
  <div class="login-container">
    <div class="cyber-grid"></div>
    <div class="scan-lines"></div>
    
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <h1>⚡ MyTools v0.1 ⚡</h1>
          <p class="subtitle">Терминал доступа к системе управления</p>
          <!-- <div class="status-line" :class="{ 'connected': isConnected }">
            <span class="status-indicator"></span>
            {{ isConnected ? 'СВЯЗЬ УСТАНОВЛЕНА' : 'ОЖИДАНИЕ СОЕДИНЕНИЯ...' }}
          </div> -->
        </div>

        <div class="login-form">
          <div class="input-group">
            <label>🔐 ЛОГИН</label>
            <input 
              type="text" 
              v-model="username"
              placeholder="admin"
              :disabled="isLoading"
              class="cyber-input"
            />
          </div>

          <div class="input-group">
            <label>🔑 ПАРОЛЬ</label>
            <input 
              type="password" 
              v-model="password"
              placeholder="••••••••"
              :disabled="isLoading"
              class="cyber-input"
              @keyup.enter="handleLogin"
            />
          </div>

          <div class="input-group">
            <label>👤 GITLAB USERNAME</label>
            <input 
              type="text" 
              v-model="gitlabUser"
              placeholder="например: cyb3r_h4ck3r"
              :disabled="isLoading"
              class="cyber-input"
              @keyup.enter="handleLogin"
            />
          </div>

          <div class="error-message" v-if="errorMessage">
            <span class="error-icon">⚠️</span>
            <span v-html="errorMessage"></span>
          </div>

          <button 
            @click="handleLogin" 
            :disabled="!isFormValid || isLoading"
            class="cyber-button"
          >
            <span class="button-text" v-if="!isLoading">▶ ВОЙТИ В СИСТЕМУ</span>
            <span class="button-text" v-else>
              <span class="spinner"></span>
              ПОДКЛЮЧЕНИЕ...
            </span>
          </button>
        </div>

        <div class="login-footer">
          <div class="company-name">ANDAGAR & Co</div>
          <div class="system-info">
            <span>🔒 HTTPS: {{ isHttps ? 'ЗАЩИЩЕН' : 'НЕЗАЩИЩЕН' }}</span>
            <span>🖧 WS: ❌ Disconnected</span>
            <span>⏰ {{ currentTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/services/api'

const router = useRouter()
const emit = defineEmits(['login-success'])

// Состояния формы
const username = ref('')
const password = ref('')
const gitlabUser = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// Время для киберпанк-эффекта
const currentTime = ref(new Date().toLocaleTimeString())
let timeInterval

const isHttps = computed(() => window.location.protocol === 'https:')

// Валидация формы
const isFormValid = computed(() => {
  return username.value.length >= 3 && 
         password.value.length >= 3 && 
         gitlabUser.value.length >= 3
})

// Обновление времени
onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timeInterval)
})

// Обработка логина
const handleLogin = async () => {
  if (!isFormValid.value || isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await authApi.login(
      username.value,
      password.value,
      gitlabUser.value,
    )

    console.log('Login response:', response.data)

    if (response.data.success) {
      // Сохраняем токен в localStorage
      localStorage.setItem('auth_token', response.data.data.token)
      localStorage.setItem('gitlab_username', gitlabUser.value)
      localStorage.setItem('gitlab_user_id', response.data.data.gitlab_user_id)

      emit('login-success', {
        username: gitlabUser.value,
        userId: response.data.data.gitlab_user_id
      })

      router.push('/dashboard')
      
    } else {
      errorMessage.value = response.data.data?.message || 'Неизвестная ошибка'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.response?.data?.data?.message || 'Ошибка соединения с сервером'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #0a0c0e;
  overflow: hidden;
  z-index: 9999;
}

/* Киберпанк-сетка на весь экран */
.cyber-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(#00ff9d22 1px, transparent 1px),
    linear-gradient(90deg, #00ff9d22 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
  pointer-events: none;
}

@keyframes grid-move {
  0% { transform: translateY(0); }
  100% { transform: translateY(50px); }
}

/* Сканирующие линии на весь экран */
.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 157, 0.03) 0px,
    rgba(0, 255, 157, 0.03) 2px,
    transparent 2px,
    transparent 4px
  );
  pointer-events: none;
  animation: scan 8s linear infinite;
}

@keyframes scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* Центрирование формы */
.login-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 600px;
  padding: 20px;
  z-index: 10;
}

.login-card {
  width: 100%;
  background: #1a1e24;
  border: 1px solid #00ff9d;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 0 30px rgba(0, 255, 157, 0.2),
              inset 0 0 30px rgba(0, 255, 157, 0.1);
  animation: flicker 3s infinite;
}

@keyframes flicker {
  0% { box-shadow: 0 0 30px rgba(0, 255, 157, 0.2); }
  50% { box-shadow: 0 0 40px rgba(0, 255, 157, 0.3); }
  100% { box-shadow: 0 0 30px rgba(0, 255, 157, 0.2); }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  border-bottom: 1px solid #00ff9d;
  padding-bottom: 16px;
}

.login-header h1 {
  color: #00ff9d;
  font-size: 28px;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.subtitle {
  color: #8f9aa3;
  font-size: 12px;
  margin-bottom: 16px;
}

.status-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: #0a0c0e;
  border: 1px solid #404448;
  border-radius: 4px;
  font-size: 11px;
  color: #8f9aa3;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f44336;
}

.status-line.connected .status-indicator {
  background: #4caf50;
  box-shadow: 0 0 10px #4caf50;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: #00ff9d;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cyber-input {
  background: #0a0c0e;
  border: 1px solid #00ff9d;
  border-radius: 4px;
  padding: 12px 16px;
  color: #ffffff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  transition: all 0.2s ease;
}

.cyber-input:focus {
  outline: none;
  border-color: #ff00ff;
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
}

.cyber-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #5a1e1e;
  border: 1px solid #ff00ff;
  border-radius: 4px;
  padding: 12px;
  color: #ff00ff;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: glitch 0.3s ease;
}

@keyframes glitch {
  0% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  50% { transform: translateX(2px); }
  75% { transform: translateX(-2px); }
  100% { transform: translateX(0); }
}

.cyber-button {
  background: transparent;
  border: 2px solid #00ff9d;
  border-radius: 4px;
  padding: 16px;
  color: #00ff9d;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  margin-top: 8px;
}

.cyber-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 157, 0.2), transparent);
  transition: left 0.5s ease;
}

.cyber-button:hover:not(:disabled) {
  background: #00ff9d;
  color: #0a0c0e;
  box-shadow: 0 0 30px rgba(0, 255, 157, 0.5);
}

.cyber-button:hover:not(:disabled)::before {
  left: 100%;
}

.cyber-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.login-footer {
  border-top: 1px solid #00ff9d;
  padding-top: 16px;
}

.company-name {
  text-align: center;
  color: #00ff9d;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  text-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
  letter-spacing: 4px;
  opacity: 0.8;
}

.system-info {
  display: flex;
  justify-content: space-between;
  color: #8f9aa3;
  font-size: 11px;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0, 255, 157, 0.3);
  border-radius: 50%;
  border-top-color: #00ff9d;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Адаптивность */
@media (max-width: 768px) {
  .login-wrapper {
    padding: 10px;
  }
  
  .login-card {
    padding: 20px;
  }
  
  .login-header h1 {
    font-size: 22px;
  }
  
  .company-name {
    font-size: 16px;
  }
  
  .system-info {
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
}
</style>