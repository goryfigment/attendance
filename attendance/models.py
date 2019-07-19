from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django_mysql.models import JSONField
import time


def get_utc_epoch_time():
    return int(round(time.time()))


class User(AbstractBaseUser):
    email = models.EmailField(max_length=255, unique=True, blank=True, null=True)
    username = models.CharField(max_length=15, unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    reset_link = models.CharField(default=None, max_length=255,null=True)
    reset_date = models.IntegerField(default=None, blank=True, null=True)
    is_staff = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=True)
    # password = models.CharField(max_length=255)
    # last_login = models.DateTimeField(default=timezone.now, blank=True)

    USERNAME_FIELD = 'username'

    def __unicode__(self):
        return self.email

    def get_name(self):
        return self.first_name + ' ' + self.last_name

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    class Meta:
        db_table = "user"


class Class(models.Model):
    user = models.ForeignKey(User, default=None)
    name = models.CharField(max_length=100)
    from_date = models.CharField(max_length=10)
    to_date = models.CharField(max_length=10)
    monday = models.BooleanField(default=True)
    tuesday = models.BooleanField(default=True)
    wednesday = models.BooleanField(default=True)
    thursday = models.BooleanField(default=True)
    friday = models.BooleanField(default=True)
    saturday = models.BooleanField(default=True)
    sunday = models.BooleanField(default=True)

    class Meta:
        db_table = "class"


class Student(models.Model):
    user = models.ForeignKey(User, default=None)
    classes = models.ManyToManyField(Class, related_name='student_classes', through='StudentClass')
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    school = models.CharField(max_length=255)
    grade = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    zip_code = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=255)

    class Meta:
        db_table = "student"


class StudentClass(models.Model):
    student = models.ForeignKey(Student)
    classroom = models.ForeignKey(Class)


# Many students many attendances
# JSON FIELD key = STUDENT ID, value = TRUE/FALSE
class Attendance(models.Model):
    time = models.IntegerField(default=None)
    classroom = models.ForeignKey(Class)
    attendance = JSONField()
