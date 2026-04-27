import { useState, useEffect } from 'react'
import * as storage from '../utils/storage'
import * as validation from '../utils/validation'
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth'

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    storage.initStorage()
    const user = storage.getCurrentUser()
    const token = storage.getToken()
    
    if (user && token) {
      user.token = token
      if (!user.role) user.role = 'client'
    }
    
    setCurrentUser(user)
    setLoading(false)
  }, [])

  const register = async (userData) => {
    setError(null)

    const validationResult = validation.validateRegistration(userData)
    if (!validationResult.isValid) {
      setError(validationResult.errors)
      return { success: false, errors: validationResult.errors }
    }

    try {
      // Добавляем confirmPassword в вызов
      await apiRegister(
        userData.username, 
        userData.email, 
        userData.password, 
        userData.confirmPassword
      )
      return { success: true }
    } catch (e) {
      const message = e?.data?.error || e?.message || 'Ошибка регистрации'
      setError({ general: message })
      return { success: false, errors: { general: message } }
    }
  }

  const login = async (username, password) => {
    setError(null)

    const validationResult = validation.validateLogin({ username, password })
    if (!validationResult.isValid) {
      setError(validationResult.errors)
      return { success: false, errors: validationResult.errors }
    }

    try {
      const result = await apiLogin(username, password)
      if (result?.token && result?.user) {
        const userWithToken = {
          ...result.user,
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          role: result.user.role || 'client',
          token: result.token
        }
        
        storage.setToken(result.token)
        storage.setCurrentUser(userWithToken)
        setCurrentUser(userWithToken)
        return { success: true, user: userWithToken }
      }

      const message = 'Некорректный ответ сервера'
      setError({ general: message })
      return { success: false, errors: { general: message } }
    } catch (e) {
      const message = e?.data?.error || e?.message || 'Неверный логин или пароль'
      setError({ general: message })
      return { success: false, errors: { general: message } }
    }
  }

  const logout = async () => {
    const token = storage.getToken()
    try {
      if (token) await apiLogout(token)
    } catch (e) {
      // токен всё равно сбрасываем на клиенте
    } finally {
      storage.removeCurrentUser()
      setCurrentUser(null)
    }
  }

  return {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    token: storage.getToken(),
  }
}
