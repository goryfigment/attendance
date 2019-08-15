var $ = require('jquery');
module.exports = function(studentId) {
    var roster = globals.classes[$('.class.active').attr('data-id')]['roster'];
    if (roster.indexOf(parseInt(studentId)) > -1) {
        return 'checked';
    } else {
        return '';
    }
};