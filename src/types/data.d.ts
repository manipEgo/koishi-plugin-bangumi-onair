// Copied from package bangumi-data

declare type SiteType = "info" | "onair" | "resource";

declare type Language = "ja" | "en" | "zh-Hans" | "zh-Hant";

declare type ItemType = "tv" | "web" | "movie" | "ova";

/**
 * 站点
 */
declare type Site = OnairSite | InfoSite | ResourceSite;

/**
 * 站点元数据
 */
declare interface SiteMeta {
    /**
     * 站点名称
     */
    title: string;

    /**
     * 站点 url 模板
     */
    urlTemplate: string;

    /**
     * 站点区域限制，主要针对onAir类型的放送站点。如无该字段，表明该站点无区域限制
     */
    regions?: string[];

    /**
     * 站点类型: info, onair, resource
     */
    type: SiteType;
}

/**
 * 放送站点
 */
declare interface OnairSite {
    /**
     * 站点 name，请和最外层 sites 字段中的元数据对应
     */
    site: string;

    /**
     * 站点 id，可用于替换模板中相应的字段
     */
    id: string;

    /**
     * url，如果当前url不符合urlTemplate中的规则时使用，优先级高于id
     */
    url?: string;

    /**
     * 放送开始时间
     */
    begin: string;

    /**
     * 放送周期
     */
    broadcast?: string;

    /**
     * tv/web: 番组完结时间;
     * movie: 无意义;
     * ova: 则为最终话发售时间（未确定则置空）.
     */
    end?: string;

    /**
     * 备注
     */
    comment?: string;

    /**
     * 番剧放送站点区域限制，用于覆盖站点本身的区域限制
     */
    regions: string[];
}

/**
 * 资讯站点
 */
declare interface InfoSite {
    /**
     * 站点 name，请和最外层 sites 字段中的元数据对应
     */
    site: string;

    /**
     * 站点 id，可用于替换模板中相应的字段
     */
    id: string;
}

/**
 * 资源（下载）站点
 */
declare interface ResourceSite {
    /**
     * 站点 name，请和最外层 sites 字段中的元数据对应
     */
    site: string;

    /**
     * 下载关键词，可用于替换模板中相应的字段
     */
    id: string;
}

/**
 * 番组数据
 */
declare interface Item {
    /**
     * 番组原始标题
     */
    title: string;

    /**
     * 番组标题翻译
     */
    titleTranslate: Record<Language, string[]>;

    /**
     * 番组类型
     */
    type: ItemType;

    /**
     * 番组语言
     */
    lang: Language;

    /**
     * 官网
     */
    officialSite: string;

    /**
     * tv/web: 番组开始时间;
     * movie: 上映日期;
     * ova: 首话发售时间.
     */
    begin: string;

    /**
     * 放送周期
     *
     * 参考 https://github.com/bangumi-data/bangumi-data/blob/master/CONTRIBUTING.md#%E5%85%B3%E4%BA%8Ebroadcast%E5%AD%97%E6%AE%B5
     */
    broadcast?: string;

    /**
     * tv/web: 番组完结时间;
     * movie: 无意义;
     * ova: 则为最终话发售时间（未确定则置空）.
     */
    end: string;

    /**
     * 备注
     */
    comment?: string;

    /**
     * 站点
     */
    sites: Site[];
}

type SiteList =
    | "bangumi"
    | "acfun"
    | "bilibili"
    | "bilibili_hk_mo_tw"
    | "bilibili_hk_mo"
    | "bilibili_tw"
    | "sohu"
    | "youku"
    | "qq"
    | "iqiyi"
    | "letv"
    | "pptv"
    | "mgtv"
    | "nicovideo"
    | "netflix"
    | "gamer"
    | "muse_hk"
    | "ani_one"
    | "ani_one_asia"
    | "viu"
    | "mytv"
    | "disneyplus"
    | "nowPlayer"
    | "dmhy";

/**
 * 站点元数据
 */
declare type SiteMetaRecord = Record<SiteList, SiteMeta>;

/**
 * CDN 数据
 */
declare type RawJson = {
    /**
     * 站点元数据
     */
    siteMeta: SiteMetaRecord,
    /**
     * 番组数据
     */
    items: Item[],
};

/**
 * bangumi-data 数据库表格
 */
declare interface Bangumi {
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

// ========== bangumi API ========== //

declare type Weekday = 
{ en: string = "Mon", cn: string = "星期一", ja: string = "月耀日", id: number = 1 } |
{ en: string = "Tue", cn: string = "星期二", ja: string = "火耀日", id: number = 2 } |
{ en: string = "Wed", cn: string = "星期三", ja: string = "水耀日", id: number = 3 } |
{ en: string = "Thu", cn: string = "星期四", ja: string = "木耀日", id: number = 4 } |
{ en: string = "Fri", cn: string = "星期五", ja: string = "金耀日", id: number = 5 } |
{ en: string = "Sat", cn: string = "星期六", ja: string = "土耀日", id: number = 6 } |
{ en: string = "Sun", cn: string = "星期日", ja: string = "日耀日", id: number = 7 }

declare type Images = {
    large: string,
    common: string,
    medium: string,
    small: string,
    grid: string
}

declare type Rating = {
    /**
     * 总评分人数
     */
    total: number,
    /**
     * 各分值评分人数
     */
    count: {
        1: number,
        2: number,
        3: number,
        4: number,
        5: number,
        6: number,
        7: number,
        8: number,
        9: number,
        10: number
    },
    /**
     * 评分
     */
    score: number
}

declare type Collection = {
    /**
     * 想看
     */
    wish: number,
    /**
     * 看过
     */
    collect: number,
    /**
     * 在看
     */
    doing: number,
    /**
     * 搁置
     */
    on_hold: number,
    /**
     * 抛弃
     */
    dropped: number
}


/**
 * bangumi-API 数据库表格
 */
declare interface BangumiOnair {
    id: string,
    url: string,
    type: number,
    name: string,
    name_cn: string,
    summary: string,
    air_date: string,
    air_weekday: number,
    images: Images,
    eps: number,
    eps_count: number,
    rating: Rating,
    rank: number,
    collection: Collection
}


// ========== global fields ========== //

declare var archiveDatabase;

declare var onairDatabase;