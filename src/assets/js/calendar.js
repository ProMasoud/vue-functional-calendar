import Converter from "./converter";
Date.prototype.getWeekNumber = function (sundayStart) {
    if(!sundayStart){
        // ISO week date weeks start on monday
        // so correct the day number
        let dayNumber   = (new Converter(this).day() + 6) % 7;
        // Set the target to the thursday of this week so the
        // target date is in the right year
        this.setDate(new Converter(this).date() - dayNumber + 3);
    }

    let january4 = new Date(this.getFullYear(), 0, 4);
    return Math.ceil((((this - january4) / 86400000) + january4.getDay() + 1) / 7);
};

export default {
    configs: {
        sundayStart: false,
        leftAndRightDays: true,
        dateFormat: 'dd/mm/yyyy',
        dayNames: [],
        monthNames: []
    },
    formatDate(date) {
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        let formattedDate = this.configs.dateFormat.replace("dd", day.toString());
        formattedDate = formattedDate.replace("mm", month.toString());
        formattedDate = formattedDate.replace("yyyy", year.toString());

        return formattedDate;
    },
    getDateFromFormat(date) {
        let format = this.configs.dateFormat;

        if (format.indexOf('/') !== -1) {
            format = format.split('/');
            date = date.split('/');
        } else if (format.indexOf('-') !== -1) {
            format = format.split('-');
            date = date.split('-');
        } else if (format.indexOf('.') !== -1) {
            format = format.split('.');
            date = date.split('.');
        } else {
            throw new Error('Your date format not valid. Please read documentation.!');
        }

        let year = format.indexOf('yyyy');
        let month = format.indexOf('mm');
        let day = format.indexOf('dd');

        return new Date(date[year], date[month] - 1, date[day]);
    },
    checkValidDate(val) {
        val = this.getDateFromFormat(val);

        if (val != "Invalid Date") {
            return true;
        }

        return false;
    },
    getWeeksInMonth(month, year) {
        let weeks = [],
            firstDate = new Date(year, month, 1),
            lastDate = new Date(year, month + 1, 0),
            numDays = lastDate.getDate();

        let start = 1;


        let end = !this.configs.sundayStart ?
            (firstDate.getDay() === 0 ? 1 : 7 - firstDate.getDay() + 1)
            : 7 - firstDate.getDay();

        while (start <= numDays) {
            weeks.push({
                year: year,
                start: start,
                end: end,
                number: new Date(year, month, start).getWeekNumber(this.configs.sundayStart),
                days: []
            });
            start = end + 1;
            end = end + 7;
            if (end > numDays)
                end = numDays;
        }

        return {weeks: weeks, month: lastDate.getMonth(), year: lastDate.getFullYear()};
    },
    getLeftMonthDays(month, year) {
        let weeks = this.getWeeksInMonth(month, year);
        let firstWeek = weeks.weeks[0];
        let weekDaysCount = firstWeek.end - firstWeek.start + 1;

        let days = [];
        let finalYear = 0;
        let finalMonth = 0;

        if (weekDaysCount !== 7) {
            let weeksLeftMonth = this.getWeeksInMonth(month - 1, year);

            let leftMonthLastWeek = weeksLeftMonth.weeks[weeksLeftMonth.weeks.length - 1];

            for (let i = leftMonthLastWeek.start; i <= leftMonthLastWeek.end; i++) {
                days.push(i);
            }

            finalMonth = weeksLeftMonth.month;
            finalYear = weeksLeftMonth.year;
        }

        return {days: days.reverse(), month: finalMonth, year: finalYear};
    },
    getRightMonthDays(month, year) {
        let weeks = this.getWeeksInMonth(month, year);
        let lastWeek = weeks.weeks[weeks.weeks.length - 1];

        let weekDaysCount = lastWeek.end - lastWeek.start + 1;

        let days = [];
        let finalYear = 0;
        let finalMonth = 0;

        if (weekDaysCount !== 7) {
            let weeksRightMonth = this.getWeeksInMonth(month + 1, year);
            let rightMonthFirstWeek = weeksRightMonth.weeks[0];

            for (let i = rightMonthFirstWeek.start; i <= rightMonthFirstWeek.end; i++) {
                days.push(i);
            }

            finalMonth = weeksRightMonth.month;
            finalYear = weeksRightMonth.year;
        }


        return {days: days, month: finalMonth, year: finalYear};
    },
    getFinalizedWeeks(month, year) {
        let thisObj = this;
        let monthWeeks = this.getWeeksInMonth(month, year);
        let leftMonthDays = this.getLeftMonthDays(month, year);
        let rightMonthDays = this.getRightMonthDays(month, year);

        // Push Current Month Week days
        monthWeeks.weeks.forEach(function (week) {
            for (let i = week.start; i <= week.end; i++) {
                week.days.push({
                    day: i,
                    month: monthWeeks.month,
                    year: monthWeeks.year,
                    hide: false,
                    hideLeftAndRightDays: false
                });
            }
        });


        // Left month days
        if (leftMonthDays.days.length) {
            leftMonthDays.days.forEach(function (day) {
                let hideLeftAndRightDays = false;

                if (!thisObj.configs.leftAndRightDays) {
                    day = '';
                    hideLeftAndRightDays = true;
                }

                monthWeeks.weeks[0].days.unshift({
                    day: day,
                    month: leftMonthDays.month,
                    year: leftMonthDays.year,
                    hide: true,
                    hideLeftAndRightDays: hideLeftAndRightDays
                });
            })
        }

        // Right month days
        if (rightMonthDays.days.length) {
            rightMonthDays.days.forEach(function (day) {
                let hideLeftAndRightDays = false;

                if (!thisObj.configs.leftAndRightDays) {
                    day = '';
                    hideLeftAndRightDays = true;
                }

                monthWeeks.weeks[monthWeeks.weeks.length - 1].days.push({
                    day: day,
                    month: rightMonthDays.month,
                    year: rightMonthDays.year,
                    hide: true,
                    hideLeftAndRightDays: hideLeftAndRightDays
                });
            })
        }

        // Remove Week Year
        monthWeeks.weeks.forEach(function (week) {
            delete week.year;
        });

        return monthWeeks.weeks;
    },
    mask(value) {
        let dayLength = this.getDateFromFormat(value).getDate().toString().length;
        let month = this.getDateFromFormat(value).getMonth();

        let dayMask = '00';
        if (dayLength === 1) {
            dayMask = '0';
        }

        let monthMask = '00';
        if (month + 1 <= 9) {
            monthMask = '0';
        }

        let mask = this.configs.dateFormat.replace('dd', dayMask).replace('mm', monthMask).replace('yyyy', '0000');
        // eslint-disable-next-line
        let literalPattern = /[0\*]/;
        let numberPattern = /[0-9]/;
        let newValue = "";

        for (let vId = 0, mId = 0; mId < mask.length;) {
            if (mId >= value.length)
                break;

            // Number expected but got a different value, store only the valid portion
            if (mask[mId] === '0' && value[vId].match(numberPattern) == null) {
                break;
            }

            // Found a literal
            while (mask[mId].match(literalPattern) == null) {
                if (value[vId] === mask[mId])
                    break;
                newValue += mask[mId++];
            }

            newValue += value[vId++];

            mId++;
        }

        return newValue;
    }
};
