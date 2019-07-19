//css
require('./../../library/calendar/calendar.css');

//jquery
var $ = require('jquery');

//handlebars
var calendarTemplate = require('./../../handlebars/calendar.hbs');

// these are human-readable month name labels, in order
var calMonthsLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// these are the days of the week for each month, in order
var calDaysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function createCalendar(subtractMonth) {
    ////CURRENT MONTH////
    //Get current year, month, and date
    var calCurrentDate = new Date();
    calCurrentDate.setUTCMonth(calCurrentDate.getUTCMonth() - subtractMonth);
    var calCurrentMonth = calCurrentDate.getMonth();
    var calCurrentYear = calCurrentDate.getFullYear();

    //Get starting day of the month
    var firstDay = new Date(calCurrentYear, calCurrentMonth, 1);
    var startingDay = firstDay.getDay();

    //Get the length of the month
    var monthLength = calDaysPerMonth[calCurrentMonth];

    if (calCurrentMonth == 1) { // February only!
        if ((calCurrentYear % 4 == 0 && calCurrentYear % 100 != 0) || calCurrentYear % 400 == 0){
            monthLength = 29;
        }
    }
    ////CURRENT MONTH////

    var calendarData = {
        'starting_day': startingDay,
        'month_length': monthLength,
        'month': calMonthsLabels[calCurrentMonth],
        'month_number': calCurrentMonth + 1,
        'year': calCurrentYear,
        'left_subtract': subtractMonth + 1,
        'right_subtract': subtractMonth
    };

    if(subtractMonth == 0) {
        calendarData['current_day'] = calCurrentDate.getDate();
    }

    var $calendarContainer = $('#calendar-wrapper');
    $calendarContainer.empty();
    $calendarContainer.append(calendarTemplate(calendarData));
}

function inBetween($allElements, $firstElement, $secondElement, addFirst, addSecond) {
    //Returns the subarray of the array
    var firstElementIndex = addFirst ? $allElements.index($firstElement) : $allElements.index($firstElement) + 1;
    var secondElementIndex = addSecond ? $allElements.index($secondElement) + 1 : $allElements.index($secondElement);

    if(firstElementIndex < secondElementIndex) {
        return $allElements.slice(firstElementIndex, secondElementIndex);
    } else {
        if(!addFirst && addSecond) {
            return $allElements.slice(secondElementIndex - 1, firstElementIndex - 1);
        } else if (addFirst && !addSecond) {
            return $allElements.slice(secondElementIndex + 1, firstElementIndex + 1);
        } else {
            return $allElements.slice(secondElementIndex, firstElementIndex);
        }
    }
}

function addZeroFillers(number) {
    if(number.toString().length == 1) {
        return '0' + number;
    } else {
        return number;
    }
}

function resetCalendar() {
    var $calendarWrapper = $('#calendar-wrapper');
    var $calendarInputWrapper = $calendarWrapper.find('#calendar-input-wrapper');

    $calendarInputWrapper.attr('data-first-selected-date', '');
    $calendarInputWrapper.attr('data-last-selected-date', '');

    $calendarWrapper.find('input').each(function() {
        $(this).val('');
    });

    $calendarWrapper.find('.in-between').each(function() {
        $(this).removeClass('in-between');
    });

    var $firstSelectedDate = $calendarWrapper.find('.first-selected-date');
    $firstSelectedDate.removeClass('first-selected-date');
    var $lastSelectedDate = $calendarWrapper.find('.last-selected-date');
    $lastSelectedDate.removeClass('last-selected-date');
}

$(document).ready(function() {
    $(document).on('click', '#calendar-wrapper', function (e) {
        e.stopPropagation();
    });

    $(document).on('click', '#calendar-button', function (e) {
        e.stopPropagation();
        var $overlay = $('#overlay');
        $overlay.addClass('active');
        $overlay.addClass('calendar');
        createCalendar(0);
    });

    $(document).on('click', '.right-arrow:not([data-month="0"])', function () {
        var $rightArrow = $(this);
        var currentMonth = parseInt($rightArrow.attr('data-month'));

        var newCurrentMonth = currentMonth - 1;

        if (currentMonth != 0) {
            $rightArrow.attr('data-month', currentMonth - 1);
        }

        createCalendar(newCurrentMonth);
    });

    $(document).on('click', '.left-arrow', function () {
        var $leftArrow = $(this);
        var currentMonth = parseInt($leftArrow.attr('data-month'));
        $leftArrow.attr('data-month', currentMonth + 1);

        createCalendar(currentMonth);
    });
});