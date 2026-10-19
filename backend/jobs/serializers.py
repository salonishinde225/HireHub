
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Job, UserProfile, Application



class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['created_by']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    role = serializers.ChoiceField(
        choices=[
            ('job_seeker', 'Job Seeker'),
            ('recruiter', 'Recruiter'),
        ],
        default='job_seeker'
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role', 'job_seeker')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )

        UserProfile.objects.create(
            user=user,
            role=role,
            is_approved=False
        )

        return user

    
class ApplicationSerializer(serializers.ModelSerializer):
    applicant_username = serializers.CharField(
        source='applicant.username',
        read_only=True
    )

    job_title = serializers.CharField(
        source='job.title',
        read_only=True
    )
    
    company = serializers.CharField(
    source='job.company',
    read_only=True
)

    class Meta:
        model = Application
        fields = [
            'id',
            'job',
            'job_title',
            'company',
            'applicant',
            'applicant_username',
            'resume',
            'cover_letter',
            'status',
            'applied_at',
        ]
        read_only_fields = [
            'id',
            'job',
            'applicant',
            'status',
            'applied_at',
        ]

