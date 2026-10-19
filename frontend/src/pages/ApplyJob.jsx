
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../services/api'
import '../App.css'

function ApplyJob() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
  resume: '',
  cover_letter: '',
})

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const token = localStorage.getItem('hirehub_token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)

      await API.post(`jobs/${id}/apply/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })

      setSuccess('Your application was submitted successfully!')

      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      const data = err.response?.data

      setError(
        data?.detail ||
        data?.error ||
        data?.non_field_errors?.[0] ||
        'Unable to submit your application. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="job-details-page">
      <button onClick={() => navigate(`/jobs/${id}`)}>
        ← Back to Job Details
      </button>

      <div className="job-details-card">
        <h1>Apply for Job</h1>
        <p>Complete the form below to submit your application.</p>

        {error && <p className="error-message">{error}</p>}
        {success && <p>{success}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="resume">Resume URL</label>
          <input
            id="resume"
            type="url"
            name="resume"
            value={formData.resume}
            onChange={handleChange}
            placeholder="Paste your resume link"
            required
          />

          <label htmlFor="cover_letter">Cover Letter</label>
          <textarea
            id="cover_letter"
            name="cover_letter"
            value={formData.cover_letter}
            onChange={handleChange}
            placeholder="Tell the recruiter why you are suitable for this job"
            rows="6"
            required
          />

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ApplyJob
