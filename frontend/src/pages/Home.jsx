import '../App.css'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

function Home() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [searched, setSearched] = useState(false)

  const navigate = useNavigate()

  const savedUser = localStorage.getItem('hirehub_user')
  const currentUser = savedUser ? JSON.parse(savedUser) : null

  const handleLogout = () => {
    localStorage.removeItem('hirehub_token')
    localStorage.removeItem('hirehub_user')
    navigate('/', { replace: true })
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

  const filteredJobs = useMemo(() => {
    const keywordQuery = keyword.trim().toLowerCase()
    const locationQuery = location.trim().toLowerCase()

    return jobs.filter((job) => {
      const searchableText = [
        job.title,
        job.company,
        job.skills,
        job.description,
        job.job_type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesKeyword =
        !keywordQuery || searchableText.includes(keywordQuery)

      const matchesLocation =
        !locationQuery ||
        String(job.location || '').toLowerCase().includes(locationQuery)

      return matchesKeyword && matchesLocation
    })
  }, [jobs, keyword, location])

  const handleSearch = (event) => {
    event.preventDefault()
    setSearched(true)
    document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })
  }

  const clearSearch = () => {
    setKeyword('')
    setLocation('')
    setSearched(false)
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h2 className="logo">
          Hire<span>Hub</span>
        </h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#jobs">Find Jobs</a>
          <a href="#about">About</a>

          {currentUser?.role === 'job_seeker' && (
            <button
              type="button"
              className="nav-link-button"
              onClick={() => navigate('/my-applications')}
            >
              My Applications
            </button>
          )}

          {currentUser?.role === 'recruiter' && (
            <button
              type="button"
              className="nav-link-button"
              onClick={() => navigate('/recruiter-dashboard')}
            >
              Dashboard
            </button>
          )}
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
        <h1>
          Find Your <span>Dream Job</span> Today
        </h1>
        <p className="hero-text">
          Discover opportunities, connect with employers, and take the next
          step in your career with HireHub.
        </p>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Job title, company, or skill"
            aria-label="Search jobs by title, company, or skill"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <input
            type="text"
            placeholder="Location (e.g. Pune)"
            aria-label="Filter jobs by location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
          <button type="submit">Search Jobs</button>
        </form>
      </section>

      <section className="jobs-section" id="jobs">
        <p className="tagline">OPPORTUNITIES FOR YOU</p>
        <h2>Latest Job Openings</h2>
        <p>Explore real opportunities available on HireHub.</p>

        {!loading && !error && (
          <p className="job-results-count" aria-live="polite">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
          </p>
        )}

        {loading && <p>Loading jobs...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="empty-applications">
            <h3>No matching jobs found</h3>
            <p>Try another job title, skill, company, or location.</p>
            <button type="button" onClick={clearSearch}>
              Clear Search
            </button>
          </div>
        )}

        {!loading && !error && filteredJobs.length > 0 && (
          <>
            {searched && (
              <button
                type="button"
                className="back-home-button"
                onClick={clearSearch}
              >
                Clear Search
              </button>
            )}

            <div className="job-cards">
              {filteredJobs.map((job) => (
                <div className="job-card" key={job.id}>
                  <h3>{job.title}</h3>
                  <p className="job-company">{job.company}</p>
                  <p>Location: {job.location || 'Not specified'}</p>
                  <p>
                   Salary: ₹{Number(job.salary).toLocaleString('en-IN')} / year
                  </p>
                  <p>{job.description}</p>
                  {job.skills && <span>{job.skills}</span>}
                  <p className="job-deadline">
                    Application deadline: {job.deadline || 'Not specified'}
                  </p>
                  <button
                    type="button"
                    className="view-btn"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <footer id="about">
        <h2 className="logo">
          Hire<span>Hub</span>
        </h2>
        <p>Connecting talent with opportunity.</p>
        <p>© 2026 HireHub Job Portal</p>
      </footer>
    </div>
  )
}

export default Home