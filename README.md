# HireHub – Job Portal & Recruitment Management System

HireHub is a full-stack web application designed to connect job seekers with recruiters. Job seekers can explore job opportunities and track their applications, while recruiters can post jobs and manage applications.

## Features

### Job Seekers
- User registration and login
- Browse available job listings
- View job details
- Apply for jobs
- Track application status

### Recruiters
- Recruiter registration and approval workflow
- Create, edit, and delete job postings
- View applications for their job postings
- Update application statuses

### Security
- Role-based permissions
- Protected application pages
- Recruiter ownership checks for job management
- Prevention of duplicate job applications

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
- Git
- GitHub
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
- Python 3.12
- Node.js and npm
- MySQL Server

### 1. Clone the repository

```bash
git clone https://github.com/salonishinde225/HireHub.git
cd HireHub
```

### 2. Set up the backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install django djangorestframework mysqlclient python-dotenv
```

Create a `.env` file in the `backend/` directory and configure your local settings:

```dotenv
DJANGO_SECRET_KEY=your_secret_key
DB_NAME=hirehub
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

Create the `hirehub` database in MySQL, then run:

```powershell
python manage.py migrate
python manage.py runserver
```

The backend will run at `http://127.0.0.1:8000/`.

### 3. Set up the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will run at the local URL displayed by Vite, typically `http://localhost:5173/`.

## Future Improvements
- Add automated tests for important workflows
- Improve responsive design and accessibility
- Deploy the frontend and backend
- Add more recruiter and job seeker analytics

## Author

**Saloni Shinde**

GitHub: [salonishinde225](https://github.com/salonishinde225)
