import bangumiData from 'bangumi-data';
import moment from 'moment';

/**
 * Get the season of the time
 * @param timeNow current time
 * @returns day 1 of the season
 */
const getSeason = (timeNow: moment.Moment): moment.Moment => {
    const year = timeNow.year();
    const month = timeNow.month();
    if (month >= 0 && month <= 2) {
        return moment([year, 0]);
    } else if (month >= 3 && month <= 5) {
        return moment([year, 3]);
    } else if (month >= 6 && month <= 8) {
        return moment([year, 6]);
    } else if (month >= 9 && month <= 11) {
        return moment([year, 9]);
    }
    return moment([year, 0]);
}

/**
 * Get the bangumi data of the season
 * @param timeNow current time
 * @returns bangumi data of the season
 */
const getSeasonBangumiData = (timeNow: moment.Moment): bangumiData.Item[] => {
    const season = getSeason(timeNow);
    const seasonBangumiData = bangumiData.items.filter((b) => {
        const begin = moment(b.begin);
        const end = moment(b.end);
        return (
            (begin.isSameOrAfter(season) &&
                end.isSameOrBefore(season.clone().add(3, "months"))) ||
            b.end === "" ||
            b.end === undefined
        );
    });
    return seasonBangumiData;
}


/**
 * Check if the time hit the period
 * @param timeNow current time
 * @param begin the begin time of the period
 * @param period the period
 * @returns if the time hit the period
 */
const checkPeriodHitDay = (timeNow: moment.Moment, begin: moment.Moment, period: moment.Duration): boolean => {
    if (period.asMilliseconds() === 0) {
        return timeNow.dayOfYear() === begin.dayOfYear();
    }
    const happen = begin.clone();
    while (happen.isBefore(timeNow)) {
        happen.add(period);
    }
    return timeNow.dayOfYear() === happen.dayOfYear();
}


/**
 * Get the bangumi data of today
 * @param timeNow current time
 * @returns bangumi data of today
 */
const getTodayBangumiData = (timeNow: moment.Moment): bangumiData.Item[] => {
    const seasonBangumiData = getSeasonBangumiData(timeNow);
    const todayBangumiData = seasonBangumiData.filter((b) => {
        // check if the bangumi is already end
        if (b.end !== "" && b.end !== undefined) {
            const end = moment(b.end);
            if (end.isBefore(timeNow)) {
                return false;
            }
        }
        const begin = moment(b.begin);
        // use bangumi-data broadcast for period if exist
        // https://github.com/bangumi-data/bangumi-data/blob/master/CONTRIBUTING.md#%E5%85%B3%E4%BA%8Ebroadcast%E5%AD%97%E6%AE%B5
        const broadcast = b.broadcast;
        // default period for tv and web is 1 week
        // default period for others is 0 day
        const period = broadcast ?
            moment.duration('P' + broadcast.split('P')[1]) :
            ((b.type === "tv" || b.type === "web") ?
                moment.duration(1, "week") : moment.duration(0, "day"));
        return checkPeriodHitDay(timeNow, begin, period);
    });
    return todayBangumiData;
}

export { getTodayBangumiData }