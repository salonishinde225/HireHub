import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import JobDetails from './pages/JobDetails'
import ApplyJob from './pages/ApplyJob'
import MyApplications from './pages/MyApplications'
import RecruiterDashboard from './pages/RecruiterDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/jobs/:id/apply" element={<ApplyJob />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/recruiter-dashboard"element={<RecruiterDashboard />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App