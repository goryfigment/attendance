module.exports = function(attendance, student_id, time) {
    if(time in attendance){
        attendance = attendance[time];
    } else {
        return false;
    }

    if(student_id in attendance) {
        return attendance[String(student_id)];
    } else {
        return false;
    }
};