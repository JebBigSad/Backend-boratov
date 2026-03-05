// Ключи для localStorage
export const STORAGE_KEYS = {
  USERS: 'demo_users',
  CURRENT_USER: 'current_user'
}

// Инициализация хранилища с демо-пользователем
export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const initialUsers = [
      {
        id: 1,
        username: 'demo',
        email: 'demo@example.com',
        password: 'demo123',
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers))
  }
}

// Получить всех пользователей
export const getUsers = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || []
}

// Сохранить пользователей
export const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

// Добавить нового пользователя
export const addUser = (userData) => {
  const users = getUsers()
  const newUser = {
    id: Date.now(),
    ...userData,
    createdAt: new Date().toISOString()
  }
  users.push(newUser)
  saveUsers(users)
  return newUser
}

// Найти пользователя по email
export const findUserByEmail = (email) => {
  const users = getUsers()
  return users.find(u => u.email === email)
}

// Найти пользователя по username
export const findUserByUsername = (username) => {
  const users = getUsers()
  return users.find(u => u.username === username)
}

// Проверить credentials
export const validateCredentials = (email, password) => {
  const users = getUsers()
  return users.find(u => u.email === email && u.password === password)
}

// Сохранить текущего пользователя
export const setCurrentUser = (user) => {
  const { password, ...userWithoutPassword } = user
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword))
}

// Получить текущего пользователя
export const getCurrentUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return user ? JSON.parse(user) : null
}

// Удалить текущего пользователя (выход)
export const removeCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
}