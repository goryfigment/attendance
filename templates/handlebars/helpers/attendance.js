var $ = require('jquery');
module.exports = function(year, month, day) {
    var attendance = globals.classes[$('.class.active').attr('data-id')]['attendance'];
    var epoch = String(new Date(year, month-1, day).setUTCHours(0,0,0,0) / 1000);
    var check = '';

    if(epoch in attendance) {
        var attendanceKey = attendance[epoch];
        for (var studentKey in attendance[epoch]) {
            if(attendanceKey[studentKey]) {
                check = 'checked';
            }
        }
    }

    return check;
};