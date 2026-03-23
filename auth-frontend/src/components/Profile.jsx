import '../styles/profile.css'

function Profile({ user, onLogout }) {
  const getInitial = () => {
    return user.username.charAt(0).toUpperCase()
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">Профиль пользователя</h2>
      <div className="profile-card">
        <div className="profile-avatar">
          {getInitial()}
        </div>
        <div className="profile-info">
          <p><strong>Имя пользователя:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </div>
        <button 
          onClick={onLogout}
          className="profile-button"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}

export default Profile