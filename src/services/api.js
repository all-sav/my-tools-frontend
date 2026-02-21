import axios from 'axios';

// Создаем экземпляр axios с базовыми настройками
const apiClient = axios.create({
  baseURL: '/api', // используем прокси
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // для отправки кук
});

// Интерцептор для запросов (можно добавить токены, логирование и т.д.)
apiClient.interceptors.request.use(
  (config) => {
    // Можно добавить токен авторизации
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log('📤 Request:', config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Интерцептор для ответов
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // Сервер ответил с ошибкой
      console.error('❌ Response Error:', error.response.status, error.response.data);
      
      // Можно обработать разные статусы
      switch (error.response.status) {
        case 401:
          console.log('Не авторизован');
          // редирект на логин
          break;
        case 403:
          console.log('Доступ запрещен');
          break;
        case 404:
          console.log('Ресурс не найден');
          break;
        case 500:
          console.log('Внутренняя ошибка сервера');
          break;
      }
    } else if (error.request) {
      // Запрос был отправлен, но нет ответа
      console.error('❌ No response from server:', error.request);
    } else {
      // Ошибка при настройке запроса
      console.error('❌ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API методы для Mergenator
export const mergenatorApi = {
  // Создание MR
  createMR: (sourceBranch, repo) => 
    apiClient.post('/merge', {
      source_branch: sourceBranch,
      repo: repo,
      action: 'create'
    }),
  
  // Удаление CI ветки
  deleteCIBranch: (branch, repo) => 
    apiClient.post('/delete-ci-branch', {
      branch: branch,
      repo: repo
    }),
  
  // Закрытие MR
  closeMR: (sourceBranch, repo) => 
    apiClient.post('/close-mr', {
      source_branch: sourceBranch,
      repo: repo
    }),
};

// Можно добавить другие API
export const dashboardApi = {
  getData: () => apiClient.get('/dashboard-data'),
};

export default apiClient;