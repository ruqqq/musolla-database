const fs = require('fs');
const moment = require('moment');
const uuid = require('uuid4');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const request = require('request-promise-native');
const ngeohash = require('ngeohash');

const currentData = require('../data.json');
const currentDataKeys = Object.keys(currentData);
const currentMosques = Object.values(currentData).filter((currentItem) => currentItem.type === "Mosque");

main();

async function main() {
    const browser = await setupBrowser();
    const mosques = await getMosquesFromMUIS(browser);

    const updatedMosques = [];
    const removedMosques = [];
    for (let id of currentDataKeys) {
        const currentItem = currentData[id];
        if (currentItem.type !== "Mosque" || currentItem.address.indexOf("Singapore ") === -1) {
            continue;
        }

        const matchedItem = mosques.filter((item) => {
            return currentItem.name === item.name + " Mosque";
        });

        if (matchedItem.length === 0) {
            removedMosques.push(currentItem);
            delete currentData[currentItem.uuid];
        } else {
            const item = matchedItem[0];

            currentData[id].name = item.name + " Mosque";
            currentData[id].address = item.address;
            if (item.phone) {
                currentData[id].contact = item.phone;
            } else {
                delete currentData[id].contact;
            }
            if (item.desc) {
                currentData[id].remarks = item.desc;
            }
            if (item.type) {
                currentData[id].mosqueType = item.type;
            }
            item.updatedAt = moment().format();

            updatedMosques.push(currentData[id]);
        }
    };

    if (updatedMosques.length !== 0) {
        console.log("Updated Mosques (" + updatedMosques.length + "):");
        console.log(updatedMosques);
    }

    console.log("");

    if (removedMosques.length !== 0) {
        console.log("Removed Mosques (" + removedMosques.length + "):");
        console.log(removedMosques);
    }

    console.log("");

    const newMosques = [];
    for (let item of mosques) {
        const matchedItem = currentMosques.filter((currentItem) => {
            return currentItem.name === item.name + " Mosque";
        });
    
        if (matchedItem.length === 0) {
            const newItem = {
                address: item.address,
                contact: item.phone,
                createdAt: moment().format(),
                location: {},
                name: item.name + " Mosque",
                type: 'Mosque',
                updatedAt: moment().format(),
                uuid: uuid(),
                geohash: '',
                remarks: item.desc,
                mosqueType: item.type,
            };
            newMosques.push(newItem);

            newItem.location = await getLatLngFromAddress(newItem.address);
            newItem.geohash = ngeohash.encode(newItem.location.latitude, newItem.location.longitude, 10);

            currentData[newItem.uuid] = newItem;
        }
    };
    if (newMosques.length !== 0) {
        console.log("New Mosques (" + newMosques.length + "):");
        console.log(newMosques);
    }

    await browser.close();

    fs.writeFileSync('../data.json', JSON.stringify(currentData, null, 2));
};

async function setupBrowser() {
    const browser = await puppeteer.launch();
    return browser;
}

async function getMosquesFromMUIS(browser) {
    const mosquesCache = "cache/mosques.html";
    const content = await downloadPageIfNotCached(browser, 'https://www.muis.gov.sg/mosque/Our-Mosques/Mosque-Directory');
    const $ = cheerio.load(content);

    const items = [];

    $('div.left-content > table > tbody > tr').each((ind, el) => {
        const item = {
            name: $(el).find('td').eq(0).text().trim(),
            url: $(el).find('td').eq(0).find('a').attr('href'),
            address: $(el).find('td').eq(1).text().split("\n").map((val) => val.trim()).join(", ").replace(/S’pore/g, "Singapore"),
            phone: $(el).find('td').eq(2).text().trim() || null,
            type: $(el).find('td').eq(3).text().trim(),
        }

        items.push(item);
    });

    for (let item of items) {
        let mosqueDetailContent = await downloadPageIfNotCached(browser, 'https://www.muis.gov.sg' + item.url);
        const $$ = cheerio.load(mosqueDetailContent);

        const desc = $$('div.left-content p[style="text-align: justify;"]').first().text();
        if (desc) {
            item.desc = desc.trim();
        }
    }

    return items;
}

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