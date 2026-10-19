import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../services/api'
import '../App.css'

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await API.post('login/', formData)

      localStorage.setItem('hirehub_token', response.data.token)
      localStorage.setItem('hirehub_user', JSON.stringify(response.data.user))

      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Login failed. Please check your username and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          Hire<span>Hub</span>
        </Link>

        <h1>Welcome Back!</h1>
        <p className="auth-subtitle">Login to continue your career journey.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login