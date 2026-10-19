
from django.db.models import Q
from django.contrib.auth import authenticate

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated

from .models import Job, UserProfile, Application
from .serializers import (
    JobSerializer,
    RegisterSerializer,
    ApplicationSerializer
)


def is_recruiter(user):
    try:
        return (
            user.profile.role == 'recruiter'
            and user.profile.is_approved
        )
    except UserProfile.DoesNotExist:
        return False

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def job_list(request):
    jobs = Job.objects.filter(is_active=True).order_by('-created_at')

    search = request.query_params.get('search', '').strip()

    if search:
        jobs = jobs.filter(
            Q(title__icontains=search)
            | Q(company__icontains=search)
            | Q(location__icontains=search)
            | Q(skills__icontains=search)
        )

    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_job(request):
    if not is_recruiter(request.user):
        return Response(
            {"error": "Only recruiters can create jobs"},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = JobSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
def job_detail(request, job_id):
    try:
        job = Job.objects.get(id=job_id, is_active=True)
    except Job.DoesNotExist:
        return Response(
            {"error": "Job not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = JobSerializer(job)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_job(request, job_id):
    if not is_recruiter(request.user):
        return Response(
            {"error": "Only recruiters can manage jobs"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        job = Job.objects.get(id=job_id)

    except Job.DoesNotExist:
        return Response(
            {"error": "Job not found"},
            status=status.HTTP_404_NOT_FOUND
        )

   
    if job.created_by_id != request.user.id:
        return Response(
            {"error": "You can only manage jobs you posted"},
            status=status.HTTP_403_FORBIDDEN
        )

    
    if request.method == 'DELETE':
        job.delete()
        return Response(
            {"message": "Job deleted successfully"},
            status=status.HTTP_200_OK
        )

    partial = request.method == 'PATCH'

    serializer = JobSerializer(
        job,
        data=request.data,
        partial=partial
    )

    if serializer.is_valid():
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        return Response(
            {
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.profile.role
                }
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(
        request,
        username=username,
        password=password
    )

    if user is not None:
        token, created = Token.objects.get_or_create(user=user)

        try:
            role = user.profile.role
        except UserProfile.DoesNotExist:
            role = None

        return Response(
            {
                "message": "Login successful",
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": role
                }
            },
            status=status.HTTP_200_OK
        )

    return Response(
        {"error": "Invalid username or password"},
        status=status.HTTP_401_UNAUTHORIZED
    )
    
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_for_job(request, job_id):
    # Only job seekers can apply
    if not hasattr(request.user, 'profile'):
        return Response(
            {"error": "User profile not found"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if request.user.profile.role != 'job_seeker':
        return Response(
            {"error": "Only job seekers can apply for jobs"},
            status=status.HTTP_403_FORBIDDEN
        )

    # Check whether the job exists and is active
    try:
        job = Job.objects.get(id=job_id, is_active=True)
    except Job.DoesNotExist:
        return Response(
            {"error": "Job not found or no longer active"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Prevent duplicate applications
    if Application.objects.filter(
        job=job,
        applicant=request.user
    ).exists():
        return Response(
            {"error": "You have already applied for this job"},
            status=status.HTTP_400_BAD_REQUEST
        )

    
    serializer = ApplicationSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(
            job=job,
            applicant=request.user
        )

        return Response(
            {
                "message": "Application submitted successfully",
                "application": serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications(request):
    if not hasattr(request.user, 'profile'):
        return Response(
            {"error": "User profile not found"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if request.user.profile.role != 'job_seeker':
        return Response(
            {"error": "Only job seekers can view their applications"},
            status=status.HTTP_403_FORBIDDEN
        )

    applications = Application.objects.filter(
        applicant=request.user
    ).select_related('job').order_by('-applied_at')

    serializer = ApplicationSerializer(
        applications,
        many=True
    )

    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recruiter_applications(request):
    if not is_recruiter(request.user):
        return Response(
            {"error": "Only recruiters can view job applications"},
            status=status.HTTP_403_FORBIDDEN
        )

    applications = Application.objects.filter(
        job__created_by=request.user
    ).select_related('job', 'applicant').order_by('-applied_at')

    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_jobs(request):
    if not is_recruiter(request.user):
        return Response(
            {"error": "Only approved recruiters can view their jobs"},
            status=status.HTTP_403_FORBIDDEN
        )

    jobs = Job.objects.filter(
        created_by=request.user
    ).order_by('-created_at')

    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_application_status(request, application_id):
    # Only recruiters can update application status
    if not is_recruiter(request.user):
        return Response(
            {"error": "Only recruiters can update application status"},
            status=status.HTTP_403_FORBIDDEN
        )

    # Find the application
    try:
        application = Application.objects.select_related(
            'job'
        ).get(id=application_id)
    except Application.DoesNotExist:
        return Response(
            {"error": "Application not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Check job ownership
    if application.job.created_by_id != request.user.id:
        return Response(
            {"error": "You can only update applications for your own jobs"},
            status=status.HTTP_403_FORBIDDEN
        )

    # Validate the requested status
    new_status = request.data.get('status')

    allowed_statuses = [
        'reviewed',
        'shortlisted',
        'rejected'
    ]

    if new_status not in allowed_statuses:
        return Response(
            {
                "error": "Invalid status",
                "allowed_statuses": allowed_statuses
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    application.status = new_status
    application.save(update_fields=['status'])

    return Response(
        {
            "message": "Application status updated successfully",
            "application_id": application.id,
            "status": application.status
        },
        status=status.HTTP_200_OK
    )
