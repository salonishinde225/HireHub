
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

        setApplications(response.data)
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

  if (loading) {
    return <div className="applications-page"><p>Loading applications...</p></div>
  }

  return (
    <div className="applications-page">
      <div className="applications-container">
        <h1>My Applications</h1>
        <p className="applications-subtitle">
          Track the status of the jobs you have applied for.
        </p>

        {error && <p className="error-message">{error}</p>}

        {!error && applications.length === 0 && (
          <div className="empty-applications">
            <h3>No applications yet</h3>
            <p>You haven't applied for any jobs yet.</p>
            <button onClick={() => navigate('/')}>
              Browse Jobs
            </button>
          </div>
        )}

        {applications.length > 0 && (
          <div className="applications-list">
            {applications.map((application) => (
              <div className="application-card" key={application.id}>
                <h2>{application.job_title || 'Job Application'}</h2>

                <p>
                  <strong>Company:</strong>{' '}
                  {application.company || 'Not specified'}
                </p>

                <p>
                  <strong>Application ID:</strong> {application.id}
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`application-status status-${(application.status || 'pending').toLowerCase()}`}>
                    {application.status || 'Pending'}
                   </span>
                </p>

                <p>
                  <strong>Applied on:</strong>{' '}
                  {application.applied_at
                    ? new Date(application.applied_at).toLocaleDateString()
                    : 'Not available'}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          className="back-home-button"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default MyApplications
