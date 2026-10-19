
from django.urls import path
from . import views

urlpatterns = [
    path('jobs/', views.job_list, name='job-list'),
    path('jobs/create/', views.create_job, name='create-job'),
    path('jobs/<int:job_id>/', views.job_detail, name='job-detail'),
    path('jobs/<int:job_id>/manage/', views.manage_job, name='manage-job'),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('jobs/<int:job_id>/apply/',views.apply_for_job,name='apply-for-job',),
    path('my-applications/', views.my_applications,name='my-applications'),
    path('recruiter-applications/', views.recruiter_applications, name='recruiter-applications'),
    path('applications/<int:application_id>/status/',views.update_application_status,name='update-application-status'),
    path('my-jobs/', views.my_jobs, name='my-jobs'),
]
