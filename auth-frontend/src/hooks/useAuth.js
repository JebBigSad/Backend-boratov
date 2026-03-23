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
    setCurrentUser(storage.getCurrentUser())
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
      await apiRegister(userData.username, userData.email, userData.password)
      return { success: true }
    } catch (e) {
      const message = e?.data?.error || e?.message || 'Ошибка регистрации'
      setError({ general: message })
      return { success: false, errors: { general: message } }
    }
  }

  const login = async (email, password) => {
    setError(null)

    const validationResult = validation.validateLogin({ email, password })
    if (!validationResult.isValid) {
      setError(validationResult.errors)
      return { success: false, errors: validationResult.errors }
    }

    try {
      const result = await apiLogin(email, password)
      if (result?.token && result?.user) {
        storage.setToken(result.token)
        storage.setCurrentUser(result.user)
        setCurrentUser(result.user)
        return { success: true, user: result.user }
      }

      const message = 'Некорректный ответ сервера'
      setError({ general: message })
      return { success: false, errors: { general: message } }
    } catch (e) {
      const message = e?.data?.error || e?.message || 'Неверный email или пароль'
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