const fs = require('fs');
const moment = require('moment');
const request = require('request-promise-native');
const uuid = require('uuid4');
const ngeohash = require('ngeohash');
const utils = require('./utils');

const currentData = require('../data.json');
const currentDataKeys = Object.keys(currentData);
const currentMosques = Object.values(currentData).filter((currentItem) => currentItem.type === "Mosque");

main();

async function main() {
    const mosques = await getMosquesFromJAKIM();

    const updatedMosques = [];
    const removedMosques = [];
    for (let id of currentDataKeys) {
        const currentItem = currentData[id];
        if (currentItem.type !== "Mosque" || currentItem.address.indexOf("Malaysia ") === -1) {
            continue;
        }

        const matchedItem = mosques.filter((item) => {
            return currentItem.source_musolla_id === item.id || currentItem.location === item.location;
        });

        if (matchedItem.length === 0) {
            removedMosques.push(currentItem);
            delete currentData[currentItem.uuid];
        } else {
            const item = matchedItem[0];

            currentData[id].name = item.name;
            currentData[id].address = item.address;
            if (item.phone) {
                currentData[id].contact = item.phone;
            } else {
                delete currentData[id].contact;
            }
            if (item.desc) {
                currentData[id].remarks = item.desc;
            }
            if (item.provision) {
                currentData[id].provision = item.provision;
            }
            item.updatedAt = moment().format();

            updatedMosques.push(currentData[id]);
        }
    };

    if (updatedMosques.length !== 0) {
        console.log("Updated Mosques (" + updatedMosques.length + "):");
        // console.log(updatedMosques);
    }

    console.log("");

    if (removedMosques.length !== 0) {
        console.log("Removed Mosques (" + removedMosques.length + "):");
        // console.log(removedMosques);
    }

    console.log("");

    const newMosques = [];
    const newMosquesId = [];
    for (let item of mosques) {
        if (newMosquesId.indexOf(item.id) > -1) {
            continue;
        }

        const matchedItem = currentMosques.filter((currentItem) => {
            return currentItem.source_musolla_id === item.id || currentItem.location === item.location;
        });
    
        if (matchedItem.length === 0) {
            const newItem = {
                address: item.address,
                contact: item.phone,
                createdAt: moment().format(),
                location: item.location,
                name: item.name,
                type: 'Mosque',
                updatedAt: moment().format(),
                uuid: uuid(),
                geohash: '',
                remarks: item.desc,
                source_musolla_id: item.id,
                provision: item.provision,
            };
            newMosques.push(newItem);
            newMosquesId.push(item.id);

            newItem.geohash = ngeohash.encode(newItem.location.latitude, newItem.location.longitude, 10);

            currentData[newItem.uuid] = newItem;
        }
    };
    if (newMosques.length !== 0) {
        console.log("New Mosques (" + newMosques.length + "):");
        // console.log(newMosques);
    }

    fs.writeFileSync('../data.json', JSON.stringify(currentData, null, 2));
};

async function getMosquesFromJAKIM() {
    const response = await request({
        uri: "https://www.e-solat.gov.my/index.php",
        qs: {
            r: 'esolatApi/nearestMosque',
            lat: 2.91667,
            long: 101.7,
            // lat: 1.498652,
            // long: 103.787032,
            dist: 2500,
        },
        json: true,
    });
    console.log("Download JAKIM data.");

    const items = [];

    for (let item of response.locationData) {
        items.push({
            id: item.no_daftar,
            name: item.nama_masjid.split(",")[0].trim(),
            address: item.alamat.replace(/\n/g, "").replace(/\r/g, "").replace("KG.", "Kampung") + " " + item.poskod + ", Malaysia",
            phone: item.tel.trim() || undefined,
            directions: item.lokasi.trim() || undefined,
            location: {
                latitude: parseFloat(item.latitud),
                longitude: parseFloat(item.longitud),
            },
            provision: item.kemudahan.trim() || undefined,
            desc: item.sejarah.trim() || undefined,
        });
    }

    let addressCache = {};
    const addressCacheFile = 'cache/reverseGeocodeCache.json';
    if (fs.existsSync(addressCacheFile)) {
        addressCache = require('./' + addressCacheFile);
    }

    for (let item of items) {
        if (!addressCache[item.location.latitude + ',' + item.location.longitude]) {
            try {
                item.address = await utils.getAddressFromLatLng(item.location.latitude, item.location.longitude);
                addressCache[item.location.latitude + ',' + item.location.longitude] = item.address;
            } catch (e) {
                console.warn("Cannot reverse geocode: " + item.address + " (" + item.location.latitude + ", " + item.location.longitude + ")");
            }
        }
        item.address = addressCache[item.location.latitude + ',' + item.location.longitude];
    }

    fs.writeFileSync(addressCacheFile, JSON.stringify(addressCache, null, 2));

    return items;
}
