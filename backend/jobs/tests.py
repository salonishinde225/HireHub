
from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Job, UserProfile


class JobDeadlineTest(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="deadline_test_user",
            password="TestPassword123!"
        )

        UserProfile.objects.create(
            user=self.user,
            role="job_seeker"
        )

        self.job = Job.objects.create(
            title="Deadline Test Job",
            company="Test Company",
            location="Pune",
            job_type="Full-time",
            salary=25000,
            skills="Python",
            description="Test job for deadline validation",
            deadline=timezone.localdate() - timedelta(days=1),
            is_active=True,
        )

        self.client.force_authenticate(user=self.user)

    def test_application_rejected_after_deadline(self):
        response = self.client.post(
            f"/api/jobs/{self.job.id}/apply/",
            {
                "resume": "https://example.com/resume.pdf",
                "cover_letter": "Test application"
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data["error"],
            "The application deadline for this job has passed"
        )
        
    def test_job_list_api_returns_success(self):
        response = self.client.get("/api/jobs/")

        self.assertEqual(response.status_code, 200)
        
    def test_job_detail_api_returns_success(self):
        response = self.client.get(
            f"/api/jobs/{self.job.id}/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["title"],
            "Deadline Test Job"
        )
    def test_job_seeker_cannot_create_job(self):
        response = self.client.post(
            "/api/jobs/create/",
            {
                "title": "Unauthorized Test Job",
                "company": "Test Company",
                "location": "Pune",
                "job_type": "Full-time",
                "salary": "25000",
                "skills": "Python",
                "description": "Permission test",
                "deadline": (
                    timezone.localdate() + timedelta(days=7)
                ).isoformat(),
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        
    def test_duplicate_application_is_rejected(self):
        self.job.deadline = (
            timezone.localdate() + timedelta(days=7)
        )
        self.job.save()

        first_response = self.client.post(
            f"/api/jobs/{self.job.id}/apply/",
            {
                "resume": "https://example.com/resume.pdf",
                "cover_letter": "First application",
            },
            format="json",
        )

        self.assertEqual(first_response.status_code, 201)

        second_response = self.client.post(
            f"/api/jobs/{self.job.id}/apply/",
            {
                "resume": "https://example.com/resume.pdf",
                "cover_letter": "Duplicate application",
            },
            format="json",
        )

        self.assertIn(
            second_response.status_code,
            [400, 409],
        )
        

    def test_invalid_application_status_is_rejected(self):
        from jobs.models import Application

        recruiter = User.objects.create_user(
            username="status_test_recruiter",
            password="TestPassword123!"
        )

        UserProfile.objects.create(
            user=recruiter,
            role="recruiter",
            is_approved=True
        )

        self.job.created_by = recruiter
        self.job.save(update_fields=["created_by"])

        application = Application.objects.create(
            job=self.job,
            applicant=self.user,
            resume="https://example.com/resume.pdf",
            cover_letter="Status validation test"
        )

        self.client.force_authenticate(user=recruiter)

        response = self.client.patch(
            f"/api/applications/{application.id}/status/",
            {"status": "hired"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Invalid status")
        self.assertIn("shortlisted", response.data["allowed_statuses"])



    def test_recruiter_cannot_update_another_recruiters_application(self):
        from jobs.models import Application

        other_recruiter = User.objects.create_user(
            username="other_recruiter",
            password="TestPassword123!"
        )

        UserProfile.objects.create(
            user=other_recruiter,
            role="recruiter",
            is_approved=True
        )

        # The job belongs to the original recruiter.
        owner = User.objects.create_user(
            username="job_owner",
            password="TestPassword123!"
        )

        UserProfile.objects.create(
            user=owner,
            role="recruiter",
            is_approved=True
        )

        self.job.created_by = owner
        self.job.save(update_fields=["created_by"])

        application = Application.objects.create(
            job=self.job,
            applicant=self.user,
            resume="https://example.com/resume.pdf",
            cover_letter="Ownership test"
        )

        # Authenticate as a different approved recruiter.
        self.client.force_authenticate(user=other_recruiter)

        response = self.client.patch(
            f"/api/applications/{application.id}/status/",
            {"status": "shortlisted"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.data["error"],
            "You can only update applications for your own jobs"
        )

        application.refresh_from_db()
        self.assertEqual(application.status, "pending")

    def test_job_seeker_cannot_update_application_status(self):
        from jobs.models import Application

        self.job.created_by = User.objects.create_user(
            username="permission_test_owner",
            password="TestPassword123!"
        )
        self.job.save(update_fields=["created_by"])

        application = Application.objects.create(
            job=self.job,
            applicant=self.user,
            resume="https://example.com/resume.pdf",
            cover_letter="Permission test"
        )

        # self.user is the job seeker created in setUp().
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f"/api/applications/{application.id}/status/",
            {"status": "shortlisted"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.data["error"],
            "Only recruiters can update application status"
        )

        application.refresh_from_db()
        self.assertEqual(application.status, "pending")
