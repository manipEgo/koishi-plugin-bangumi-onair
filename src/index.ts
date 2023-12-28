import { Context, Schema } from 'koishi'

import moment from 'moment';

// bangumi-calc
import { getTodayBangumiData } from './utils/data-calc';

export const name = 'bangumi-onair'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  // bangumi onair
  ctx.command('tv').action((_) => {
    const timeNow = moment();
    const bangumi = getTodayBangumiData(timeNow);
    bangumi.sort((a, b) => {
      return moment(a.begin).format('HH:mm') > moment(b.begin).format('HH:mm') ? 1 : -1;
    });
    const bangumiStringList = bangumi.map((b) => moment(b.begin).format('HH:mm') + "   " + b.title);
    // mark current time
    let i = 0;
    while (i < bangumiStringList.length) {
      if (moment(bangumi[i].begin).format('HH:mm') > moment().format('HH:mm')) {
        break;
      }
      i++;
    }
    const timeMarker = "> --- " + moment().format('HH:mm') + " ---\n";
    const bangumiString = bangumiStringList.slice(0, i).join('\n') + '\n' + timeMarker + bangumiStringList.slice(i).join('\n');
    return bangumiString;
  });
}
