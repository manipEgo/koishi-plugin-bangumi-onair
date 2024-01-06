import { Config } from "..";
import moment from 'moment';

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
        return moment(a.begin).format('HH:mm') > moment(b.begin).format('HH:mm') ? 1 : -1;
    });
    // convert to list of string to display
    const bangumiStringList = bangumi.map((b) => {
        const prefix = moment(b.begin).format("HH:mm") + "   ";
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
    const timeMarker = "> --- " + timeNow.format('HH:mm YY/MM/DD') + " ---\n";
    return bangumiStringList.slice(0, timePointer).join('\n') + '\n' + timeMarker + bangumiStringList.slice(timePointer).join('\n');
}

const makeCdayMessage = (timeNow: moment.Moment, bangumi: BangumiOnair[], config: Config): string => {
    // convert to list of strings
    const bangumiStringList = bangumi.map((b) => {
        return truncateLine(config.basic.showChineseTitle ?
        (b.name_cn === '' ? b.name : b.name_cn) : b.name, config.basic.maxTitleLength);
    });
    const weekdayMarker = "--- " + timeNow.format("dddd YY/MM/DD") + " ---\n";
    return weekdayMarker + bangumiStringList.join('\n');
}

const makeSeasonMessage = (timeNow: moment.Moment, bangumi: Item[], config: Config): string[] => {
    // sort by isoWeekday -> begin time -> dayOfYear
    bangumi.sort((a, b) => {
        if (moment(a.begin).isoWeekday() === moment(b.begin).isoWeekday()) {
            if (moment(a.begin).format('HH:mm') === moment(b.begin).format('HH:mm')) {
                return moment(a.begin).dayOfYear() > moment(b.begin).dayOfYear() ? 1 : -1;
            }
            return moment(a.begin).format('HH:mm') > moment(b.begin).format('HH:mm') ? 1 : -1;
        }
        return moment(a.begin).isoWeekday() > moment(b.begin).isoWeekday() ? 1 : -1;
    });
    // convert to list of string to display
    const bangumiStringList = bangumi.map((b) => {
        const prefix = moment(b.begin).format("HH:mm MM-DD") + "   ";
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
            if (moment(bangumi[weekdayPointer[weekday]].begin).isoWeekday() > weekday) {
                break;
            }
            weekdayPointer[weekday]++;
        }
        weekday++;
    }

    const bangumiStrings = [];
    // separate season bangumi message by weekdays
    const seasonMarker = `> --- ${timeNow.format('YY/MM')} ---`;
    if (config.basic.separateWeekdays) {
        bangumiStrings.push(seasonMarker);
        for (let i = 0; i < 7; i++) {
            // TODO: beter formatting
            bangumiStrings.push(`--- ${moment.weekdays(i + 1)} ---\n` +
                bangumiStringList.slice(weekdayPointer[i], weekdayPointer[i + 1]).join('\n') + '\n');
        }
    }
    // display season bangumi message in one message
    else {
        let bangumiString = seasonMarker + '\n';
        for (let i = 0; i < 7; i++) {
            bangumiString += `--- ${moment.weekdays(i + 1)} ---\n`;
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
        const formatDate = moment(b.air_date).format("MM-DD");
        const prefix = formatDate === "Invalid date" ? "00-00" : formatDate;
        if (config.basic.showChineseTitle) {
            return `${prefix}   ${truncateLine(b.name_cn == "" ? b.name : b.name_cn ?? b.name, config.basic.maxTitleLength)}`;
        }
        return `${prefix}   ${truncateLine(b.name, config.basic.maxTitleLength)}`;
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
    // separate season bangumi message by weekdays
    const seasonMarker = `> --- ${timeNow.format('YY/MM')} ---`;
    if (config.basic.separateWeekdays) {
        bangumiStrings.push(seasonMarker);
        for (let i = 0; i < 7; i++) {
            // TODO: beter formatting
            bangumiStrings.push(`--- ${moment.weekdays(i + 1)} ---\n` +
                bangumiStringList.slice(weekdayPointer[i], weekdayPointer[i + 1]).join('\n') + '\n');
        }
    }
    // display season bangumi message in one message
    else {
        let bangumiString = seasonMarker + '\n';
        for (let i = 0; i < 7; i++) {
            bangumiString += `--- ${moment.weekdays(i + 1)} ---\n`;
            bangumiString += bangumiStringList.slice(weekdayPointer[i], weekdayPointer[i + 1]).join('\n') + '\n';
        }
        bangumiStrings.push(bangumiString);
    }
    return bangumiStrings;
}

export { makeDayMessage, makeCdayMessage, makeSeasonMessage, makeCseasonMessage }