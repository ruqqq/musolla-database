var fs = require('fs')
var geohash = require('ngeohash')
var GeoPoint = require('geopoint')

var data = require('../data.json')

var currentLocation = new GeoPoint(1.434466, 103.785648)
var boundingCoordinates = currentLocation.boundingCoordinates(1, true)

var hashes = geohash.bboxes(boundingCoordinates[0].latitude(), boundingCoordinates[0].longitude(), boundingCoordinates[1].latitude(), boundingCoordinates[1].longitude(), 6)

for (var hash of hashes) {
  var file = '../geohashed/' + hash + '.json'
  try {
    fs.accessSync(file, fs.F_OK)

    geohashes = require(file)
    for (var hashstring in geohashes) {
      console.log(geohashes[hashstring])
    }
  } catch (e) {
  }
}
