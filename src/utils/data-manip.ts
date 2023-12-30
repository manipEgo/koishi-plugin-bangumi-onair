const getCDNData = async ( session ) => {
    // get bangumi data from CDN
    try {
        const response = new Response(
            await fetch("https://cdn.jsdelivr.net/npm/bangumi-data/dist/data.json"
            ).then((res) => res.text())
        );
        return await response.json() as rawJson;
    }
    catch (error) {
        console.error(error);
        session.sendQueued(`Failed to get bangumi data from CDN.`);
        return;
    }
}

export { getCDNData }