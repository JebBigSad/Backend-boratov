export const STORAGE_KEYS = {
  TOKEN: 'token',
  CURRENT_USER: 'current_user',
}

export const initStorage = () => {
  // Инициализация storage (проверяем, что localStorage доступен)
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage не доступен')
  }
}

export const setToken = (token) => {
  if (!token) {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    return
  }
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
}

export const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

export const setCurrentUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
}

export const getCurrentUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return user ? JSON.parse(user) : null
}

export const removeCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
}