var $ = require('jquery');
module.exports = function(year, month, day) {
    var attendance = globals.classes[$('.class.active').attr('data-index')]['attendance'];
    var epoch = String(new Date(year, month-1, day).setUTCHours(0,0,0,0) / 1000);
    var check = '';

    if(epoch in attendance) {
        for (var key in attendance) {
            if(attendance[key]) {
                return 'checked';
            }
        }
    }
};