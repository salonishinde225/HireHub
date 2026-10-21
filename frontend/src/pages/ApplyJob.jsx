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
        navigate('/my-applications')
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
    <div className="job-details-page apply-job-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate(`/jobs/${id}`)}
      >
        ← Back to Job Details
      </button>

      <div className="job-details-card apply-job-card">
        <div className="apply-job-heading">
          <span className="apply-job-icon">✉</span>
          <h1>Apply for Job</h1>
          <p>
            Take the next step in your career. Complete the form
            below to submit your application.
          </p>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" role="status">
            {success}
          </div>
        )}

        <form className="apply-job-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="resume">Resume URL</label>
            <input
              id="resume"
              type="url"
              name="resume"
              value={formData.resume}
              onChange={handleChange}
              placeholder="https://example.com/your-resume.pdf"
              required
            />
            <small>
              Paste a shareable link to your resume. Make sure the
              recruiter has permission to open it.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="cover_letter">Cover Letter</label>
            <textarea
              id="cover_letter"
              name="cover_letter"
              value={formData.cover_letter}
              onChange={handleChange}
              placeholder="Introduce yourself and explain why you are suitable for this role..."
              rows={7}
              required
            />
            <small>
              Briefly describe your skills, relevant projects, and
              interest in the position.
            </small>
          </div>

          <button
            type="submit"
            className="register-btn apply-submit-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Application →'}
          </button>
        </form>

        <p className="apply-job-note">
          Please review your details before submitting.
        </p>
      </div>
    </div>
  )
}

export default ApplyJob