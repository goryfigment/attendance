from django.conf.urls import url
from django.contrib import admin
from attendance.controllers import site, account_handler, dashboard

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', site.home, name='home'),
    url(r'^register/$', site.register, name='register_page'),
    url(r'^login/$', site.login, name='login_page'),
    url(r'^forgot_password/$', site.forgot_password, name='forgot_password'),
    url(r'^dashboard/$', site.dashboard, name='dashboard'),

    # Account Handler
    url(r'^account/register/$', account_handler.register, name='register'),
    url(r'^account/login/$', account_handler.user_login, name='login'),
    url(r'^account/reset_password/$', account_handler.reset_password, name='reset_password'),
    url(r'^account/change_password/$', account_handler.change_password, name='change_password'),
    url(r'^logout/$', account_handler.user_logout, name='logout'),

    # Dashboard
    url(r'^create_class/$', dashboard.create_class, name='create_class'),
    url(r'^create_student/$', dashboard.create_student, name='create_student'),
    url(r'^student_link/$', dashboard.student_link, name='student_link'),
    url(r'^attendance/$', dashboard.attendance, name='attendance'),
]
