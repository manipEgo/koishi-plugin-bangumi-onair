import { Context, Schema } from 'koishi'
import { } from '@koishijs/plugin-help'

import moment from 'moment';

import {
    getSeasonBangumiData,
    getTodayBangumiData,
    getCalendarSeasonData,
    getCalendarDayData,
    checkDatabasesExist
} from './utils/data-calc';
import { getCDNData, getCalendarData } from './utils/data-dl';
import {
    makeDayMessage,
    makeCdayMessage,
    makeSeasonMessage,
    makeCseasonMessage
} from './utils/msg-make';


declare module 'koishi' {
    interface Tables {
        "bangumi.archive": Bangumi,
        "bangumi.onair": BangumiOnair
    }
}

export interface Config {
    excludeOld: boolean;
    showChineseTitle: boolean;
    separateWeekdays: boolean;
    maxTitleLength: number;
}

export const name = 'bangumi-onair'

export const inject = ['database']

export const Config: Schema<Config> = Schema.object({
    // exclude bangumi of seasons before this season
    excludeOld: Schema.boolean().default(false),
    // display Chinese title
    showChineseTitle: Schema.boolean().default(true),
    // separate season bangumi message by weekdays
    separateWeekdays: Schema.boolean().default(true),
    // max length of title
    maxTitleLength: Schema.number().default(0),
}).i18n({
    'en-US': require('./locales/en-US')._config,
    'zh-CN': require('./locales/zh-CN')._config,
})


export function apply(ctx: Context, config: Config) {
    // localization
    ctx.i18n.define('en-US', require('./locales/en-US'))
    ctx.i18n.define('zh-CN', require('./locales/zh-CN'))
    // bangumi onair today
    ctx.command('onair.day [offset:number]')
        .alias('bd')
        .action(async ({ session }, offset) => {
            // check if database exists
            if (!await checkDatabasesExist(ctx)) {
                await session.execute('onair.update');
            }

            // get bangumi data of today, plus offset
            const timeNow = moment().add(offset, 'days');
            const bangumi = await getTodayBangumiData(timeNow, ctx, config);
            // convert to string to display
            const bangumiString = makeDayMessage(timeNow, bangumi, config);
            session.sendQueued(bangumiString);
        });

    // bangumi onair calender day
    ctx.command('onair.cday [offset:number]')
        .alias('bcd')
        .action(async ({ session }, offset) => {
            // check if database exists
            if (!await checkDatabasesExist(ctx)) {
                await session.execute('onair.update');
            }

            // get bangumi data of today, plus offset
            const timeNow = moment().add(offset, 'days');
            const bangumi = await getCalendarDayData(timeNow, ctx, config);
            // convert to string to display
            const bangumiString = makeCdayMessage(timeNow, bangumi, config);
            session.sendQueued(bangumiString);
        });

    // bangumi onair this season
    ctx.command('onair.season [offset:number]')
        .alias('bs')
        .action(async ({ session }, offset) => {
            // check if database exists
            if (!await checkDatabasesExist(ctx)) {
                await session.execute('onair.update');
            }

            // get bangumi data of this season, plus offset
            const timeNow = moment().add(offset * 3, 'months');
            const bangumi = await getSeasonBangumiData(timeNow, ctx, config);
            // convert to string to display
            const bangumiStrings = makeSeasonMessage(timeNow, bangumi, config);
            for (const bangumiString of bangumiStrings) {
                session.sendQueued(bangumiString);
            }
        });

    // bangumi onair calendar season
    ctx.command('onair.cseason')
        .alias('bcs')
        .action(async ({ session }) => {
            // check if database exists
            if (!await checkDatabasesExist(ctx)) {
                await session.execute('onair.update');
            }

            // get bangumi data of this season
            const timeNow = moment();
            const bangumi = await getCalendarSeasonData(timeNow, ctx, config);
            // convert to string to display
            const bangumiStrings = makeCseasonMessage(timeNow, bangumi, config);
            for (const bangumiString of bangumiStrings) {
                session.sendQueued(bangumiString);
            }
        });

    // update bangumi database
    ctx.command('onair.update')
        .alias('bupdate')
        .action(async ({ session }) => {
            ctx.database.extend("bangumi.archive", {
                id: 'unsigned',
                title: 'string',
                titleTranslate: 'json',
                type: 'string',
                lang: 'string',
                officialSite: 'string',
                begin: 'string',
                broadcast: 'string',
                end: 'string',
                comment: 'string',
                sites: 'json',
            }, {
                primary: 'id'
            });
            ctx.database.extend("bangumi.onair", {
                id: 'unsigned',
                url: 'string',
                type: 'unsigned',
                name: 'string',
                name_cn: 'string',
                summary: 'string',
                air_date: 'string',
                air_weekday: 'unsigned',
                images: 'json',
                eps: 'unsigned',
                eps_count: 'unsigned',
                rating: 'json',
                rank: 'unsigned',
                collection: 'json'
            }, {
                primary: 'id'
            });
            session.sendQueued(session.text('.updating'));

            await Promise.allSettled([
                // get bangumi data from CDN
                new Promise<void>(async (resolve, reject) => {
                    const bangumiData = await getCDNData(ctx, session);
                    // sort by begin time -> title
                    bangumiData.items.sort((a, b) => {
                        if (a.begin === b.begin) {
                            return a.title > b.title ? 1 : -1;
                        }
                        return a.begin > b.begin ? 1 : -1;
                    });
                    // insert id
                    let id = 0;
                    let bangumiWithId = [];
                    for (const bangumi of bangumiData.items) {
                        bangumiWithId.push({
                            id: id++,
                            ...bangumi
                        });
                    }
                    // save bangumi items to database
                    await ctx.database.upsert("bangumi.archive", bangumiWithId);
                    resolve();
                }),

                // get calendar data from API
                new Promise<void>(async (resolve, reject) => {
                    const calendarData = await getCalendarData(ctx, session);
                    // save calendar data to database
                    await ctx.database.upsert("bangumi.onair", calendarData);
                    resolve();
                })
            ]).catch((error) => {
                console.error(error);
                session.sendQueued(session.text('.failed'));
                return Promise.reject();
            }).then(() => {
                session.sendQueued(session.text('.updated'));
            }, () => {});
        });

    // clear bangumi database
    ctx.command('onair.drop', { hidden: true })
        .alias('bdrop')
        .action(async ({ session }) => {
            // clear bangumi database
            await Promise.all([
                ctx.database.drop("bangumi.archive"),
                ctx.database.drop("bangumi.onair")
            ]).catch((error) => {
                console.error(error);
                session.sendQueued(session.text('.failed'));
                return Promise.reject();
            }).then(() => {
                session.sendQueued(session.text('.dropped'));
            }, () => {});
        });
}
