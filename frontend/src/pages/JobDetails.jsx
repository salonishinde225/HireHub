
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

  const handleApply = () => {
    if (token) {
      navigate(`/jobs/${id}/apply`)
    } else {
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <main className="job-details-page">
        <div className="job-details-card job-details-message">
          <p>Loading job details...</p>
        </div>
      </main>
    )
  }

  if (error || !job) {
    return (
      <main className="job-details-page">
        <div className="job-details-card job-details-message">
          <h2>Job Details Unavailable</h2>
          <p>{error || 'Job not found.'}</p>
          <button
            className="register-btn"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </main>
    )
  }

  const skills = job.skills
    ? job.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
    : []

  const formattedDeadline = job.deadline
    ? new Date(`${job.deadline}T00:00:00`).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Not specified'

  return (
    <main className="job-details-page">
      <div className="job-details-container">
        <button
          className="back-button job-back-link"
          onClick={() => navigate('/')}
        >
          ← Back to Jobs
        </button>

        <article className="job-details-card">
          <header className="job-details-header">
            <div className="company-logo">
              {job.company?.charAt(0)?.toUpperCase() || 'J'}
            </div>

            <div className="job-details-title">
              <span className="job-details-eyebrow">JOB OPPORTUNITY</span>
              <h1>{job.title}</h1>
              <p className="job-details-company">{job.company || 'Company not specified'}</p>
              <p className="job-location">
                <span aria-hidden="true">📍</span> {job.location || 'Location not specified'}
              </p>
            </div>
          </header>

          <section className="job-details-info" aria-label="Job overview">
            <div className="job-info-item">
              <span className="job-info-icon" aria-hidden="true">₹</span>
              <div>
                <small>Annual Salary</small>
                <p>
                  {job.salary
                    ? `₹${Number(job.salary).toLocaleString('en-IN')}`
                    : 'Not specified'}
                </p>
              </div>
            </div>

            <div className="job-info-item">
              <span className="job-info-icon" aria-hidden="true">💼</span>
              <div>
                <small>Job Type</small>
                <p>{job.job_type || 'Not specified'}</p>
              </div>
            </div>

            <div className="job-info-item">
              <span className="job-info-icon" aria-hidden="true">📅</span>
              <div>
                <small>Application Deadline</small>
                <p>{formattedDeadline}</p>
              </div>
            </div>
          </section>

          <div className="job-details-content">
            <section className="job-details-section">
              <h2>About This Job</h2>
              <p className="job-description">
                {job.description || 'No description provided.'}
              </p>
            </section>

            <section className="job-details-section">
              <h2>Required Skills</h2>
              {skills.length > 0 ? (
                <div className="job-skills-list">
                  {skills.map((skill, index) => (
                    <span className="job-skill-tag" key={`${skill}-${index}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="job-description">Skills not specified.</p>
              )}
            </section>
          </div>

          <footer className="job-details-actions">
            <button
              className="register-btn job-apply-button"
              onClick={handleApply}
            >
              {token ? 'Apply for This Job' : 'Login to Apply'}
            </button>

            <button
              className="back-button job-browse-button"
              onClick={() => navigate('/')}
            >
              Browse More Jobs
            </button>
          </footer>
        </article>
      </div>
    </main>
  )
}

export default JobDetails
