import { Context, Schema } from 'koishi'

// bangumi-calc
import { getTodayBangumiData } from './utils/data-calc';

const moment = require('moment');

export const name = 'bangumi-onair'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  // bangumi onair
  ctx.command('tv').action((_) => {
    const timeNow = moment();
    const bangumi = getTodayBangumiData(timeNow);
    return JSON.stringify(bangumi.map((b) => b.title)).replaceAll(',', '\n').replaceAll('[', '').replaceAll(']', '');
  });
}
