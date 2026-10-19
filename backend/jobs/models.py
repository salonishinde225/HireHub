from django.contrib.auth.models import User
from django.db import models


class Job(models.Model):
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=150)
    location = models.CharField(max_length=150)
    JOB_TYPE_CHOICES = [
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Internship', 'Internship'),
        ('Contract', 'Contract'),
        ('Remote', 'Remote'),
    ]

    job_type = models.CharField(
        max_length=20,
        choices=JOB_TYPE_CHOICES,
        default='Full-time'
    )
    salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    skills = models.TextField()
    description = models.TextField()
    deadline = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    related_name='posted_jobs',
    null=True,
    blank=True
)

    def __str__(self):
        return self.title



class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('job_seeker', 'Job Seeker'),
        ('recruiter', 'Recruiter'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='job_seeker'
    )

    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

    
class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
    ]

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    applicant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='job_applications'
    )

    resume = models.URLField(
        max_length=500,
        blank=True
    )

    cover_letter = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['job', 'applicant'],
                name='unique_job_application'
            )
        ]

    def __str__(self):
        return f"{self.applicant.username} - {self.job.title}"

