import json
import time
from django.forms.models import model_to_dict
from django.http import JsonResponse, HttpResponseBadRequest
import base as helper
from django.contrib.auth import authenticate
from attendance.models import Class, Student, StudentClass, Attendance
from attendance.decorators import login_required, data_required
from attendance.controllers.base import models_to_dict


@login_required
@data_required(['class_name', 'to_date', 'from_date', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], 'POST')
def create_class(request):
    current_user = request.user

    Class.objects.create(
        user=request.user,
        name=request.POST['class_name'],
        from_date=request.POST['from_date'],
        to_date=request.POST['to_date'],

        monday=request.POST.get('monday') == 'true',
        tuesday=request.POST.get('tuesday') == 'true',
        wednesday=request.POST.get('wednesday') == 'true',
        thursday=request.POST.get('thursday') == 'true',
        friday=request.POST.get('friday') == 'true',
        saturday=request.POST.get('saturday') == 'true',
        sunday=request.POST.get('sunday') == 'true'
    )

    class_list = models_to_dict(Class.objects.filter(user=current_user))

    return JsonResponse({'class': class_list}, safe=False)


@login_required
@data_required(['first_name', 'last_name', 'school', 'grade', 'address', 'city', 'state', 'zip_code', 'phone_number'], 'POST')
def create_student(request):
    current_user = request.user

    Student.objects.create(
        user=request.user,
        first_name=request.POST['first_name'],
        last_name=request.POST['last_name'],
        school=request.POST['school'],
        grade=request.POST['grade'],
        address=request.POST['address'],
        state=request.POST['state'],
        city=request.POST['city'],
        zip_code=request.POST['zip_code'],
        phone_number=request.POST['phone_number']
    )

    student_list = models_to_dict(Student.objects.filter(user=current_user))

    return JsonResponse({'students': student_list}, safe=False)


@login_required
@data_required(['students', 'class_id'], 'POST')
def student_link(request):
    class_id = request.POST['class_id']
    class_obj = Class.objects.get(id=class_id)
    students = json.loads(request.POST['students'])
    removed = json.loads(request.POST['removed'])

    # Have to check if student is added or remove if remove delete from student class else add to student class
    for student in students:
        student_obj = Student.objects.get(id=student)
        StudentClass.objects.create(student=student_obj, classroom=class_obj)

    for remove_student in removed:
        student_obj = Student.objects.get(id=remove_student)
        StudentClass.objects.get(student=student_obj, classroom=class_obj).delete()

    link_students = class_obj.student_classes.all()
    roster = []

    for student in link_students:
        roster.append(student.id)

    return JsonResponse({'roster': roster}, safe=False)


@login_required
@data_required(['student_id', 'class_id', 'checked'], 'POST')
def attendance(request):
    class_id = request.POST['class_id']
    class_obj = Class.objects.get(id=class_id)
    student_id = str(request.POST['student_id'])
    start_of_day = request.POST['time']
    checked = str(request.POST['checked'])

    if checked == 'true':
        checked = True
    else:
        checked = False

    # Try to get the attendance
    try:
        attendance_obj = Attendance.objects.get(time=start_of_day)
        attendance_obj.attendance[student_id] = checked
        attendance_obj.save()
    except Attendance.DoesNotExist:
        attendance_obj = Attendance.objects.create(time=start_of_day, classroom=class_obj, attendance={student_id: checked})

    return JsonResponse({'attendance': model_to_dict(attendance_obj)}, safe=False)
