import { Schema } from 'koishi'

namespace BasicConfig {
    export interface Config {
        excludeOld: boolean;
        showChineseTitle: boolean;
        separateWeekdays: boolean;
        maxTitleLength: number;
    }
}

export interface Config {
    basic: BasicConfig.Config
}

export const Config: Schema<Config> = Schema.object({
    basic: Schema.object({
        // exclude bangumi of seasons before this season
        excludeOld: Schema.boolean().default(false),
        // display Chinese title
        showChineseTitle: Schema.boolean().default(true),
        // separate season bangumi message by weekdays
        separateWeekdays: Schema.boolean().default(true),
        // max length of title
        maxTitleLength: Schema.number().default(0),
    }),
}).i18n({
    'en-US': require('./locales/config_en-US.yml'),
    'zh-CN': require('./locales/config_zh-CN.yml'),
})
