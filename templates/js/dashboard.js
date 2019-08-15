require('./../css/general.css');
require('./../css/dashboard.css');
require('./../library/fontawesome/fontawesome.js');
var $ = require('jquery');
require('./../library/calendar/calendar.js');
var sideBarTemplate = require('./../handlebars/side_bar.hbs');
var rosterTemplate = require('./../handlebars/roster.hbs');
var classTemplate = require('./../handlebars/class.hbs');
var studentLinkTemplate = require('./../handlebars/student_link.hbs');

var dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function init() {
    var $sideBarWrapper = $('#side-bar-wrapper');
    $sideBarWrapper.empty();
    $sideBarWrapper.append(sideBarTemplate({'classes': globals.classes, 'student_length': globals.student_length}));

    var $class = $($sideBarWrapper.find('.class')[0]);
    $class.addClass('active');
    var $bodyWrapper = $('#body-wrapper');
    $bodyWrapper.empty();
    var d = new Date();

    $bodyWrapper.append(classTemplate({
        'class': globals.classes[$class.attr('data-id')],
        'dateString': dayLabels[d.getDay()] + ' ' + monthLabels[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(),
        'time': globals.start_of_day,
        'student_length': globals.student_length
    }));

    $('.active-day[data-day="' + String(d.getDay()) + '"]').addClass('today');
}

function clearForm($wrapper) {
    var $inputs = $wrapper.find('input');
    var $errors = $wrapper.find('.error');

    for (var i = 0; i < $inputs.length; i++) {
        $($inputs[i]).val('');
    }

    for (var e = 0; e < $errors.length; e++) {
        $($errors[e]).removeClass('error');
    }
    $('input[type=checkbox]').prop('checked',false);

    $wrapper.find('input[type=checkbox]').prop('checked',false);
}

function addZeroFillers(number) {
    if(number.toString().length == 1) {
        return '0' + number;
    } else if(!number.length) {
        return '00';
    } else {
        return number;
    }
}

$(document).ready(function() {
    init();

    $(document).on('click', '#home-link', function () {
        window.location.replace(globals.base_url + '/dashboard');
    });

    $(document).on('click', '#account-link', function () {
        $(this).closest('#nav-wrapper').toggleClass('account-active');
    });

    $(document).on('click', '#logout-link', function () {
        window.location.replace(globals.base_url + '/logout');
    });

    //SEARCH
    $(document).on('keyup', '#search-input', function () {
        var value = $(this).val().replace(' ', '').replace('-', '').toLowerCase();

        var $table = $('table');
        var $items = $table.find('tbody tr');

        if($table.length) {
            for (var i = 0; i < $items.length; i++) {
                var $currentItem = $($items[i]);
                var currentName = $currentItem.find('.student-name').text().replace(' ', '').replace('-', '').toLowerCase();

                if(currentName.indexOf(value) !== -1) {
                    $currentItem.show();
                } else {
                    $currentItem.hide();
                }
            }
        }
    });
    //SEARCH

    //OVERLAY//
    $(document).on('click', 'body, #class-cancel-button, #student-cancel-button, #student-link-cancel-button', function () {
        var $overlay = $('#overlay');
        $overlay.removeClass('active');
        $overlay.removeClass('class-creation');
        $overlay.removeClass('calendar');
        $overlay.removeClass('student');
        $overlay.removeClass('student-link');
    });
    //OVERLAY//

    //CREATE CLASS//
    $(document).on('click', '#create-class-button', function (e) {
        e.stopPropagation();
        var $overlay = $('#overlay');
        $overlay.addClass('active');
        $overlay.addClass('class-creation');
    });

    $(document).on('click', '#create-class-wrapper', function (e) {
        e.stopPropagation();
    });

    $(document).on('keyup', '#time-wrapper input', function () {
        var $this = $(this);
        var $inputs = $('#time-wrapper input');

        for (var i = 0; i < $inputs.length; i++) {
            var $currentInput = $($inputs[i]);

            if($this.is($currentInput) && i!=3 && $this.val().length > 1) {
                $($inputs[i+1]).focus();
                return;
            }
        }
    });

    $(document).on('click', '.minute-input', function () {
        $(this).select();
    });

    $(document).on('click', '#class-submit-button', function () {
        var className = $('#class-name-input').val().trim();
        var leftHour = $('#left-hour-input').val().trim();
        var rightHour = $('#right-hour-input').val().trim();

        if(!className.length || !leftHour.length || !rightHour.length) {
            if(!className.length) {
                $('#class-name-input').addClass('error');
            } else {
                $('#class-name-input').removeClass('error');
            }

            if(!leftHour.length) {
                $('#left-hour-input').addClass('error');
            } else {
                $('#left-hour-input').removeClass('error');
            }

            if(!rightHour.length) {
                $('#right-hour-input').addClass('error');
            } else {
                $('#right-hour-input').removeClass('error');
            }

            return;
        }

        var data = {
            'class_name': className,
            'from_date': leftHour + ':' + addZeroFillers(parseInt($('#left-minute-input').val())) + addZeroFillers($('#left-period-input').val()),
            'to_date': rightHour + ':' + addZeroFillers(parseInt($('#right-minute-input').val())) + addZeroFillers($('#right-period-input').val()),
            'monday': $('#monday-checkbox').prop("checked"),
            'tuesday': $('#tuesday-checkbox').prop("checked"),
            'wednesday': $('#wednesday-checkbox').prop("checked"),
            'thursday': $('#thursday-checkbox').prop("checked"),
            'friday': $('#friday-checkbox').prop("checked"),
            'saturday': $('#saturday-checkbox').prop("checked"),
            'sunday': $('#sunday-checkbox').prop("checked")
        };

        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/create_class/',
            data: data,
            dataType: 'json',
            type: "POST",
            success: function (response) {
                console.log(JSON.stringify(response));
                globals.classes = response['class'];
                var $sideBarWrapper = $('#side-bar-wrapper');
                $sideBarWrapper.empty();
                $sideBarWrapper.append(sideBarTemplate({'classes': globals.classes, 'student_length': globals.student_length}));
                $('#class-cancel-button').click();

                clearForm($('#create-class-wrapper'));
                $(".class[data-id='" + response['id'] + "']").click();
            }
        });
    });

    $(document).on('click', '.class', function () {
        var $class = $(this);
        $class.closest('#side-bar-wrapper').find('.active').removeClass('active');
        $class.addClass('active');
        var $bodyWrapper = $('#body-wrapper');
        $bodyWrapper.empty();
        var d = new Date();

        $bodyWrapper.append(classTemplate({
            'class': globals.classes[$class.attr('data-id')],
            'dateString': dayLabels[d.getDay()] + ' ' + monthLabels[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(),
            'time': globals.start_of_day,
            'student_length': globals.student_length
        }));
    });
    //CREATE CLASS//

    //ATTENDANCE TABLE//
    $(document).on('click', '.attendance-column', function () {
        $(this).find('label').click();
    });

    $(document).on('click', '.check-box-wrapper', function (e) {
        e.stopPropagation();
    });
    //ATTENDANCE TABLE//

    //CREATE STUDENT//
    $(document).on('click', '.roster-wrapper', function () {
        var $rosterWrapper = $(this);
        $rosterWrapper.closest('#side-bar-wrapper').find('.active').removeClass('active');
        $rosterWrapper.addClass('active');
        var $bodyWrapper = $('#body-wrapper');
        $bodyWrapper.empty();
        $bodyWrapper.append(rosterTemplate(globals.students));
    });

    $(document).on('click', '#create-student-button', function (e) {
        e.stopPropagation();
        var $overlay = $('#overlay');
        $overlay.addClass('active');
        $overlay.addClass('student');
    });

    $(document).on('click', '#create-student-wrapper', function (e) {
        e.stopPropagation();
    });

    $(document).on('click', '#student-submit-button', function (e) {
        e.stopPropagation();
        var firstName = $('#first-name-input').val().trim();
        var lastName = $('#last-name-input').val().trim();

        if(!firstName.length || !lastName.length) {
            if(!firstName.length) {
                $('#first-name-input').addClass('error');
            } else {
                $('#first-name-input').removeClass('error');
            }

            if(!lastName.length) {
                $('#last-name-input').addClass('error');
            } else {
                $('#last-name-input').removeClass('error');
            }

            return;
        }

        var data = {
            'first_name': firstName,
            'last_name': lastName,
            'school': $('#school-input').val().trim(),
            'grade': $('#grade-input').val().trim(),
            'address': $('#address-input').val().trim(),
            'state': $('#state-input').val().trim(),
            'city': $('#city-input').val().trim(),
            'zip_code': $('#zip-code-input').val().trim(),
            'phone_number': $('#phone-number-input').val().trim()
        };

        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/create_student/',
            data: data,
            dataType: 'json',
            type: "POST",
            success: function (response) {
                console.log(JSON.stringify(response));
                globals.students = response['students'];
                globals.student_length = globals.student_length + 1;
                $('#student-cancel-button').click();

                var $rosterWrapper = $('.roster-wrapper');
                if($rosterWrapper.hasClass('active')) {
                    var $bodyWrapper = $('#body-wrapper');
                    $bodyWrapper.empty();
                    $bodyWrapper.append(rosterTemplate(globals.students));
                }

                $('.total-students').text('Total Students: ' + globals.student_length.toString());
                clearForm($('#create-student-wrapper'));
            }
        });
    });
    //CREATE STUDENT//

    //LINK STUDENT//
    $(document).on('click', '#empty-student-description', function (e) {
        e.stopPropagation();
        $('#create-student-button').click();
    });

    $(document).on('click', '#empty-roster-description', function (e) {
        e.stopPropagation();
        $('#link-student-button').click();
    });

    $(document).on('click', '#link-student-button', function (e) {
        e.stopPropagation();
        var $overlay = $('#overlay');
        var $studentLinkWrapper = $('#student-link-wrapper');

        $studentLinkWrapper.empty();
        $studentLinkWrapper.append(studentLinkTemplate({'students': globals.students}));
        $overlay.addClass('active');
        $overlay.addClass('student-link');
    });

    $(document).on('click', '#student-link-wrapper', function (e) {
        e.stopPropagation();
    });

    $(document).on('click', '.roster-link-student', function () {
        $(this).find('label').click();
    });

    $(document).on('change', '.roster-link-student .checkbox-input', function () {
        var $this = $(this);
        var $rosterLinkStudent = $this.closest('.roster-link-student');

        if($rosterLinkStudent.hasClass('checked') && !$this.prop("checked")) {
            $rosterLinkStudent.find('.remove-tag').show();
        } else {
            $rosterLinkStudent.find('.remove-tag').hide();
        }

        if(!$rosterLinkStudent.hasClass('checked') && $this.prop("checked")) {
            $rosterLinkStudent.find('.add-tag').show();
        } else {
            $rosterLinkStudent.find('.add-tag').hide();
        }
    });

    $(document).on('click', '#student-link-submit-button', function () {
        var $rosterStudents = $('.roster-link-student');
        var students = [];
        var removed = [];
        var currentClass = globals.classes[$('.class.active').attr('data-id')];
        var roster = currentClass['roster'];

        for (var i = 0; i < $rosterStudents.length; i++) {
            var $currentStudent = $($rosterStudents[i]);
            var studentId = parseInt($currentStudent.attr('data-id'));
            var link = $currentStudent.find('#roster-checkbox-' + studentId).prop("checked");

            if (link && roster.indexOf(studentId) == -1) {
                students.push(studentId);
            } else if(!link && roster.indexOf(studentId) > -1) {
                removed.push(studentId);
            }
        }

        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/student_link/',
            data: {'class_id': currentClass['id'], 'students': JSON.stringify(students), 'removed': JSON.stringify(removed)},
            dataType: 'json',
            type: "POST",
            success: function (response) {
                var $class = $('.class.active');
                var activeClass = globals.classes[$class.attr('data-id')];
                activeClass['roster'] = response['roster'];

                var $bodyWrapper = $('#body-wrapper');
                $bodyWrapper.empty();
                var d = new Date();

                $bodyWrapper.append(classTemplate({
                    'class': activeClass,
                    'dateString': dayLabels[d.getDay()] + ' ' + monthLabels[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(),
                    'time': globals.start_of_day,
                    'student_length': globals.student_length
                }));

                $('#student-link-cancel-button').click();
            }
        });
    });
    //LINK STUDENT//

    //ATTENDANCE//
    $(document).on('change', '.attendance-submit', function (e) {
        e.stopPropagation();
        var $this = $(this);
        var checked = $this.prop('checked');
        var studentId = $this.closest('tr').attr('data-id');
        var classId = $('.class.active').attr('data-id');
        var time = $('#class-time').attr('data-time');

        $.ajax({
            headers: {"X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').attr('value')},
            url: globals.base_url + '/attendance/',
            data: {student_id: studentId, class_id: classId, checked:checked, time: time},
            dataType: 'json',
            type: "POST",
            success: function (response) {
                console.log(JSON.stringify(response));
                globals.classes[classId]['attendance'] = response['attendance'];
            }
        });
    });
    //ATTENDANCE//

    //CALENDAR EDIT//
    $(document).on('click', '.month-calendar td', function () {
        var date = $(this).attr('data-epoch');
        var $class = $('.class.active');
        var $bodyWrapper = $('#body-wrapper');
        var d = new Date(date*1000);

        $bodyWrapper.empty();
        $bodyWrapper.append(classTemplate({
            'class': globals.classes[$class.attr('data-id')],
            'dateString': dayLabels[d.getUTCDay()] + ' ' + monthLabels[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(),
            'time': date,
            'student_length': globals.student_length
        }));

        $('body').click();
    });
    //CALENDAR EDIT//
});