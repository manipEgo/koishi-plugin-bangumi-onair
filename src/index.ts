import { Context, Schema } from 'koishi'

import moment from 'moment';

import { getSeasonBangumiData, getTodayBangumiData } from './utils/data-calc';
import { getCDNData } from './utils/data-manip';


declare module 'koishi' {
  interface Tables {
    bangumi: Bangumi
  }
}

export interface Bangumi {
  id: number;
  title: string;
  titleTranslate: Record<Language, string[]>;
  type: ItemType;
  lang: Language;
  officialSite: string;
  begin: string;
  broadcast: string;
  end: string;
  comment: string;
  sites: Site[];
}

export interface Config {
  excludeOld: boolean;
  showChineseTitle: boolean;
  separateWeekdays: boolean;
}

export const name = 'bangumi-onair'

export const Config: Schema<Config> = Schema.object({
  // exclude bangumi of seasons before this season
  excludeOld: Schema.boolean().default(false),
  // display Chinese title
  showChineseTitle: Schema.boolean().default(true),
  // separate season bangumi message by weekdays
  separateWeekdays: Schema.boolean().default(true),
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
    try {
      await ctx.database.get('bangumi', {});
    }
    catch (error) {
      await session.execute('onair.update');
    }

    const timeNow = moment().add(offset, 'days');
    // get bangumi data of today, plus offset
    const bangumi = await getTodayBangumiData(timeNow, ctx, config);
    // sort by begin time
    bangumi.sort((a, b) => {
      return moment(a.begin).format('HH:mm') > moment(b.begin).format('HH:mm') ? 1 : -1;
    });
    // convert to list of string to display
    const bangumiStringList = bangumi.map((b) => {
      const prefix = moment(b.begin).format("HH:mm") + "   ";
      // display Chinese title
      if (config.showChineseTitle) {
        return prefix +
          (b.titleTranslate['zh-Hans'] == undefined ?
            b.title : b.titleTranslate['zh-Hans'][0] ?? b.title)
      }
      else {
        return prefix + b.title
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
    const timeMarker = "> --- " + timeNow.format('YY/MM/DD HH:mm') + " ---\n";
    const bangumiString = bangumiStringList.slice(0, timePointer).join('\n') + '\n' + timeMarker + bangumiStringList.slice(timePointer).join('\n');
    session.sendQueued(bangumiString);
  });

  // bangumi onair this season
  ctx.command('onair.season [offset:number]')
  .alias('bs')
  .action(async ({ session }, offset) => {
    // check if database exists
    try {
      await ctx.database.get('bangumi', {});
    }
    catch (error) {
      await session.execute('onair.update');
    }

    const timeNow = moment().add(offset * 3, 'months');
    const bangumi = await getSeasonBangumiData(timeNow, ctx, config);
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
      if (config.showChineseTitle) {
        return prefix +
          (b.titleTranslate['zh-Hans'] == undefined ?
            b.title : b.titleTranslate['zh-Hans'][0] ?? b.title)
      }
      else {
        return prefix + b.title
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

    // separate season bangumi message by weekdays
    const seasonMarker = `> --- ${timeNow.format('YY/MM')} ---`;
    if (config.separateWeekdays) {
      session.sendQueued(seasonMarker);
      for (let i = 0; i < 7; i++) {
        // TODO: beter formatting
        session.sendQueued(`--- ${moment.weekdays(i + 1)} ---\n` +
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
      session.sendQueued(bangumiString);
    }
  });

  // update bangumi database
  ctx.command('onair.update')
  .alias('bupdate')
  .action(async ({ session }) => {
    await session.execute('onair.drop');
    ctx.database.extend('bangumi', {
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
    // get bangumi data from CDN
    session.sendQueued(session.text('.updating'));
    const bangumiData = await getCDNData(session);
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
    await ctx.database.upsert('bangumi', bangumiData.items);
    // TODO: localization
    session.sendQueued(session.text('.updated'));
  });

  // clear bangumi database
  ctx.command('onair.drop')
  .alias('bdrop')
  .action(async ({ session }) => {
    // clear bangumi database
    try {
      await ctx.database.drop('bangumi');
    }
    catch (error) {
      session.sendQueued(session.text('.failed'));
      return;
    }
    session.sendQueued(session.text('.dropped'));
  });
}
