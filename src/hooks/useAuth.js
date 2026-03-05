import { useState, useEffect } from 'react'
import * as storage from '../utils/storage'
import * as validation from '../utils/validation'

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Инициализация хранилища
    storage.initStorage()
    
    // Проверка текущего пользователя
    const user = storage.getCurrentUser()
    if (user) {
      setCurrentUser(user)
    }
    setLoading(false)
  }, [])

  // Регистрация
  const register = async (userData) => {
    setError(null)
    
    // Валидация
    const validationResult = validation.validateRegistration(userData)
    if (!validationResult.isValid) {
      setError(validationResult.errors)
      return { success: false, errors: validationResult.errors }
    }

    // Проверка уникальности
    const existingEmail = storage.findUserByEmail(userData.email)
    if (existingEmail) {
      setError({ email: 'Email уже зарегистрирован' })
      return { success: false, errors: { email: 'Email уже зарегистрирован' } }
    }

    const existingUsername = storage.findUserByUsername(userData.username)
    if (existingUsername) {
      setError({ username: 'Имя пользователя уже занято' })
      return { success: false, errors: { username: 'Имя пользователя уже занято' } }
    }

    // Создание пользователя
    const newUser = storage.addUser({
      username: userData.username,
      email: userData.email,
      password: userData.password
    })

    return { success: true, user: newUser }
  }

  // Вход
  const login = async (email, password) => {
    setError(null)

    // Валидация
    const validationResult = validation.validateLogin({ email, password })
    if (!validationResult.isValid) {
      setError(validationResult.errors)
      return { success: false, errors: validationResult.errors }
    }

    // Проверка credentials
    const user = storage.validateCredentials(email, password)
    
    if (user) {
      storage.setCurrentUser(user)
      setCurrentUser(user)
      return { success: true, user }
    } else {
      setError({ general: 'Неверный email или пароль' })
      return { success: false, errors: { general: 'Неверный email или пароль' } }
    }
  }

  // Выход
  const logout = () => {
    storage.removeCurrentUser()
    setCurrentUser(null)
  }

  return {
    currentUser,
    loading,
    error,
    register,
    login,
    logout
  }
}