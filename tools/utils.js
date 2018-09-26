const fs = require('fs');
const request = require('request-promise-native');

async function downloadPageIfNotCached(browser, url) {
    let content = undefined;
    let urlSplit = url.split("/");
    let cacheName = "cache/" + urlSplit[urlSplit.length - 1];
    try {
        content = fs.readFileSync(cacheName);
    } catch (e) {}

    if (!content) {
        const page = await browser.newPage();
        await page.goto(url);
        content = await page.content();
        fs.writeFileSync(cacheName, content);
    }

    return content;
}

async function getLatLngFromAddress(address) {
    const response = await request({
        uri: "https://geocoder.api.here.com/6.2/geocode.json",
        qs: {
            searchtext: address,
            app_id: process.env.HERE_APP_ID,
            app_code: process.env.HERE_APP_CODE,
            gen: 9,
        },
        json: true,
    });

    if (response.Response.View.length === 0) {
        console.error("Cannot find Lat/Lng for " + address);
    }

    return {
        latitude: response.Response.View[0].Result[0].Location.NavigationPosition[0].Latitude,
        longitude: response.Response.View[0].Result[0].Location.NavigationPosition[0].Longitude,
    };
}

async function getAddressFromLatLng(latitude, longitude) {
    const response = await request({
        uri: "https://reverse.geocoder.api.here.com/6.2/reversegeocode.json",
        qs: {
            prox: `${latitude},${longitude},10`,
            mode: "retrieveAddresses",
            maxresults: 1,
            app_id: process.env.HERE_APP_ID,
            app_code: process.env.HERE_APP_CODE,
            gen: 9,
        },
        json: true,
    });

    if (response.Response.View.length === 0) {
        throw "Cannot find address for " + latitude + "," + longitude;
    }

    return response.Response.View[0].Result[0].Location.Address.Label + " " + response.Response.View[0].Result[0].Location.Address.PostalCode;
}

module.exports = {
    downloadPageIfNotCached,
    getLatLngFromAddress,
    getAddressFromLatLng,
}