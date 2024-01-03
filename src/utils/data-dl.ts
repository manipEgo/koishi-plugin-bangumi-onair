import { version, homepage } from "../../package.json";

const developer = "manipEgo";
const appName = "koishi-plugin-bangumi-onair";

const CdnUrl = "https://cdn.jsdelivr.net/npm/bangumi-data/dist/data.json";
const calendarAPI = "https://api.bgm.tv/calendar";

const userAgent = `${developer}/${appName}/${version} (${homepage})`;


const getCDNData = async (ctx, session): Promise<RawJson> => {
    // get bangumi data from CDN
    try {
        const cdnData = await ctx.http.get(CdnUrl, {
            headers: {
                "User-Agent": userAgent
            }
        });
        return await cdnData as RawJson;
    }
    catch (error) {
        console.error(error);
        // TODO: localization
        session.sendQueued(`Failed to get bangumi data from CDN.`);
        return;
    }
}

const getCalendarData = async (ctx, session): Promise<BangumiOnair[]> => {
    try {
        const calendarData = await ctx.http.get(calendarAPI, {
            headers: {
                "User-Agent": userAgent
            }
        });
        const bangumiOnair = calendarData.map((b) => b.items);
        return bangumiOnair.reduce((accumulator, value) => accumulator.concat(value), []) as BangumiOnair[];
    }
    catch (error) {
        console.error(error);
        session.sendQueued(`Failed to get bangumi data from API.`);
    }
}


export { getCDNData, getCalendarData }