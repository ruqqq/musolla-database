var geohash = require('ngeohash')

var data = require('../data.json')

var geohashes = {}
var geohashSizes = [7, 6, 5, 4, 3]

for (var uuid in data) {
  var item = data[uuid]

  var geohashobj = {}
  geohashobj[item.geohash] = item

  for (var size of geohashSizes) {
    geohashes[size] = Object.assign(geohashes[size] ? geohashes[size] : {}, {})
    geohashes[size][item.geohash.substr(0, size)] = Object.assign(geohashes[size][item.geohash.substr(0, size)] ? geohashes[size][item.geohash.substr(0, size)] : {}, geohashobj)
  }
}

var fs = require('fs')

for (var size in geohashes) {
  for (var hash in geohashes[size]) {
    fs.writeFile("../geohashed/" + hash + ".json", JSON.stringify(geohashes[size][hash], null, 2), function(err) {
        if (err) {
          return console.log(err)
        }
    })
  }
}
