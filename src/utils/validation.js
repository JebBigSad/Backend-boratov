// Проверка email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Проверка пароля
export const validatePassword = (password) => {
  return password.length >= 6
}

// Проверка имени пользователя
export const validateUsername = (username) => {
  return username.length >= 3 && username.length <= 20
}

// Проверка совпадения паролей
export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword
}

// Проверка всех полей регистрации
export const validateRegistration = (data) => {
  const errors = {}

  if (!data.username) {
    errors.username = 'Имя пользователя обязательно'
  } else if (!validateUsername(data.username)) {
    errors.username = 'Имя должно быть от 3 до 20 символов'
  }

  if (!data.email) {
    errors.email = 'Email обязателен'
  } else if (!validateEmail(data.email)) {
    errors.email = 'Неверный формат email'
  }

  if (!data.password) {
    errors.password = 'Пароль обязателен'
  } else if (!validatePassword(data.password)) {
    errors.password = 'Пароль должен быть минимум 6 символов'
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Подтверждение пароля обязательно'
  } else if (!validatePasswordMatch(data.password, data.confirmPassword)) {
    errors.confirmPassword = 'Пароли не совпадают'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Проверка полей входа
export const validateLogin = (data) => {
  const errors = {}

  if (!data.email) {
    errors.email = 'Email обязателен'
  } else if (!validateEmail(data.email)) {
    errors.email = 'Неверный формат email'
  }

  if (!data.password) {
    errors.password = 'Пароль обязателен'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}