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
        const calendarData = await fetch(calendarAPI).then((res) => res.json());
        const bangumiOnair = calendarData.map((b) => {
            let items = b.items;
            items.map((i) => i.air_weekday = b.weekday);
            return items;
        });
        return bangumiOnair.reduce((accumulator, value) => accumulator.concat(value), []);
    }
    catch (error) {
        console.error(error);
        session.sendQueued(`Failed to get bangumi data from API.`);
    }
}


export { getCDNData, getCalendarData }