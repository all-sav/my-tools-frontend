/**
 * Преобразует snake_case в camelCase
 * Пример: "backend_project_id" -> "backendProjectId"
 */
export function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Преобразует camelCase в snake_case
 * Пример: "backendProjectId" -> "backend_project_id"
 */
export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Рекурсивно преобразует ключи объекта из snake_case в camelCase
 */
export function convertKeysToCamel(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamel(item))
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key)
      acc[camelKey] = convertKeysToCamel(obj[key])
      return acc
    }, {})
  }
  
  return obj
}

/**
 * Рекурсивно преобразует ключи объекта из camelCase в snake_case
 */
export function convertKeysToSnake(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnake(item))
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = camelToSnake(key)
      acc[snakeKey] = convertKeysToSnake(obj[key])
      return acc
    }, {})
  }
  
  return obj
}