import json, time
from django.shortcuts import render
from base import get_base_url, models_to_dict, model_to_dict, array_to_dict
from django.http import HttpResponseRedirect
from attendance.models import Class, Student, Attendance


def error_page(request):
    data = {
        'base_url': get_base_url()
    }

    return render(request, '404.html', data)


def server_error(request):
    data = {
        'base_url': get_base_url()
    }

    return render(request, '500.html', data)


def home(request):
    data = {
        'base_url': get_base_url()
    }

    # If user is login redirect to overview
    if request.user.is_authenticated():
        return HttpResponseRedirect('/dashboard/')

    return render(request, 'home.html', data)


def register(request):
    data = {
        'base_url': get_base_url()
    }

    # If user is login redirect to overview
    if request.user.is_authenticated():
        return HttpResponseRedirect('/dashboard/')

    return render(request, 'register.html', data)


def login(request):
    data = {
        'base_url': get_base_url()
    }

    # If user is login redirect to overview
    if request.user.is_authenticated():
        return HttpResponseRedirect('/dashboard/')

    return render(request, 'login.html', data)


def forgot_password(request):
    data = {
        'base_url': get_base_url(),
        'expired': False
    }

    # if 'code' in request.GET:
    #     current_user = User.objects.get(reset_link=request.GET['code'])
    #
    #     if (int(round(time.time())) - current_user.reset_date) > 86400:
    #         data['expired'] = True

    # If user is login redirect to overview
    if request.user.is_authenticated():
        return HttpResponseRedirect('/dashboard/')

    return render(request, 'forgot_password.html', data)


def dashboard(request):
    current_user = request.user

    classes = list(Class.objects.filter(user=current_user))
    class_list = {}

    for current_class in classes:
        roster = []
        link_students = current_class.student_classes.all()
        attendance_list = {}
        attendance_obj = Attendance.objects.filter(classroom=current_class)

        if len(attendance_obj):
            for attendance in attendance_obj:
                attendance_list[str(attendance.time)] = attendance.attendance

        for student in link_students:
            roster.append(student.id)
        current_class = model_to_dict(current_class)
        current_class['roster'] = roster
        current_class['attendance'] = attendance_list
        class_list[current_class['id']] = current_class

    students = array_to_dict(list(Student.objects.filter(user=current_user).values()))

    data = {
        'base_url': get_base_url(),
        'name': current_user.first_name + ' ' + current_user.last_name,
        'classes': json.dumps(class_list),
        'students': json.dumps(students),
        'student_length': len(students),
        'start_of_day': str(int(time.time()/86400)*86400)
    }

    # Only go to dashboard if user is logged in
    if not current_user.is_authenticated():
        return HttpResponseRedirect('/login/')

    return render(request, 'dashboard.html', data)
