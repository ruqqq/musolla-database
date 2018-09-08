const fs = require('fs');
const moment = require('moment');
const request = require('request-promise-native');
const uuid = require('uuid4');
const ngeohash = require('ngeohash');

const currentData = require('../data.json');
const currentDataKeys = Object.keys(currentData);
const currentMosques = Object.values(currentData).filter((currentItem) => currentItem.type === "Mosque");

main();

async function main() {
    const mosques = await getMosquesFromJAKIM();

    // const updatedMosques = [];
    // const removedMosques = [];
    // for (let id of currentDataKeys) {
    //     const currentItem = currentData[id];
    //     if (currentItem.type !== "Mosque" || currentItem.address.indexOf("Singapore ") === -1) {
    //         continue;
    //     }

    //     const matchedItem = mosques.filter((item) => {
    //         return currentItem.name === item.name + " Mosque";
    //     });

    //     if (matchedItem.length === 0) {
    //         removedMosques.push(currentItem);
    //         delete currentData[currentItem.uuid];
    //     } else {
    //         const item = matchedItem[0];

    //         currentData[id].name = item.name + " Mosque";
    //         currentData[id].address = item.address;
    //         if (item.phone) {
    //             currentData[id].contact = item.phone;
    //         } else {
    //             delete currentData[id].contact;
    //         }
    //         if (item.desc) {
    //             currentData[id].remarks = item.desc;
    //         }
    //         if (item.type) {
    //             currentData[id].mosqueType = item.type;
    //         }
    //         item.updatedAt = moment().format();

    //         updatedMosques.push(currentData[id]);
    //     }
    // };

    // if (updatedMosques.length !== 0) {
    //     console.log("Updated Mosques (" + updatedMosques.length + "):");
    //     console.log(updatedMosques);
    // }

    // console.log("");

    // if (removedMosques.length !== 0) {
    //     console.log("Removed Mosques (" + removedMosques.length + "):");
    //     console.log(removedMosques);
    // }

    console.log("");

    const newMosques = [];
    for (let item of mosques) {
        const matchedItem = currentMosques.filter((currentItem) => {
            return currentItem.source_musolla_id === item.id;
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

            newItem.geohash = ngeohash.encode(newItem.location.latitude, newItem.location.longitude, 10);

            currentData[newItem.uuid] = newItem;
        }
    };
    if (newMosques.length !== 0) {
        console.log("New Mosques (" + newMosques.length + "):");
        console.log(newMosques);
    }

    fs.writeFileSync('../data.json', JSON.stringify(currentData, null, 2));
};

async function getMosquesFromJAKIM() {
    const response = await request({
        uri: "https://www.e-solat.gov.my/index.php",
        qs: {
            r: 'esolatApi/nearestMosque',
            // lat: 2.91667,
            // long: 101.7,
            lat: 1.498652,
            long: 103.787032,
            dist: 100,
        },
        json: true,
    });

    const items = [];

    for (let item of response.locationData) {
        items.push({
            id: item.esolat_sismim_id,
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

    return items;
}
