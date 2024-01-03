const calendarAPI = "https://api.bgm.tv/calendar";

const getCDNData = async ( session ) => {
    // get bangumi data from CDN
    try {
        const response = new Response(
            await fetch("https://cdn.jsdelivr.net/npm/bangumi-data/dist/data.json"
            ).then((res) => res.text())
        );
        return await response.json() as RawJson;
    }
    catch (error) {
        console.error(error);
        // TODO: localization
        session.sendQueued(`Failed to get bangumi data from CDN.`);
        return;
    }
}

const getCalendarData = async ( session ) => {
    try {
        const calendarData = await fetch(calendarAPI).then((res) => res.json()) as BangumiOnair;
        return calendarData;
    }
    catch (error) {
        console.error(error);
        session.sendQueued(`Failed to get bangumi data from API.`);
    }
}


export { getCDNData, getCalendarData }