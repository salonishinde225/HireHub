import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../services/api'
import '../App.css'

function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('hirehub_token')

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await API.get(`jobs/${id}/`)
        setJob(response.data)
      } catch (err) {
        setError('Unable to load job details. Please try again.')
        console.error('Error fetching job details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  if (loading) {
    return (
      <div className="job-details-page">
        <p>Loading job details...</p>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="job-details-page">
        <div className="job-details-card">
          <h2>Job Details Unavailable</h2>
          <p>{error || 'Job not found.'}</p>
          <button
            className="register-btn"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const handleApply = () => {
    if (token) {
      navigate(`/jobs/${id}/apply`)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="job-details-page">
      <button
        className="back-button"
        onClick={() => navigate('/')}
      >
        ← Back to Jobs
      </button>

      <div className="job-details-card">
        <div className="job-details-header">
          <div className="company-logo">
            {job.company?.charAt(0)?.toUpperCase() || 'J'}
          </div>

          <div>
            <h1>{job.title}</h1>
            <h3>{job.company}</h3>
            <p className="job-location">📍 {job.location}</p>
          </div>
        </div>

        <div className="job-details-info">
          <div className="job-info-item">
            <span>💰</span>
            <div>
              <small>Salary</small>
              <p> {job.salary
              ? `₹${Number(job.salary).toLocaleString('en-IN')} per year`
             : 'Not specified'}
</p>
            </div>
          </div>

          <div className="job-info-item">
            <span>💼</span>
            <div>
              <small>Job Type</small>
              <p>{job.job_type || 'Not specified'}</p>
            </div>
          </div>

          <div className="job-info-item">
            <span>📅</span>
            <div>
              <small>Application Deadline</small>
              <p>{job.deadline || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <section className="job-details-section">
          <h2>About This Job</h2>
          <p>{job.description || 'No description provided.'}</p>
        </section>
       
        <section className="job-details-section">
  <h2>Required Skills</h2>
  <div className="job-skills-list">
    {job.skills
      ? job.skills.split(',').map((skill, index) => (
          <span className="job-skill-tag" key={index}>
            {skill.trim()}
          </span>
        ))
      : <span>Skills not specified</span>}
  </div>
</section>

        <div className="job-details-actions">
          <button
            className="register-btn"
            onClick={handleApply}
          >
            {token ? 'Apply for This Job' : 'Login to Apply'}
          </button>

          <button
            className="back-button"
            onClick={() => navigate('/')}
          >
            Browse More Jobs
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobDetails