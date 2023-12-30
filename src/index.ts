import { Context, Schema } from 'koishi'

import moment from 'moment';

import { getSeasonBangumiData, getTodayBangumiData } from './utils/data-calc';
import { getCDNData } from './utils/data-manip';

export const name = 'bangumi-onair'

export interface Config {
  excludeOld: boolean;
  showChineseTitle: boolean;
}

export const Config: Schema<Config> = Schema.object({
  // exclude bangumi of seasons before this season
  excludeOld: Schema.boolean().default(false).description('exclude bangumi of seasons before this season'),
  // display Chinese title
  showChineseTitle: Schema.boolean().default(true).description('display Chinese title'),
})

export function apply(ctx: Context, config: Config) {
  // create bangumi table
  ctx.model.extend('bangumi', {
    id: 'unsigned',
    title: { type: 'string', unique: true },
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
    primary: 'id',
  });

  // bangumi onair today
  ctx.command('onair/day').action(async (_) => {
    const bangumi = await getTodayBangumiData(ctx, config);
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
      if (moment(bangumi[timePointer].begin).format('HH:mm') > moment().format('HH:mm')) {
        break;
      }
      timePointer++;
    }
    const timeMarker = "> --- " + moment().format('HH:mm') + " ---\n";
    const bangumiString = bangumiStringList.slice(0, timePointer).join('\n') + '\n' + timeMarker + bangumiStringList.slice(timePointer).join('\n');
    return bangumiString;
  });

  // bangumi onair this season
  ctx.command('onair/season').action(async (_) => {
    const bangumi = await getSeasonBangumiData(ctx, config);
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
    let bangumiString = "";
    for (let i = 0; i < 7; i++) {
      bangumiString += `--- ${moment().isoWeekday(i + 1).format('dddd')} ---\n`;
      bangumiString += bangumiStringList.slice(weekdayPointer[i], weekdayPointer[i + 1]).join('\n') + '\n';
    }
    return bangumiString;
  });

  ctx.command('onair/update').action(async ({ session }) => {
    // get bangumi data from CDN
    session.send(`Updating bangumi data...`);
    const bangumiData = await getCDNData();
    // save bangumi items to database
    await ctx.database.upsert('bangumi', bangumiData.items, 'id');
    // TODO: localization
    session.send(`Bangumi data updated!`);
  });
}
