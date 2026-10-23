import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom'

function RecruiterDashboard() {
    const navigate = useNavigate()
    const user = JSON.parse(
    localStorage.getItem('hirehub_user') || 'null'
  );

 const handleLogout = () => {
  localStorage.removeItem('hirehub_token')
  localStorage.removeItem('hirehub_user')
  navigate('/', { replace: true })
}
 const [formData, setFormData] = useState({
  title: '',
  company: '',
  location: '',
  job_type: '',
  salary: '',
  skills: '',
  description: '',
  deadline: '',
});

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');

  const [editingJobId, setEditingJobId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: '',
    salary: '',
    skills: '',
    description: '',
    deadline: '',
  });
  const [editMessage, setEditMessage] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    const token = localStorage.getItem('hirehub_token');

    if (!token) {
      setApplicationsError('Please log in to view applications.');
      return;
    }

    try {
      setApplicationsLoading(true);
      setApplicationsError('');

      const response = await API.get('recruiter-applications/', {
        headers: { Authorization: `Token ${token}` },
      });

      setApplications(response.data);
    } 
    
    catch (error) {
      console.error('Fetch applications error:', error.response?.data || error);

      if (error.response?.status === 401) {
        setApplicationsError('Your session has expired. Please log in again.');
      } else if (error.response?.status === 403) {
        setApplicationsError(
          'Your recruiter account may not be approved yet. Please contact the administrator.'
        );
      } else {
        setApplicationsError('Unable to load applications. Please try again.');
      }
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

    
    

  const fetchMyJobs = useCallback(async () => {
    const token = localStorage.getItem('hirehub_token');

    if (!token) {
      setJobsError('Please log in to view your jobs.');
      return;
    }

    try {
      setJobsLoading(true);
      setJobsError('');

      const response = await API.get('my-jobs/', {
        headers: { Authorization: `Token ${token}` },
      });

      setJobs(response.data);
    
    } catch (error) {
      console.error('Fetch jobs error:', error.response?.data || error);

      if (error.response?.status === 401) {
        setJobsError('Your session has expired. Please log in again.');
      } else if (error.response?.status === 403) {
        setJobsError(
          'Your recruiter account may not be approved yet. Please contact the administrator.'
        );
      } else {
        setJobsError('Unable to load your jobs. Please try again.');
      }
    } finally {
      setJobsLoading(false);
    }
}, []);

  useEffect(() => {
    fetchApplications();
    fetchMyJobs();
  }, [fetchApplications, fetchMyJobs]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const createJob = async (event) => {
    event.preventDefault();
    setMessage('');

    const token = localStorage.getItem('hirehub_token');

    if (!token) {
      setMessage('Please log in first.');
      return;
    }

    try {
      setLoading(true);

      await API.post('jobs/create/', formData, {
        headers: { Authorization: `Token ${token}` },
      });

      setMessage('Job created successfully!');

  setFormData({
  title: '',
  company: '',
  location: '',
  job_type: '',
  salary: '',
  skills: '',
  description: '',
  deadline: '',
});

      fetchMyJobs();
    } catch (error) {
      console.error('Create job error:', error.response?.data || error);
      const errorData = error.response?.data;

      setMessage(
        typeof errorData === 'object'
          ? JSON.stringify(errorData)
          : errorData || 'Unable to create job.'
      );
    } finally {
      setLoading(false);
    }
  };

   const startEditing = (job) => {
  setEditingJobId(job.id);

  setEditFormData({
    title: job.title || '',
    company: job.company || '',
    location: job.location || '',
    job_type: job.job_type || 'Full-time',
    salary: job.salary ?? '',
    skills: job.skills || '',
    description: job.description || '',
    deadline: job.deadline || '',
  });

  setEditMessage('');
};
  const saveEditedJob = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('hirehub_token');

    if (!token || !editingJobId) {
      setEditMessage('Unable to edit this job. Please log in again.');
      return;
    }

    try {
      setEditLoading(true);
      setEditMessage('');

      const response = await API.patch(
        `jobs/${editingJobId}/manage/`,
        editFormData,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setJobs((previousJobs) =>
        previousJobs.map((job) =>
          job.id === editingJobId ? response.data : job
        )
      );

      setEditMessage('Job updated successfully!');
      setEditingJobId(null);
    } catch (error) {
      console.error('Edit job error:', error.response?.data || error);
      const errorData = error.response?.data;

      setEditMessage(
        typeof errorData === 'object'
          ? JSON.stringify(errorData)
          : errorData || 'Unable to update job.'
      );
    } finally {
      setEditLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this job? This action cannot be undone.'
    );

    if (!confirmed) return;

    const token = localStorage.getItem('hirehub_token');

    if (!token) {
      alert('Please log in again.');
      return;
    }

    try {
      await API.delete(`jobs/${jobId}/manage/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setJobs((previousJobs) =>
        previousJobs.filter((job) => job.id !== jobId)
      );

      if (editingJobId === jobId) {
        setEditingJobId(null);
        setEditMessage('');
      }

      alert('Job deleted successfully!');
    } catch (error) {
      console.error('Delete job error:', error.response?.data || error);
      alert(error.response?.data?.error || 'Unable to delete job.');
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    const token = localStorage.getItem('hirehub_token');

    try {
      await API.patch(
        `applications/${applicationId}/status/`,
        { status: newStatus },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setApplications((previousApplications) =>
        previousApplications.map((application) =>
          application.id === applicationId
            ? { ...application, status: newStatus }
            : application
        )
      );
    } catch (error) {
      console.error('Update status error:', error.response?.data || error);
      alert(
        error.response?.data?.error ||
          'Unable to update application status.'
      );
    }
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
    border: '1px solid #e2e8f0',
    marginBottom: '28px',
  };

  const sectionHeadingStyle = {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 0,
    marginBottom: '22px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
   marginBottom: '4px',
  };

  const primaryButtonStyle = {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '12px 18px',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const secondaryButtonStyle = {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    padding: '10px 14px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const dangerButtonStyle = {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '10px 14px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    alignItems: 'start',
  };

    if (user?.role !== 'recruiter') {
    return (
      <div className="container mt-5 text-center">
        <h2>Access Denied</h2>
        <p>Only recruiters can access the Recruiter Dashboard.</p>
      </div>
    );
  }

  return (
   <div
  className="recruiter-dashboard"
  style={{
    maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        color: '#1e293b',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ marginBottom: '32px' }}>
        <p
          style={{
            color: '#2563eb',
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          Recruiter Workspace
        </p>

        
<div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '14px',
  }}
>
  <div />

  <h1
    style={{
      fontSize: '32px',
      fontWeight: '800',
      margin: 0,
      color: '#0f172a',
      textAlign: 'center',
    }}
  >
    Recruiter Dashboard
  </h1>

  <div
    style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      flexWrap: 'wrap',
    }}
  >
    <button
      type="button"
      onClick={() => navigate('/')}
      style={{
        backgroundColor: '#eff6ff',
        color: '#1d4ed8',
        border: '1px solid #bfdbfe',
        padding: '10px 16px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
      }}
    >
      Home
    </button>

    <button
      type="button"
      onClick={handleLogout}
      style={{
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        border: '1px solid #fecaca',
        padding: '10px 16px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
      }}
    >
      Logout
    </button>
  </div>
</div>
 <p style={{ color: '#64748b', margin: 0, lineHeight: 1.6 }}>
          Manage your job postings, track applicants, and grow your team.
        </p>
      </div>

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Create a Job</h2>

        <form onSubmit={createJob} style={formGridStyle}>
          <label style={labelStyle}>
            Job Title
            <input
              style={inputStyle}
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Python Developer"
              required
            />
          </label>

          <label style={labelStyle}>
            Company
            <input
              style={inputStyle}
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company name"
              required
            />
          </label>

          <label style={labelStyle}>
            Location
            <input
              style={inputStyle}
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Pune"
              required
            />
          </label>
          <label style={labelStyle}>
  Job Type
  <select
    style={inputStyle}
    name="job_type"
    value={formData.job_type}
    onChange={handleChange}
    required
  >
    <option value="">Select Job Type</option>
    <option value="Full-time">Full-time</option>
    <option value="Part-time">Part-time</option>
    <option value="Internship">Internship</option>
    <option value="Contract">Contract</option>
    <option value="Remote">Remote</option>
  </select>
</label>

          <label style={labelStyle}>
            Annual Salary (₹)
            <input
              style={inputStyle}
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. 600000"
              min="0"
              required
            />
          </label>

          <label style={labelStyle}>
            Skills
            <input
              style={inputStyle}
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Python, Django, MySQL"
              required
            />
          </label>

          <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
            Job Description
            <textarea
              style={{ ...inputStyle, resize: 'vertical' }}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job responsibilities"
              rows="4"
              required
            />
          </label>

          <label style={labelStyle}>
            Application Deadline
            <input
  style={{
    ...inputStyle,
    colorScheme: 'light',
    cursor: 'pointer',
    minWidth: 0,
    width: '100%',
  }}
  type="date"
  name="deadline"
  value={formData.deadline}
  onChange={handleChange}
  required
/>
          </label>

          <div style={{ alignSelf: 'end' }}>
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>

        {message && (
          <p role="status" style={{ marginBottom: 0, color: '#2563eb' }}>
            {message}
          </p>
        )}
      </section>

      <section style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <h2 style={sectionHeadingStyle}>My Jobs</h2>

          <button
  type="button"
  onClick={fetchMyJobs}
  disabled={jobsLoading}
  style={{
    ...secondaryButtonStyle,
    marginBottom: '20px',
  }}
>
  {jobsLoading ? 'Loading...' : 'Refresh My Jobs'}
</button>
        </div>

        {jobsError && <p role="alert" style={{ color: '#b91c1c' }}>{jobsError}</p>}

        {!jobsLoading && !jobsError && jobs.length === 0 && (
          <p style={{ color: '#64748b' }}>You have not posted any jobs yet.</p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '18px',
          }}
        >
          {jobs.map((job) => (
          <article
  key={job.id}
  style={{
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    backgroundColor: '#ffffff',
    textAlign: 'left',
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
  }}
>
  <h3
  style={{
    marginTop: 0,
    marginBottom: '18px',
    color: '#0f172a',
    fontSize: '21px',
    fontWeight: '700',
    lineHeight: 1.4,
  }}
>
  {job.title}
</h3>
<p style={{ margin: '10px 0', lineHeight: 1.6 }}>
  <strong>Company:</strong> {job.company}
</p>
<p style={{ margin: '10px 0', lineHeight: 1.6 }}>
  <strong>Location:</strong> {job.location}
</p>
<p style={{ margin: '10px 0', lineHeight: 1.6 }}>
  <strong>Job Type:</strong> {job.job_type || 'Not specified'}
</p>
<p style={{ margin: '10px 0', lineHeight: 1.6 }}>
  <strong>Annual Salary:</strong>{' '}
  ₹{Number(job.salary).toLocaleString('en-IN')}
</p>
<p style={{ margin: '10px 0', lineHeight: 1.6 }}>
  <strong>Skills:</strong> {job.skills}
</p>
<p style={{ margin: '10px 0 20px', lineHeight: 1.6 }}>
  <strong>Deadline:</strong> {job.deadline}
</p>

              <div
  style={{
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: '8px',
  }}
>
                <button
  style={primaryButtonStyle}
  onClick={() => startEditing(job)}
>
  Edit
</button>

                <button
                  type="button"
                  onClick={() => deleteJob(job.id)}
                  style={dangerButtonStyle}
                >
                  Delete Job
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {editingJobId !== null && (
        <section style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Edit Job</h2>

          <form onSubmit={saveEditedJob} style={formGridStyle}>
            <label style={labelStyle}>
              Job Title
              <input
                style={inputStyle}
                value={editFormData.title}
                onChange={(event) =>
                  setEditFormData({ ...editFormData, title: event.target.value })
                }
                required
              />
            </label>

            <label style={labelStyle}>
              Company
              <input
                style={inputStyle}
                value={editFormData.company}
                onChange={(event) =>
                  setEditFormData({ ...editFormData, company: event.target.value })
                }
                required
              />
            </label>

             <label style={labelStyle}>
              Location
              <input
                style={inputStyle}
                value={editFormData.location}
                onChange={(event) =>
                  setEditFormData({ ...editFormData, location: event.target.value })
                }
                required
              />
            </label>




             <label style={labelStyle}>
  Job Type
  <select
    style={inputStyle}
    value={editFormData.job_type}
    onChange={(event) =>
      setEditFormData({
        ...editFormData,
        job_type: event.target.value,
      })
    }
    required
  >
    <option value="Full-time">Full-time</option>
    <option value="Part-time">Part-time</option>
    <option value="Internship">Internship</option>
    <option value="Contract">Contract</option>
    <option value="Remote">Remote</option>
  </select>
</label>

            <label style={labelStyle}>
              Annual Salary (₹)
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={editFormData.salary}
                onChange={(event) =>
                  setEditFormData({ ...editFormData, salary: event.target.value })
                }
                required
              />
            </label>

            <label style={labelStyle}>
              Skills
              <input
                style={inputStyle}
                value={editFormData.skills}
                onChange={(event) =>
                  setEditFormData({ ...editFormData, skills: event.target.value })
                }
                required
              />
            </label>

            <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
              Job Description
              <textarea
                style={{ ...inputStyle, resize: 'vertical' }}
                rows="4"
                value={editFormData.description}
                onChange={(event) =>
                  setEditFormData({
                    ...editFormData,
                    description: event.target.value,
                  })
                }
                required
              />
            </label>

            <label style={labelStyle}>
              Application Deadline
              <input
                style={inputStyle}
                type="date"
                value={editFormData.deadline}
                onChange={(event) =>
                  setEditFormData({ ...editFormData, deadline: event.target.value })
                }
                required
              />
            </label>

            <div style={{ display: 'flex', gap: '10px', alignSelf: 'end' }}>
              <button
                type="submit"
                disabled={editLoading}
                style={primaryButtonStyle}
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => {
                  setEditingJobId(null);
                  setEditMessage('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>

          {editMessage && <p role="status">{editMessage}</p>}
        </section>
      )}

      <section style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <h2 style={sectionHeadingStyle}>Applications Received</h2>

          <button
            type="button"
            onClick={fetchApplications}
            disabled={applicationsLoading}
            style={secondaryButtonStyle}
          >
            {applicationsLoading ? 'Loading...' : 'Refresh Applications'}
          </button>
        </div>

        
        {applicationsLoading && !applicationsError && (
          <p style={{ color: '#64748b' }}>Loading applications...</p>
        )}

        {applicationsError && (
          <p role="alert" style={{ color: '#b91c1c' }}>
            {applicationsError}
          </p>
        )}


        {!applicationsLoading &&
          !applicationsError &&
          applications.length === 0 && (
            <p style={{ color: '#64748b' }}>
              No applications received for your jobs yet.
            </p>
          )}

        <div style={{ display: 'grid', gap: '22px', marginTop: '20px' }}>
          {applications.map((application) => (
            
<article
  key={application.id}
  className="application-card"
  style={{
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    background: '#ffffff',
    textAlign: 'left',
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
  }}
>
  {/* Application header */}
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      paddingBottom: '18px',
      borderBottom: '1px solid #e2e8f0',
    }}
  >
    <div>
      <p
        style={{
          color: '#64748b',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: '0 0 6px',
        }}
      >
        Job application
      </p>

      <h3
        style={{
          margin: 0,
          color: '#0f172a',
          fontSize: '21px',
          fontWeight: '750',
        }}
      >
        {application.job_title}
      </h3>
    </div>

    <span
      style={{
        backgroundColor:
          application.status === 'shortlisted'
            ? '#dcfce7'
            : application.status === 'rejected'
              ? '#fee2e2'
              : application.status === 'reviewed'
                ? '#dbeafe'
                : '#f1f5f9',
        color:
          application.status === 'shortlisted'
            ? '#166534'
            : application.status === 'rejected'
              ? '#991b1b'
              : application.status === 'reviewed'
                ? '#1d4ed8'
                : '#475569',
        padding: '7px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: '750',
        letterSpacing: '0.4px',
        whiteSpace: 'nowrap',
      }}
    >
      {(application.status || 'pending').toUpperCase()}
    </span>
  </div>

  {/* Applicant information */}
  <div
    className="application-info-grid"
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '14px',
      margin: '20px 0',
    }}
  >
    <div
      style={{
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '10px',
      }}
    >
      <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 6px' }}>
        Applicant
      </p>
      <p style={{ color: '#0f172a', fontWeight: '700', margin: 0 }}>
        {application.applicant_username || application.applicant || 'Applicant'}
      </p>
    </div>

    <div
      style={{
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '10px',
      }}
    >
      <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 6px' }}>
        Application ID
      </p>
      <p style={{ color: '#0f172a', fontWeight: '700', margin: 0 }}>
        #{application.id}
      </p>
    </div>

    <div
      style={{
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '10px',
      }}
    >
      <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 6px' }}>
        Applied on
      </p>
      <p style={{ color: '#0f172a', fontWeight: '700', margin: 0 }}>
        {application.applied_at
          ? new Date(application.applied_at).toLocaleDateString('en-IN')
          : 'Not available'}
      </p>
    </div>
  </div>

  {/* Company and resume */}
  <div style={{ marginBottom: '20px' }}>
    <p style={{ margin: '0 0 12px', color: '#475569', fontSize: '14px' }}>
      <strong style={{ color: '#334155' }}>Company:</strong>{' '}
      {application.company || 'Not specified'}
    </p>

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        padding: '14px 16px',
        background: '#eff6ff',
        border: '1px solid #dbeafe',
        borderRadius: '10px',
      }}
    >
      <div>
        <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#1e3a8a' }}>
          Applicant Resume
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
          {application.resume
            ? 'Open the submitted resume'
            : 'No resume has been provided'}
        </p>
      </div>

      {application.resume && (
        <a
          href={application.resume}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#1d4ed8',
            fontWeight: '700',
            fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          View Resume ↗
        </a>
      )}
    </div>
  </div>

  {/* Cover letter */}
  <div
    style={{
      padding: '18px',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      background: '#fafbff',
      marginBottom: '22px',
    }}
  >
    <h4
      style={{
        margin: '0 0 10px',
        color: '#0f172a',
        fontSize: '15px',
      }}
    >
      Cover Letter
    </h4>

    <p
      style={{
        color: '#475569',
        lineHeight: 1.8,
        fontSize: '14px',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        margin: 0,
      }}
    >
      {application.cover_letter || 'No cover letter provided.'}
    </p>
  </div>

  {/* Status update */}
  <div
    style={{
      display: 'flex',
      alignItems: 'end',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap',
    }}
  >
    <div style={{ flex: '1 1 220px' }}>
      <label
        htmlFor={`status-${application.id}`}
        style={{
          display: 'block',
          color: '#334155',
          fontWeight: '700',
          fontSize: '14px',
          marginBottom: '8px',
        }}
      >
        Update Application Status
      </label>

      <select
        id={`status-${application.id}`}
        value={application.status}
        onChange={(event) =>
          updateStatus(application.id, event.target.value)
        }
        style={{
          width: '100%',
          maxWidth: '300px',
          padding: '12px',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          background: '#ffffff',
          color: '#0f172a',
          fontSize: '14px',
        }}
      >
        <option value="pending" disabled>
          Pending
        </option>
        <option value="reviewed">Reviewed</option>
        <option value="shortlisted">Shortlisted</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>

    <span style={{ fontSize: '12px', color: '#64748b' }}>
      Application #{application.id}
    </span>
  </div>
</article>

          ))}
        </div>
      </section>
    </div>
  );
}

export default RecruiterDashboard;