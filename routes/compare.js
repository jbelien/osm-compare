var express = require("express");
var fs = require("fs");
var fetch = require("node-fetch");
var osmtogeojson = require("osmtogeojson");
var turf = require("@turf/turf");

var debug = require("debug")("osm-compare:compare");

var router = express.Router();

router.post("/", function(req, res, next) {
  var geojson = JSON.parse(fs.readFileSync(req.session.file.path, "utf8"));
  var bbox = turf.bbox(geojson);

  var envelope = turf.envelope(geojson);
  var buffer = turf.buffer(envelope, 500, "meters", 1);
  var area = turf.envelope(buffer);

  debug(bbox);

  var overpassQuery = req.body.query;

  debug(req.body);

  //var overpassQuery = '[out:json][timeout:25];'
  //overpassQuery += '(';
  ////overpassQuery += 'node["amenity"="drinking_water"]({{bbox}});';
  //overpassQuery += 'node["amenity"="compressed_air"]({{bbox}});';
  //overpassQuery += 'way["amenity"="compressed_air"]({{bbox}});';
  //overpassQuery += 'relation["amenity"="compressed_air"]({{bbox}});';
  //overpassQuery += ');';
  //overpassQuery += 'out body;';
  //overpassQuery += '>;';
  //overpassQuery += 'out skel qt;';

  var overpass = "http://www.overpass-api.de/api/interpreter?data=" + encodeURI(overpassQuery.replace(/{{bbox}}/gi, bbox[1].toString() + "," + bbox[0].toString() + ","  + bbox[3].toString() + ","  + bbox[2].toString()));

  debug(overpass);

  fetch(overpass).then(function(response) {
    return response.text();
  }).then(function(text) {
    var osm = JSON.parse(text);

    res.render("compare", {
      file: req.session.file.name,
      geojson: geojson,
      osm: osmtogeojson(osm),
      area: area
    });
  });
});

module.exports = router;
