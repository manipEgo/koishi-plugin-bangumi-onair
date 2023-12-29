import { Context, Schema } from 'koishi'

import moment from 'moment';

// bangumi-calc
import { getSeasonBangumiData, getTodayBangumiData } from './utils/data-calc';

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
  // bangumi onair today
  ctx.command('onair/day').action((_) => {
    const bangumi = getTodayBangumiData(moment(), config);
    bangumi.sort((a, b) => {
      return moment(a.begin).format('HH:mm') > moment(b.begin).format('HH:mm') ? 1 : -1;
    });
    const bangumiStringList = bangumi.map((b) => {
      // display Chinese title
      if (config.showChineseTitle) {
        return moment(b.begin).format('HH:mm') + "   " +
          (b.titleTranslate['zh-Hans'] == undefined ?
            b.title : b.titleTranslate['zh-Hans'][0] ?? b.title)
      }
      else {
        return moment(b.begin).format('HH:mm') + "   " + b.title
      }
    });
    // mark current time
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
  ctx.command('onair/season').action((_) => {
    const bangumi = getSeasonBangumiData(moment(), config);
    bangumi.sort((a, b) => {
      if (moment(a.begin).isoWeekday() === moment(b.begin).isoWeekday()) {
        return moment(a.begin).dayOfYear() > moment(b.begin).dayOfYear() ? 1 : -1;
      }
      return moment(a.begin).isoWeekday() > moment(b.begin).isoWeekday() ? 1 : -1;
    });
    const bangumiStringList = bangumi.map((b) => {
      // display Chinese title
      if (config.showChineseTitle) {
        return moment(b.begin).format('MM-DD') + "   " +
          (b.titleTranslate['zh-Hans'] == undefined ?
            b.title : b.titleTranslate['zh-Hans'][0] ?? b.title)
      }
      else {
        return moment(b.begin).format('MM-DD') + "   " + b.title
      }
  });
    // mark weekdays
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
}
