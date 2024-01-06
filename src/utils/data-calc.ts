import { Context } from 'koishi';
import moment from 'moment';
import { Config } from '..';


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
 * Get the bangumi data of the season (bangumi-data)
 * @param timeNow current time
 * @returns bangumi data of the season
 */
const getSeasonBangumiData = async (timeNow: moment.Moment, ctx: Context, config: Config): Promise<Item[]> => {
    const season = getSeason(timeNow);
    // read from database
    let bangumiData: Item[] = [];
    // exclude old bangumi
    // begin time falls in the season
    if (config.excludeOld) {
        bangumiData = await ctx.database.get("bangumi.archive", {
            $and: [
                { begin: { $gte: season.format("YYYY-MM-DD") } },
                { begin: { $lte: season.add(3, "months").format("YYYY-MM-DD") } }
            ]
        }) as Item[];
    }
    // include old bangumi
    // begin time before the season end && end time after the season begin
    else {
        bangumiData = await ctx.database.get("bangumi.archive", {
            $and: [
                {
                    $or: [
                        { end: { $gte: season.format("YYYY-MM-DD") } },
                        { end: "" },
                        { end: undefined }
                    ]
                },
                { begin: { $lte: season.add(3, "months").format("YYYY-MM-DD") } }
            ]
        }) as Item[];
    }
    return bangumiData;
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
    while (happen.dayOfYear() < timeNow.dayOfYear() && happen.dayOfYear() >= begin.dayOfYear()) {
        happen.add(period);
    }
    return timeNow.dayOfYear() === happen.dayOfYear();
}


/**
 * Get the bangumi data of the day (bangumi-data)
 * @param timeNow current time
 * @returns bangumi data of the day
 */
const getTodayBangumiData = async (timeNow: moment.Moment, ctx: Context, config: Config): Promise<Item[]> => {
    // TODO: bangumi API method?
    const seasonBangumiData = await getSeasonBangumiData(timeNow, ctx, config);
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


/**
 * Check if the databases exist
 * @param ctx context
 * @returns whether the databases exist
 */
const checkDatabasesExist = async (ctx: Context): Promise<boolean> => {
    if (await Promise.all([
        ctx.database.get("bangumi.archive", {}),
        ctx.database.get("bangumi.onair", {})
    ]).catch(async (error) => {
        return Promise.reject();
    }).then(() => {
        return true;
    }, () => {
        return false;
    })) {
        return true;
    }
    return false;
}


/**
 * Get the bangumi-API data of the day (bangumi-API)
 * @param timeNow current time
 * @param ctx context
 * @param config config
 * @returns bangumi-API data of the day
 */
const getCalendarDayData = async (timeNow: moment.Moment, ctx: Context, config: Config): Promise<BangumiOnair[]> => {
    const weekday = timeNow.isoWeekday();
    if (config.excludeOld) {
        return await ctx.database.get("bangumi.onair", {
            $and: [
                { air_weekday: weekday },
                { air_date: { $gte: getSeason(timeNow).format("YYYY-MM-DD") } },
                { air_date: { $lte: timeNow.format("YYYY-MM-DD") } },
            ]
        }) as BangumiOnair[];
    }
    return await ctx.database.get("bangumi.onair", {
        $and: [
            { air_weekday: weekday },
            { air_date: { $lte: timeNow.format("YYYY-MM-DD") } },
        ]
    }) as BangumiOnair[];
}


/**
 * Get the bangumi data of the season (bangumi-API)
 * @param timeNow current time
 * @param ctx context
 * @param config config
 * @returns bangumi-API data of the season
 */
const getCalendarSeasonData = async (timeNow: moment.Moment, ctx: Context, config: Config): Promise<BangumiOnair[]> => {
    if (config.excludeOld) {
        return await ctx.database.get("bangumi.onair", {}) as BangumiOnair[];
    }
    return await ctx.database.get("bangumi.onair", {
        air_date: { $gte: getSeason(timeNow).format("YYYY-MM-DD") }
    });
}


export { getSeasonBangumiData, getTodayBangumiData, getCalendarSeasonData, getCalendarDayData, checkDatabasesExist }