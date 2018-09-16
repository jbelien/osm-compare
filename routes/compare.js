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
  var buffer = turf.buffer(envelope, 0.5);
  var area = turf.envelope(buffer);

  var overpassQuery = req.body.query;

  req.session.overpass = {
    query: req.body.query
  };

  var overpass = "http://www.overpass-api.de/api/interpreter?data=" + encodeURI(overpassQuery.replace(/{{bbox}}/gi, bbox[1].toString() + "," + bbox[0].toString() + ","  + bbox[3].toString() + ","  + bbox[2].toString()));

  fetch(overpass).then(function(response) {
    return response.text();
  }).then(function(text) {
    var osm = JSON.parse(text);
    var osmjson = osmtogeojson(osm);

    res.render("compare", {
      area: area,
      file: req.session.file.name,
      geojson: geojson,
      countLeft: geojson.features.length,
      osm: osmjson,
      countRight: osmjson.features.length,
    });
  });
});

module.exports = router;
