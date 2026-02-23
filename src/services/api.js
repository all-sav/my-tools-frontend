import axios from 'axios';

// Создаем экземпляр axios с базовыми настройками
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Интерцептор для добавления токена к каждому запросу
apiClient.interceptors.request.use(
  (config) => {
    // Пропускаем запросы к логину
    if (config.url === '/auth/login') {
      return config;
    }
    
    // Добавляем токен из localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Punk ${token}`;
    }
    
    console.log('📤 Request:', config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок 401 (неавторизован)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Проверяем, что это не запрос на логин
      if (error.config.url !== '/auth/login') {
        // Токен истек или недействителен
        localStorage.removeItem('auth_token');
        localStorage.removeItem('gitlab_username');
        localStorage.removeItem('gitlab_user_id');
        
        // Перенаправляем на страницу логина только если это не запрос логина
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// API методы для аутентификации
export const authApi = {
  login: (username, password, gitlabUser, wsClientId) => 
    apiClient.post('/auth/login', {
      username,
      password,
      gitlab_user: gitlabUser,
      ws_client_id: wsClientId
    }),
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('gitlab_username');
    localStorage.removeItem('gitlab_user_id');
  }
};

// API методы для Mergenator
export const mergenatorApi = {
  createMR: (sourceBranch, repo) => 
    apiClient.post('/merge', {
      source_branch: sourceBranch,
      repo: repo,
      action: 'create'
    }),
  
  deleteCIBranch: (branch, repo) => 
    apiClient.post('/delete-ci-branch', {
      branch: branch,
      repo: repo
    }),
  
  closeMR: (sourceBranch, repo) => 
    apiClient.post('/close-mr', {
      source_branch: sourceBranch,
      repo: repo
    }),
};

export default apiClient;