import json
from django.forms.models import model_to_dict
from django.http import JsonResponse
from attendance.models import Class, Student, StudentClass, Attendance
from attendance.decorators import login_required, data_required
from base import array_to_dict


@login_required
@data_required(['class_name', 'to_date', 'from_date', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], 'POST')
def create_class(request):
    current_user = request.user

    created_class = Class.objects.create(
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

    classes = list(Class.objects.filter(user=current_user))

    class_list = {}

    for current_class in classes:
        roster = []
        link_students = current_class.student_classes.all()
        attendance_list = {}
        attendance_obj = Attendance.objects.filter(classroom=current_class)

        if len(attendance_obj):
            for current_attendance in attendance_obj:
                attendance_list[str(current_attendance.time)] = current_attendance.attendance

        for student in link_students:
            roster.append(student.id)
        current_class = model_to_dict(current_class)
        current_class['roster'] = roster
        current_class['attendance'] = attendance_list
        class_list[current_class['id']] = current_class

    return JsonResponse({'class': class_list, 'id': str(created_class.id)}, safe=False)


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

    students = array_to_dict(list(Student.objects.filter(user=current_user).values()))

    return JsonResponse({'students': students}, safe=False)


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
        attendance_obj = Attendance.objects.get(time=start_of_day, classroom=class_obj)
        attendance_obj.attendance[student_id] = checked
        attendance_obj.save()
    except Attendance.DoesNotExist:
        Attendance.objects.create(time=start_of_day, classroom=class_obj, attendance={student_id: checked})

    attendance_list = {}
    attendance_obj = Attendance.objects.filter(classroom=class_obj)

    for current_attendance in attendance_obj:
        attendance_list[str(current_attendance.time)] = current_attendance.attendance

    return JsonResponse({'attendance': attendance_list}, safe=False)
