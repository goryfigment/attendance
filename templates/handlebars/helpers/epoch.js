module.exports = function(year, month, day) {
    return new Date(year, month-1, day).setUTCHours(0,0,0,0) / 1000;
};