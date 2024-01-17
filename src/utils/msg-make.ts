import moment from 'moment';

import { Config } from "..";
import { getSeason } from "./data-calc";

const truncateLine = (message: string, maxLength: number): string => {
    if (maxLength === 0) {
        return message;
    }
    if (message.length > maxLength) {
        return message.slice(0, maxLength) + '...';
    }
    return message;
}

const makeDayMessage = (timeNow: moment.Moment, bangumi: Item[], config: Config): string => {
    // sort by begin time
    bangumi.sort((a, b) => {
        const beginA = a.broadcast ? moment(a.broadcast.split('/')[1]) : moment(a.begin);
        const beginB = b.broadcast ? moment(b.broadcast.split('/')[1]) : moment(b.begin);
        return beginA.format('HH:mm') > beginB.format('HH:mm') ? 1 : -1;
    });
    // convert to list of string to display
    const bangumiStringList = bangumi.map((b) => {
        const beginB = b.broadcast ? moment(b.broadcast.split('/')[1]) : moment(b.begin);
        const prefix = beginB.format(config.format.dayFormat.prefix);
        // display Chinese title
        if (config.basic.showChineseTitle) {
            return prefix +
                truncateLine(b.titleTranslate['zh-Hans'] == undefined ?
                    b.title : b.titleTranslate['zh-Hans'][0] ?? b.title, config.basic.maxTitleLength);
        }
        else {
            return prefix + truncateLine(b.title, config.basic.maxTitleLength);
        }
    });

    // mark current time between bangumi
    let timePointer = 0;
    while (timePointer < bangumiStringList.length) {
        if (moment(bangumi[timePointer].begin).format('HH:mm') > timeNow.format('HH:mm')) {
            break;
        }
        timePointer++;
    }
    return timeNow.format(config.format.dayFormat.header) + '\n' +
        bangumiStringList.slice(0, timePointer).join('\n') + '\n' +
        timeNow.format(config.format.dayFormat.clock) + '\n' +
        bangumiStringList.slice(timePointer).join('\n');
}

const makeCdayMessage = (timeNow: moment.Moment, bangumi: BangumiOnair[], config: Config): string => {
    // convert to list of strings
    const bangumiStringList = bangumi.map((b) => {
        return moment(b.air_date).format(config.format.cdayFormat.prefix) + truncateLine(config.basic.showChineseTitle ?
            (b.name_cn === '' ? b.name : b.name_cn) : b.name, config.basic.maxTitleLength);
    });
    return timeNow.format(config.format.cdayFormat.header) + '\n' +
        bangumiStringList.join('\n');
}

const makeSeasonMessage = (timeNow: moment.Moment, bangumi: Item[], config: Config): string[] => {
    // sort by isoWeekday -> begin time -> dayOfYear
    bangumi.sort((a, b) => {
        const beginA = a.broadcast ? moment(a.broadcast.split('/')[1]) : moment(a.begin);
        const beginB = b.broadcast ? moment(b.broadcast.split('/')[1]) : moment(b.begin);
        if (beginA.isoWeekday() === beginB.isoWeekday()) {
            if (beginA.format('HH:mm') === beginB.format('HH:mm')) {
                return beginA.dayOfYear() > beginB.dayOfYear() ? 1 : -1;
            }
            return beginA.format('HH:mm') > beginB.format('HH:mm') ? 1 : -1;
        }
        return beginA.isoWeekday() > beginB.isoWeekday() ? 1 : -1;
    });
    // convert to list of string to display
    const bangumiStringList = bangumi.map((b) => {
        const beginB = b.broadcast ? moment(b.broadcast.split('/')[1]) : moment(b.begin);
        const prefix = beginB.format(config.format.seasonFormat.prefix);
        // display Chinese title
        if (config.basic.showChineseTitle) {
            return prefix +
                truncateLine(b.titleTranslate['zh-Hans'] == undefined ?
                    b.title : b.titleTranslate['zh-Hans'][0] ?? b.title, config.basic.maxTitleLength);
        }
        else {
            return prefix + truncateLine(b.title, config.basic.maxTitleLength);
        }
    });

    // mark weekdays between bangumi
    let weekdayPointer = [0, 0, 0, 0, 0, 0, 0, bangumiStringList.length];
    let weekday = 1;
    while (weekday < 7) {
        while (weekdayPointer[weekday] < bangumiStringList.length) {
            const beginTime = bangumi[weekdayPointer[weekday]].broadcast ?
                moment(bangumi[weekdayPointer[weekday]].broadcast.split('/')[1]) :
                moment(bangumi[weekdayPointer[weekday]].begin);
            if (beginTime.isoWeekday() > weekday) {
                break;
            }
            weekdayPointer[weekday]++;
        }
        weekday++;
    }

    const bangumiStrings = [];
    const timeSeason = getSeason(timeNow);
    // separate season bangumi message by weekdays
    const seasonHeader = timeNow.format(config.format.seasonFormat.header);
    if (config.basic.separateWeekdays) {
        bangumiStrings.push(seasonHeader);
        for (let i = 0; i < 7; i++) {
            let timeWeekday = timeSeason.clone();
            while (timeWeekday.isoWeekday() !== i + 1) {
                timeWeekday.add(1, 'day');
            }
            bangumiStrings.push(timeWeekday.format(config.format.seasonFormat.weekday) + '\n' +
                bangumiStringList.slice(weekdayPointer[i], weekdayPointer[i + 1]).join('\n') + '\n');
        }
    }
    // display season bangumi message in one message
    else {
        let bangumiString = seasonHeader + '\n';
        for (let i = 0; i < 7; i++) {
            let timeWeekday = timeSeason.clone();
            while (timeWeekday.isoWeekday() !== i + 1) {
                timeWeekday.add(1, 'day');
            }
            bangumiString += timeWeekday.format(config.format.seasonFormat.weekday) + '\n';
            bangumiString += bangumiStringList.slice(weekdayPointer[i], weekdayPointer[i + 1]).join('\n') + '\n';
        }
        bangumiStrings.push(bangumiString);
    }
    return bangumiStrings;
}

const makeCseasonMessage = (timeNow: moment.Moment, bangumi: BangumiOnair[], config: Config): string[] => {
    // sort by weekdays
    bangumi.sort((a, b) => {
        if (a.air_weekday === b.air_weekday) {
            return a.air_date > b.air_date ? 1 : -1;
        }
        return a.air_weekday > b.air_weekday ? 1 : -1;
    });
    //convert to list of strings
    const bangumiStringList = bangumi.map((b) => {
        const formatDate = moment(b.air_date).format(config.format.cseasonFormat.prefix);
        const prefix = formatDate.match("Invalid date") != null ? config.format.cseasonFormat.prefix : formatDate;
        if (config.basic.showChineseTitle) {
            return prefix + truncateLine(b.name_cn == "" ? b.name : b.name_cn ?? b.name, config.basic.maxTitleLength);
        }
        return prefix + truncateLine(b.name, config.basic.maxTitleLength);
    });

    // mark weekdays between bangumi
    let weekdayPointer = [0, 0, 0, 0, 0, 0, 0, bangumiStringList.length];
    let weekday = 1;
    while (weekday < 7) {
        while (weekdayPointer[weekday] < bangumiStringList.length) {
            if (moment(bangumi[weekdayPointer[weekday]].air_date).isoWeekday() > weekday) {
                break;
            }
            weekdayPointer[weekday]++;
        }
        weekday++;
    }

    const bangumiStrings = [];
    const timeSeason = getSeason(timeNow);
    // separate season bangumi message by weekdays
    const seasonHeader = timeNow.format(config.format.cseasonFormat.header);
    if (config.basic.separateWeekdays) {
        bangumiStrings.push(seasonHeader);
        for (let i = 0; i < 7; i++) {
            let timeWeekday = timeSeason.clone();
            while (timeWeekday.isoWeekday() !== i + 1) {
                timeWeekday.add(1, 'day');
            }
            bangumiStrings.push(timeWeekday.format(config.format.cseasonFormat.weekday) + '\n' +
                bangumiStringList.slice(weekdayPointer[i], weekdayPointer[i + 1]).join('\n') + '\n');
        }
    }
    // display season bangumi message in one message
    else {
        let bangumiString = seasonHeader + '\n';
        for (let i = 0; i < 7; i++) {
            let timeWeekday = timeSeason.clone();
            while (timeWeekday.isoWeekday() !== i + 1) {
                timeWeekday.add(1, 'day');
            }
            bangumiString += timeWeekday.format(config.format.cseasonFormat.weekday) + '\n';
            bangumiString += bangumiStringList.slice(weekdayPointer[i], weekdayPointer[i + 1]).join('\n') + '\n';
        }
        bangumiStrings.push(bangumiString);
    }
    return bangumiStrings;
}

export { makeDayMessage, makeCdayMessage, makeSeasonMessage, makeCseasonMessage }