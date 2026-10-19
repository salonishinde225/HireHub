import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../services/api'
import '../App.css'

function Register() {
  
const [formData, setFormData] = useState({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'job_seeker',
})


  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    setSuccess('')

    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

  try {await API.post('register/', {
  username: formData.username,
  email: formData.email,
  password: formData.password,
  role: formData.role,
})


      setSuccess('Registration successful! Redirecting to login...')

      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      const data = err.response?.data
      const message = data
        ? Object.entries(data)
            .map(([field, messages]) =>
              `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
            )
            .join(' ')
        : 'Registration failed. Please try again.'

      setError(message)
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

        <h1>Create Account</h1>
        <p className="auth-subtitle">
          Join HireHub and start exploring job opportunities.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          
<label htmlFor="role">Register as</label>
<select
  id="role"
  name="role"
  value={formData.role}
  onChange={handleChange}
  required
  style={{
    width: '100%',
    padding: '12px',
    marginBottom: '18px',
    border: '1px solid #d0d5dd',
    borderRadius: '8px',
    fontSize: '15px',
    backgroundColor: 'grey',
  }}
>
  <option value="job_seeker">Job Seeker</option>
  <option value="recruiter">Recruiter</option>
</select>

      

          <input
            id="username"
            name="username"
            type="text"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
          />

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register