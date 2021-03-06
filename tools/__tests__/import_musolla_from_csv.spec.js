const fs = require("fs");
const musollaImporter = require('../import_musolla_from_csv');

describe("import musolla from csv", () => {
    test("parse csv and return formatted data", async () => {
        const data = musollaImporter.parseCSVToJSON(__dirname + "/data/musolla.csv");
        
        checkWithGolden("musolla_parsed", data);
    });

    test("merge with existing data.json", () => {
        const tmpFile = __dirname + "/data/musolla_current.json";
        let data = {
            "108477df-5b76-4828-b6a3-b5d143139069": {
                "address": "535 Clementi Road S(599489)",
                "createdAt": "2014-12-23T04:46:37.662Z",
                "directions": "Block 40 (Level 6 at staircase #12-13)",
                "level": "6",
                "location": {
                  "latitude": 1.332948,
                  "longitude": 103.777515
                },
                "mrt": "Clementi",
                "name": "Ngee Ann Polytechnic, Block 40",
                "provision": "Prayer Mat, Telekung, Sarong",
                "toiletLevel": "6",
                "updatedAt": "2014-12-23T05:35:04.674Z",
                "uuid": "108477df-5b76-4828-b6a3-b5d143139069",
                "type": "Musolla",
                "geohash": "w21z9d8kzr"
              },
              "61c35d35-3e2d-4635-aaa2-c84e6770ee12": {
                "address": "3002 Commonwealth Avenue West, S(129579)",
                "contact": "6777 0028",
                "createdAt": "2014-12-23T06:50:22.514Z",
                "location": {
                  "latitude": 1.312505,
                  "longitude": 103.771061
                },
                "name": "Darussalam Mosque",
                "type": "Mosque",
                "updatedAt": "2014-12-23T06:56:11.242Z",
                "uuid": "61c35d35-3e2d-4635-aaa2-c84e6770ee12",
                "geohash": "w21z3qgvbu"
              },
              "c9ea9723-df34-4e56-b71f-26bec0e2b41a": {
                "address": "1 Coleman Street S(170803)",
                "createdAt": "2014-12-23T04:46:37.266Z",
                "directions": "Enter straircase 2 located beside unit #03-09. Enter another door (any one). Musolla is located under the staircase.",
                "level": "3",
                "location": {
                  "latitude": 1.290294,
                  "longitude": 103.850701
                },
                "mrt": "City Hall",
                "name": "Adelphi",
                "provision": "Prayer Mat, Telekung, Slippers, Carpet",
                "remarks": "Shared male and female praying area.",
                "toiletLevel": "3",
                "unisexCapacity": 6,
                "updatedAt": "2014-12-23T05:34:23.772Z",
                "uuid": "c9ea9723-df34-4e56-b71f-26bec0e2b41a",
                "type": "Musolla",
                "geohash": "w21z74vu88"
              },
        };
        fs.writeFileSync(tmpFile, JSON.stringify(data, null, 4));

        const newData = [{
            uuid: "2a6760be-8aca-49ae-9e60-0e2b14bc6e06",
            name: "Tampines Mall Musollah @ Level 3",
            address: "4 Tampines Central 5, Singapore 529510\n1.352469, 103.9427171",
            location: {
                latitude: 1.2931,
                longitude: 103.8558
            },
            type: "Musolla",
            geohash: "w21z773kze",
            mrt: "Tampines",
            directions: "Locate level 3 washroom. It will be located on the right of the walkway",
            level: "3",
            toiletLevel: "3",
            maleCapacity: 6,
            femaleCapacity: 6,
            provision: "Praying Mats, Telekung, Qiblat Indicator, Wudu' Area, Quran",
            remarks: null,
            createdAt: "2018-09-24T07:39:51.347Z",
            updatedAt: "2018-09-24T07:39:51.348Z"
        }];
        
        musollaImporter.mergeToJSON(tmpFile, newData);

        const dataString = fs.readFileSync(tmpFile)
        data = JSON.parse(dataString);

        checkWithGolden("musolla_merged", data);

        fs.unlinkSync(__dirname + "/data/musolla_current.json");
    });
});

function checkWithGolden(name, data) {
    const filename = __dirname + "/data/" + name + ".golden.json";

    if (fs.existsSync()) {
        const golden = fs.readFileSync(filename);
        if (golden) {
            const goldenJSON = JSON.parse(golden);
            const dataCopy = JSON.parse(JSON.stringify(data));

            for (let k in goldenJSON) {
                delete goldenJSON[k].uuid;
                delete goldenJSON[k].createdAt;
                delete goldenJSON[k].deletedAt;
            }

            for (let k in dataCopy.length) {
                delete dataCopy[k].uuid;
                delete dataCopy[k].createdAt;
                delete dataCopy[k].deletedAt;
            }

            if (goldenJSON != dataCopy) {
                throw new Error("data does not match golden file: " + filename);
            }
        }
    } else {
        fs.writeFileSync(filename, JSON.stringify(data, null, 4));
    }
}