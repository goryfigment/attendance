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
    if(globals.classes.length) {
        $sideBarWrapper.empty();
        $sideBarWrapper.append(sideBarTemplate({'classes': globals.classes, 'student_length': globals.student_length}));
    }

    var $class = $($sideBarWrapper.find('.class')[0]);
    $class.addClass('active');
    var $bodyWrapper = $('#body-wrapper');
    $bodyWrapper.empty();
    var d = new Date();

    $bodyWrapper.append(classTemplate({
        'class': globals.classes[$class.attr('data-index')],
        'dateString': dayLabels[d.getDay()] + ' ' + monthLabels[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(),
        'time': globals.start_of_day
    }));
}

function addZeroFillers(number) {
    if(number.toString().length == 1) {
        return '0' + number;
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
        $overlay.removeClass('class');
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
        $overlay.addClass('class');
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
        var data = {
            'class_name': $('#class-name-input').val(),
            'from_date': $('#left-hour-input').val() + ':' + addZeroFillers(parseInt($('#left-minute-input').val())) + $('#left-period-input').val(),
            'to_date': $('#right-hour-input').val() + ':' + addZeroFillers(parseInt($('#right-minute-input').val())) + $('#right-period-input').val(),

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
                $('#class-cancel-button').click();
                var $sideBarWrapper = $('#side-bar-wrapper');
                $sideBarWrapper.empty();
                $sideBarWrapper.append(sideBarTemplate(globals.classes));
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
            'class': globals.classes[$class.attr('data-index')],
            'dateString': dayLabels[d.getDay()] + ' ' + monthLabels[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(),
            'time': globals.start_of_day
        }));
    });
    //CREATE CLASS//

    //ATTENDANCE TABLE//
    $(document).on('click', '.attendance-column', function (e) {
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

        var data = {
            'first_name': $('#first-name-input').val(),
            'last_name': $('#last-name-input').val(),
            'school': $('#school-input').val(),
            'grade': $('#grade-input').val(),
            'address': $('#address-input').val(),
            'state': $('#state-input').val(),
            'city': $('#city-input').val(),
            'zip_code': $('#zip-code-input').val(),
            'phone_number': $('#phone-number-input').val()
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
                $('#student-cancel-button').click();

                var $rosterWrapper = $('.roster-wrapper');
                if($rosterWrapper.hasClass('active')) {
                    var $bodyWrapper = $('#body-wrapper');
                    $bodyWrapper.empty();
                    $bodyWrapper.append(rosterTemplate(globals.students));
                }

                $('.total-students').text('Total Students: ' + globals.students.length.toString());
            }
        });
    });
    //CREATE STUDENT//

    //LINK STUDENT//
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

    $(document).on('click', '#student-link-submit-button', function () {
        var $rosterStudents = $('.roster-link-student');
        var students = [];
        var removed = [];
        var currentClass = globals.classes[$('.class.active').attr('data-index')];
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
                var activeClass = globals.classes[$class.attr('data-index')];
                activeClass['roster'] = response['roster'];

                var $bodyWrapper = $('#body-wrapper');
                $bodyWrapper.empty();
                var d = new Date();

                $bodyWrapper.append(classTemplate({
                    'class': activeClass,
                    'dateString': dayLabels[d.getDay()] + ' ' + monthLabels[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(),
                    'time': globals.start_of_day
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
            'class': globals.classes[$class.attr('data-index')],
            'dateString': dayLabels[d.getUTCDay()] + ' ' + monthLabels[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(),
            'time': date
        }));

        $('body').click();
    });
    //CALENDAR EDIT//
});