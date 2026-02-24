<template>
  <div class="welcome-container">
    <div class="welcome-header">
      <h1 class="glitch" data-text="⚡ Добро пожаловать, оператор ⚡">Пользователь инициализирован: {{ gitlabUsername }}</h1>
      <p class="subtitle">Терминал управления слиянием веток и мониторинга стендов</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <IconMerge />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.mrCreated }}</div>
          <div class="stat-label">MR создано</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.activeBranches }}</div>
          <div class="stat-label">активных веток</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-content">
          <div class="stat-value">{{ terminalStore.messageCount }}</div>
          <div class="stat-label">сообщений в терминале</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" :class="{'online': websocketStore.isConnected, 'offline': !websocketStore.isConnected}">
          <span class="status-dot"></span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ websocketStore.isConnected ? 'ONLINE' : 'OFFLINE' }}</div>
          <div class="stat-label">WebSocket</div>
        </div>
      </div>
    </div>

    <!-- Быстрые действия -->
    <div class="quick-actions">
      <h3>⚡ Быстрые действия</h3>
      <div class="action-buttons">
        <button class="action-btn" @click="goToMergenator('frontend')">
          <span class="btn-icon">🖥️</span>
          <span>Frontend MR</span>
        </button>
        <button class="action-btn" @click="goToMergenator('backend')">
          <span class="btn-icon">⚙️</span>
          <span>Backend MR</span>
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
        <span class="info-label">Кодировка:</span>
        <span class="info-value">UTF-8 🔒</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTerminalStore } from '@/stores/terminal'
import { useWebSocketStore } from '@/stores/websocket'

import IconMerge from '@/components/icons/IconMerge.vue'

const router = useRouter()
const terminalStore = useTerminalStore()
const websocketStore = useWebSocketStore()

// Получаем имя пользователя из localStorage
const gitlabUsername = ref(localStorage.getItem('gitlab_username') || 'оператор')

// Заглушка для статистики (позже можно заменить реальными данными)
const stats = ref({
  mrCreated: 42,
  activeBranches: 7
})

// Навигация в Mergenator с выбором таба
const goToMergenator = (tab) => {
  router.push({ name: 'mergenator-with-tab', params: { tab } })
}

// Открыть терминал (развернуть его)
const openTerminal = () => {
  terminalStore.toggleTerminal()
}
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
  /* text-transform: uppercase; */
  letter-spacing: 3px;
  position: relative;
  text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
  margin-bottom: 8px;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  left: 2px;
  text-shadow: -2px 0 #ff00ff;
  clip: rect(44px, 450px, 56px, 0);
  /* animation: glitch-anim 5s infinite linear alternate-reverse; */
}

.glitch::after {
  left: -2px;
  text-shadow: -2px 0 #00ff9d;
  clip: rect(44px, 450px, 56px, 0);
  /* animation: glitch-anim2 5s infinite linear alternate-reverse; */
}

@keyframes glitch-anim {
  0% {
    clip: rect(31px, 9999px, 94px, 0);
  }
  5% {
    clip: rect(70px, 9999px, 71px, 0);
  }
  10% {
    clip: rect(29px, 9999px, 83px, 0);
  }
  15% {
    clip: rect(16px, 9999px, 91px, 0);
  }
  20% {
    clip: rect(41px, 9999px, 33px, 0);
  }
  25% {
    clip: rect(37px, 9999px, 38px, 0);
  }
  30% {
    clip: rect(88px, 9999px, 32px, 0);
  }
  35% {
    clip: rect(60px, 9999px, 53px, 0);
  }
  40% {
    clip: rect(95px, 9999px, 39px, 0);
  }
  45% {
    clip: rect(85px, 9999px, 24px, 0);
  }
  50% {
    clip: rect(69px, 9999px, 75px, 0);
  }
  55% {
    clip: rect(12px, 9999px, 62px, 0);
  }
  60% {
    clip: rect(44px, 9999px, 94px, 0);
  }
  65% {
    clip: rect(87px, 9999px, 63px, 0);
  }
  70% {
    clip: rect(66px, 9999px, 74px, 0);
  }
  75% {
    clip: rect(22px, 9999px, 67px, 0);
  }
  80% {
    clip: rect(75px, 9999px, 77px, 0);
  }
  85% {
    clip: rect(30px, 9999px, 52px, 0);
  }
  90% {
    clip: rect(59px, 9999px, 97px, 0);
  }
  95% {
    clip: rect(20px, 9999px, 48px, 0);
  }
  100% {
    clip: rect(40px, 9999px, 41px, 0);
  }
}

@keyframes glitch-anim2 {
  0% {
    clip: rect(65px, 9999px, 19px, 0);
  }
  5% {
    clip: rect(76px, 9999px, 81px, 0);
  }
  10% {
    clip: rect(56px, 9999px, 64px, 0);
  }
  15% {
    clip: rect(43px, 9999px, 30px, 0);
  }
  20% {
    clip: rect(94px, 9999px, 86px, 0);
  }
  25% {
    clip: rect(47px, 9999px, 89px, 0);
  }
  30% {
    clip: rect(74px, 9999px, 44px, 0);
  }
  35% {
    clip: rect(34px, 9999px, 29px, 0);
  }
  40% {
    clip: rect(77px, 9999px, 18px, 0);
  }
  45% {
    clip: rect(10px, 9999px, 62px, 0);
  }
  50% {
    clip: rect(71px, 9999px, 45px, 0);
  }
  55% {
    clip: rect(32px, 9999px, 50px, 0);
  }
  60% {
    clip: rect(24px, 9999px, 53px, 0);
  }
  65% {
    clip: rect(33px, 9999px, 32px, 0);
  }
  70% {
    clip: rect(88px, 9999px, 60px, 0);
  }
  75% {
    clip: rect(72px, 9999px, 78px, 0);
  }
  80% {
    clip: rect(64px, 9999px, 21px, 0);
  }
  85% {
    clip: rect(23px, 9999px, 68px, 0);
  }
  90% {
    clip: rect(86px, 9999px, 92px, 0);
  }
  95% {
    clip: rect(54px, 9999px, 87px, 0);
  }
  100% {
    clip: rect(98px, 9999px, 40px, 0);
  }
}

.subtitle {
  color: #8f9aa3;
  font-size: 14px;
  margin-top: 8px;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.stat-card {
  background: #1e1f22;
  border: 1px solid #3d6857;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #00ff9d;
  box-shadow: 0 0 15px rgba(0, 255, 157, 0.2);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2b2b2b;
  border-radius: 8px;
  color: #00ff9d;
}

.stat-icon.online .status-dot {
  width: 16px;
  height: 16px;
  background-color: #00ff9d;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ff9d;
}

.stat-icon.offline .status-dot {
  width: 16px;
  height: 16px;
  background-color: #f28b82;
  border-radius: 50%;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #00ff9d;
  line-height: 1.2;
}

.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  color: #8f9aa3;
  letter-spacing: 0.5px;
}

/* Быстрые действия */
.quick-actions {
  margin-bottom: 30px;
}

.quick-actions h3 {
  color: #ffc66d;
  font-size: 16px;
  margin-bottom: 16px;
  border-left: 3px solid #ff00ff;
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
}

.action-btn:hover {
  border-color: #00ff9d;
  background: rgba(0, 255, 157, 0.05);
  color: #00ff9d;
  transform: translateX(4px);
}

.btn-icon {
  font-size: 18px;
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