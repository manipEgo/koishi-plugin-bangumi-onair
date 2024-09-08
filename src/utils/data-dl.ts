import { version, homepage } from "../../package.json";
import { Config } from '..';

const developer = "manipEgo";
const appName = "koishi-plugin-bangumi-onair";

const CdnUrl = "https://cdn.jsdelivr.net/npm/bangumi-data/dist/data.json";
const calendarAPI = "https://api.bgm.tv/calendar";

const userAgent = `${developer}/${appName}/${version} (${homepage})`;


const getCDNData = async (ctx, session, config: Config): Promise<RawJson> => {
    // get bangumi data from CDN
    for (const url of config.network.cdnUrls) {
        try {
            const cdnData = await ctx.http.get(url, {
                headers: {
                    "User-Agent": userAgent
                }
            });
            return await cdnData as RawJson;
        } catch (error) {
            console.error(`Failed to fetch from ${url}:`, error);
            // try next URL
        }
    }

    // all URLs failed
    console.error("All CDN URLs failed.");
    session.sendQueued(session.text(".cdnFailed"));
    return;
}

const getCalendarData = async (ctx, session): Promise<BangumiOnair[]> => {
    try {
        const calendarData = await ctx.http.get(calendarAPI);
        const bangumiOnair = calendarData.map((b) => b.items);
        return bangumiOnair.reduce((accumulator, value) => accumulator.concat(value), []) as BangumiOnair[];
    }
    catch (error) {
        console.error(error);
        session.sendQueued(session.text(".apiFailed"));
    }
}


export { getCDNData, getCalendarData }