# HireHub – Job Portal & Recruitment Management System

HireHub is a full-stack web application that connects job seekers with recruiters. Job seekers can browse job opportunities, apply for positions, and track their application status. Recruiters can manage job postings and review applications submitted to their jobs.

## Features

### Job Seekers
- Register and log in to the platform.
- Browse available job listings.
- View job details.
- Apply for jobs.
- Track application status.

### Recruiters
- Register as a recruiter and follow the approval workflow.
- Create, edit, and delete job postings.
- View applications submitted to their job postings.
- Update application statuses.

### Security
- Role-based permissions.
- Protected application pages.
- Recruiter ownership checks for job management.
- Prevention of duplicate applications for the same job.

## Technology Stack

**Frontend**
- React
- JavaScript
- HTML5
- CSS3
- Vite

**Backend**
- Python
- Django
- Django REST Framework

**Database**
- MySQL

**Tools**
- Git and GitHub
- Visual Studio Code

## Project Structure

```text
HireHub/
├── backend/
│   ├── config/
│   ├── jobs/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Python 3.12
- Node.js and npm
- MySQL Server
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/salonishinde225/HireHub.git
cd HireHub
```

### 2. Set Up the MySQL Database

Open MySQL Workbench and execute:

```sql
CREATE DATABASE hirehub;
```

If the database already exists, you can use the existing database instead.

### 3. Set Up the Backend

Open a terminal in the project root and run:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a file named `.env` inside the `backend/` directory. Add your own local configuration:

```dotenv
DJANGO_SECRET_KEY=your_local_secret_key
DB_NAME=hirehub
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

Replace the example values with your own configuration. Do not commit your actual `.env` file to GitHub.

Apply database migrations:

```powershell
python manage.py migrate
```

Start the Django development server:

```powershell
python manage.py runserver
```

The backend will be available at:

http://127.0.0.1:8000/

### 4. Set Up the Frontend

Open a second terminal in the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, typically:

http://localhost:5173/

Keep both development servers running while using the application.

## Future Improvements

- Add automated tests for important workflows.
- Further improve responsive design and accessibility.
- Deploy the frontend and backend.
- Add more recruiter and job seeker analytics.

## Author

**Saloni Shinde**

- GitHub: https://github.com/salonishinde225
- Project Repository: https://github.com/salonishinde225/HireHub
