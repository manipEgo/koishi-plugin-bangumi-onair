import { Schema } from 'koishi'

namespace BasicConfig {
    export interface Config {
        excludeOld: boolean;
        showChineseTitle: boolean;
        separateWeekdays: boolean;
        maxTitleLength: number;
    }
}

namespace FormatConfig {
    export interface Config {
        dayFormat: {
            header: string;
            prefix: string;
            marker: string;
        };
        seasonFormat: {
            header: string;
            prefix: string;
            weekday: string;
        };
        cdayFormat: {
            header: string;
            prefix: string;
        };
        cseasonFormat: {
            header: string;
            prefix: string;
            weekday: string;
        };
    }
}

export interface Config {
    basic: BasicConfig.Config;
    format: FormatConfig.Config;
}

const basicConfig: Schema<BasicConfig.Config> = Schema.object({
    // exclude bangumi of seasons before this season
    excludeOld: Schema.boolean().default(false),
    // display Chinese title
    showChineseTitle: Schema.boolean().default(true),
    // separate season bangumi message by weekdays
    separateWeekdays: Schema.boolean().default(true),
    // max length of title
    maxTitleLength: Schema.number().default(0),
});

const formatConfig: Schema<FormatConfig.Config> = Schema.object({
    dayFormat: Schema.object({
        header: Schema.string().default('今日番组表'),
        prefix: Schema.string().default(''),
        marker: Schema.string().default('★'),
    }).collapse(),
    seasonFormat: Schema.object({
        header: Schema.string().default('本季番组表'),
        prefix: Schema.string().default(''),
        weekday: Schema.string().default(''),
    }).collapse(),
    cdayFormat: Schema.object({
        header: Schema.string().default('今日番组表'),
        prefix: Schema.string().default(''),
    }).collapse(),
    cseasonFormat: Schema.object({
        header: Schema.string().default('本季番组表'),
        prefix: Schema.string().default(''),
        weekday: Schema.string().default(''),
    }).collapse(),
});

export const Config: Schema<Config> = Schema.object({
    basic: basicConfig,
    format: formatConfig,
}).i18n({
    'en-US': require('./locales/config_en-US.yml'),
    'zh-CN': require('./locales/config_zh-CN.yml'),
})
