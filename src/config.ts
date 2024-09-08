import { Schema } from "koishi"

namespace BasicConfig {
    export interface Config {
        excludeOld: boolean;
        thirtyHourSystem: boolean;
        showChineseTitle: boolean;
        separateWeekdays: boolean;
        maxTitleLength: number;
    }
}

namespace NetworkConfig {
    export interface Config {
        cdnUrls: Array<string>;
    }
}

namespace FormatConfig {
    export interface Config {
        dayFormat: {
            header: string;
            prefix: string;
            clock: string;
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
    network: NetworkConfig.Config;
    format: FormatConfig.Config;
}

const basicConfig: Schema<BasicConfig.Config> = Schema.object({
    // exclude bangumi of seasons before this season
    excludeOld: Schema.boolean().default(false),
    // use 30-hour system
    thirtyHourSystem: Schema.boolean().default(false),
    // display Chinese title
    showChineseTitle: Schema.boolean().default(true),
    // separate season bangumi message by weekdays
    separateWeekdays: Schema.boolean().default(true),
    // max length of title
    maxTitleLength: Schema.number().default(0),
});

const networkConfig: Schema<NetworkConfig.Config> = Schema.object({
    // custom CDN urls
    cdnUrls: Schema.array(Schema.string()).default([
        "https://unpkg.com/bangumi-data@0.3.150/dist/data.json",
        "https://cdn.jsdelivr.net/npm/bangumi-data/dist/data.json",
        "https://cdn.jsdmirror.com/npm/bangumi-data/dist/data.json"
    ])
})

const formatConfig: Schema<FormatConfig.Config> = Schema.object({
    dayFormat: Schema.object({
        header: Schema.string().default("=== dddd YY/MM/DD ==="),
        prefix: Schema.string().default("HH:mm   "),
        clock: Schema.string().default("+ --- HH:mm --- +"),
    }).collapse(),
    seasonFormat: Schema.object({
        header: Schema.string().default("=== YY/MM ==="),
        prefix: Schema.string().default("HH:mm MM-DD   "),
        weekday: Schema.string().default("+ --- dddd --- +"),
    }).collapse(),
    cdayFormat: Schema.object({
        header: Schema.string().default("=== dddd YY/MM/DD ==="),
        prefix: Schema.string().default("MM-DD   "),
    }).collapse(),
    cseasonFormat: Schema.object({
        header: Schema.string().default("=== YY/MM ==="),
        prefix: Schema.string().default("MM-DD   "),
        weekday: Schema.string().default("+ --- dddd --- +"),
    }).collapse(),
});

export const Config: Schema<Config> = Schema.object({
    basic: basicConfig,
    network: networkConfig,
    format: formatConfig,
}).i18n({
    "en-US": require("./locales/config_en-US"),
    "zh-CN": require("./locales/config_zh-CN"),
})
