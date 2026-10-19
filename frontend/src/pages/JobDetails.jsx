
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

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await API.get(`jobs/${id}/`)
        setJob(response.data)
      } catch (err) {
        setError('Unable to load job details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  if (loading) {
    return <div className="job-details-page">Loading job details...</div>
  }

  if (error || !job) {
    return (
      <div className="job-details-page">
        <p>{error || 'Job not found.'}</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    )
  }

  return (
    <div className="job-details-page">
      <button onClick={() => navigate('/')}>← Back to Jobs</button>

      <div className="job-details-card">
        <h1>{job.title}</h1>
        <h3>{job.company}</h3>

        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Salary:</strong> ₹{job.salary}</p>
        <p><strong>Skills:</strong> {job.skills}</p>

        <h3>Job Description</h3>
        <p>{job.description}</p>

        <p>
          <strong>Application Deadline:</strong> {job.deadline}
        </p>

        <button
  className="register-btn"
  onClick={() => {
    const token = localStorage.getItem('hirehub_token')

    if (token) {
      navigate(`/jobs/${id}/apply`)
    } else {
      navigate('/login')
    }
  }}
>
  Apply for This Job
</button>
      </div>
    </div>
  )
}

export default JobDetails
