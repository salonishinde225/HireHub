# HireHub — Job Portal & Recruitment Management System

HireHub is a web-based job portal that connects job seekers with recruiters. Job seekers can explore job opportunities, submit applications, and track their application status. Recruiters can manage job postings and review applications.

## Features

### Job Seeker
- User registration and login
- Browse available job listings
- View job details, salary, required skills, and deadlines
- Apply for jobs with a resume link and cover letter
- Track application status
- View application history

### Recruiter
- Recruiter dashboard with access restrictions
- Create, edit, and delete job postings
- View applications received for posted jobs
- Review applicant resume links and cover letters
- Update application statuses to Reviewed, Shortlisted, or Rejected

## Technology Stack

- **Frontend:** React.js, JavaScript, CSS
- **Backend:** Python, Django, Django REST Framework
- **Database:** MySQL
- **Development Tools:** VS Code, Git, GitHub

## Project Structure

```text
HireHub/
├── backend/
│   ├── config/
│   └── jobs/
├── frontend/
│   ├── src/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

Install the following tools before running the project:

- Python
- Node.js and npm
- MySQL Server
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/salonishinde225/HireHub.git
cd HireHub
```

### 2. Set Up the Backend

Open a terminal in the project root and run:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configure your local environment variables and MySQL database according to the Django settings.

Run the database migrations:

```powershell
python manage.py migrate
```

Start the Django development server:

```powershell
python manage.py runserver
```

The backend will normally be available at `http://127.0.0.1:8000/`.

### 3. Set Up the Frontend

Open a **second terminal** in the project root and run:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal, usually `http://localhost:5173/`.

## Testing

The project includes Django automated tests for important backend behaviours, including:

- Job listing and detail endpoints
- Job seeker permissions
- Application deadline validation
- Duplicate application prevention
- Application status validation
- Recruiter ownership permissions

The existing automated test suite passed **8 tests** in the latest recorded test run.

Run the tests from the backend directory:

```powershell
python manage.py test
```

## Security Notes

- Keep `.env` files and credentials private.
- Do not commit database passwords or Django secret keys to GitHub.
- Configure appropriate production settings before deployment.
- The Django development server is intended for local development, not production hosting.

## Future Improvements

- Deploy the frontend and backend
- Add screenshots and a live demo
- Improve automated test coverage
- Add further validation and error handling where needed

## Author

**Saloni Shinde**

GitHub: [salonishinde225](https://github.com/salonishinde225)
