const getCDNData = async () => {
    // get bangumi data from CDN
    const response = new Response(
        await fetch("https://cdn.jsdelivr.net/npm/bangumi-data/dist/data.json"
        ).then((res) => res.text())
    );
    return await response.json() as rawJson;
}

export { getCDNData }