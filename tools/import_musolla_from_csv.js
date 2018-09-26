const fs = require('fs');
const moment = require('moment');
const Papa = require('papaparse');
const uuid = require('uuid4');
const ngeohash = require('ngeohash');

function parseCSVToJSON(filename) {
    const contents = fs.readFileSync(filename, 'utf8');
    const csv = Papa.parse(contents, {
        dynamicTyping: true,
    });

    const results = [];

    for (let i = 1; i < csv.data.length; i++) {
        const addressSplit = csv.data[i][4].split("\n")[1].split(", ");
        let latLng = {
            latitude: parseFloat(addressSplit[0]),
            longitude: parseFloat(addressSplit[1]),
        };

        const data = {
            uuid: uuid(),
            name: csv.data[i][3],
            address: csv.data[i][4],
            location: latLng,
            type: "Musolla",
            geohash: ngeohash.encode(latLng.latitude, latLng.longitude, 10),
            mrt: csv.data[i][5] && csv.data[i][5].replace(/mrt/ig, "").trim(),
            directions: csv.data[i][6],
            level: csv.data[i][7] + "",
            toiletLevel: csv.data[i][8] + "",
            unisexCapacity: csv.data[i][9] === "Shared" ? csv.data[i][10] : undefined,
            maleCapacity: csv.data[i][9] !== "Shared" && csv.data[i][11] ? csv.data[i][11] : undefined,
            femaleCapacity: csv.data[i][9] !== "Shared" && csv.data[i][12] ? csv.data[i][12] : undefined,
            provision: csv.data[i][13] && csv.data[i][13].split("\n").join(", "),
            remarks: csv.data[i][14],
            createdAt: moment(),
            updatedAt: moment(),
        };

        results.push(data);
    }

    return results;
}

function mergeToJSON(filename, newData) {
    const dataString = fs.readFileSync(filename);
    const data = JSON.parse(dataString);

    for (let i = 0; i < newData.length; i++) {
        data[newData[i].uuid] = newData[i];
    }

    fs.writeFileSync(filename, JSON.stringify(data, null, 4));
}

function main() {
    const filename = process.argv[2];

    if (!fs.existsSync(filename) || !filename.endsWith(".csv")) {
        console.error("Please provide the csv filename to import.");
        return;
    }

    const parsedData = parseCSVToJSON(filename);
    mergeToJSON("../data.json", parsedData);
}

if (require.main === module) {
    main();
}

module.exports = {
    parseCSVToJSON,
    mergeToJSON,
}