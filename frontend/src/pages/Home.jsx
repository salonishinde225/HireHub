import '../App.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

function Home() {
const [jobs, setJobs] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const navigate = useNavigate()

const savedUser = localStorage.getItem('hirehub_user')
const currentUser = savedUser ? JSON.parse(savedUser) : null

const handleLogout = () => {
  localStorage.removeItem('hirehub_token')
  localStorage.removeItem('hirehub_user')
  navigate('/')
  window.location.reload()
}


useEffect(() => {
  const fetchJobs = async () => {
    try {
      const response = await API.get('jobs/')
      setJobs(response.data)
    } catch (err) {
      setError('Unable to load jobs. Please try again later.')
      console.error('Error fetching jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  fetchJobs()
}, [])
  return (
    <div className="app">
      <nav className="navbar">
        <h2 className="logo">Hire<span>Hub</span></h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#jobs">Find Jobs</a>
          <a href="#about">About</a>
        </div>

      <div className="nav-buttons">
  {currentUser ? (
    <>
      <span>Hi, {currentUser.username}</span>
      <button className="login-btn" onClick={handleLogout}>
        Logout
      </button>
    </>
  ) : (
    <>
      <button
        className="login-btn"
        onClick={() => navigate('/login')}
      >
        Login
      </button>

      <button
        className="register-btn"
        onClick={() => navigate('/register')}
      >
        Register
      </button>
    </>
  )}
</div>
      </nav>

      <section className="hero" id="home">
        <p className="tagline">YOUR CAREER STARTS HERE</p>
        <h1>Find Your <span>Dream Job</span> Today</h1>
        <p className="hero-text">
          Discover opportunities, connect with employers, and take the next
          step in your career with HireHub.
        </p>

        <div className="search-box">
          <input type="text" placeholder="Job title or keyword" />
          <input type="text" placeholder="Location" />
          <button onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore Jobs
          </button>
        </div>
      </section>

        <section className="jobs-section" id="jobs">
        <p className="tagline">OPPORTUNITIES FOR YOU</p>
        <h2>Latest Job Openings</h2>
        <p>Explore real opportunities available on HireHub.</p>

        {loading && <p>Loading jobs...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && jobs.length === 0 && (
          <p>No active jobs available right now.</p>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="job-cards">
            {jobs.map((job) => (
              <div className="job-card" key={job.id}>
                <h3>{job.title}</h3>
                <p className="job-company">{job.company}</p>
                <p>Location: {job.location}</p>
                <p>
                  Salary: ₹{Number(job.salary).toLocaleString('en-IN')} / month
                </p>
                <p>{job.description}</p>
                <span>{job.skills}</span>
                <p className="job-deadline">
                  Application deadline: {job.deadline}
                </p>
                <button className="view-btn"onClick={() => navigate(`/jobs/${job.id}`)}>
                View Details
                </button>
                
              </div>
            ))}
          </div>
        )}
      </section>

      

      <footer id="about">
        <h2 className="logo">Hire<span>Hub</span></h2>
        <p>Connecting talent with opportunity.</p>
        <p>© 2026 HireHub Job Portal</p>
      </footer>
    </div>
  )
}

export default Home