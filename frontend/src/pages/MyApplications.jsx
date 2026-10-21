import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import '../App.css'

function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('hirehub_token')

      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await API.get('my-applications/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        })

        setApplications(
          Array.isArray(response.data) ? response.data : []
        )
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          'Unable to load your applications. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [navigate])

  const getStatusClass = (status) => {
    const normalizedStatus = (status || 'pending')
      .toLowerCase()
      .replace(/\s+/g, '-')

    return `status-${normalizedStatus}`
  }

  if (loading) {
    return (
      <div className="applications-page">
        <div className="applications-container">
          <p>Loading your applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="applications-page">
      <div className="applications-container">
        <div className="applications-header">
          <div>
            <p className="applications-eyebrow">YOUR CAREER JOURNEY</p>
            <h1>My Applications</h1>
            <p className="applications-subtitle">
              Keep track of your job applications and their progress.
            </p>
          </div>

          <button
            className="register-btn"
            onClick={() => navigate('/')}
          >
            + Find Jobs
          </button>
        </div>

        {!error && applications.length > 0 && (
          <div className="applications-summary">
            <div className="applications-summary-card">
              <span>Total Applications</span>
              <strong>{applications.length}</strong>
            </div>

            <div className="applications-summary-card">
              <span>Pending Review</span>
              <strong>
                {applications.filter(
                  (app) =>
                    (app.status || 'pending').toLowerCase() === 'pending'
                ).length}
              </strong>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {!error && applications.length === 0 && (
          <div className="empty-applications">
            <div className="empty-applications-icon">📄</div>
            <h2>No applications yet</h2>
            <p>
              Your applications will appear here after you apply
              for a job.
            </p>
            <button
              className="register-btn"
              onClick={() => navigate('/')}
            >
              Explore Jobs
            </button>
          </div>
        )}

        {!error && applications.length > 0 && (
          <div className="applications-list">
            {applications.map((application) => (
              <article
                className="application-card"
                key={application.id}
              >
                <div className="application-card-header">
                  <div className="application-company-icon">
                    {(application.company || 'J')
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="application-job-heading">
                    <h2>
                      {application.job_title || 'Job Application'}
                    </h2>
                    <p>
                      {application.company || 'Company not specified'}
                    </p>
                  </div>

                  <span
                    className={`application-status ${getStatusClass(application.status)}`}
                  >
                    {application.status || 'Pending'}
                  </span>
                </div>

                <div className="application-card-details">
                  <p>
                    <strong>Application ID:</strong> {application.id}
                  </p>

                  <p>
                    <strong>Applied on:</strong>{' '}
                    {application.applied_at
                      ? new Date(
                          application.applied_at
                        ).toLocaleDateString()
                      : 'Not available'}
                  </p>
                </div>

                <div className="application-card-footer">
                  <span>Application progress</span>
                  <button
                    className="back-home-button"
                    onClick={() => {
                      if (application.job) {
                        navigate(`/jobs/${application.job}`)
                      } else if (application.job_id) {
                        navigate(`/jobs/${application.job_id}`)
                      } else {
                        setError(
                          'Job details are unavailable for this application.'
                        )
                      }
                    }}
                  >
                    View Job Details →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <button
          className="back-home-button applications-home-button"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

export default MyApplications