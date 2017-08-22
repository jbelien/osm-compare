var express = require("express");
var multer = require("multer");
var fs = require("fs");
var turf = require("@turf/turf");
var proj4 = require("proj4");
var fetch = require("node-fetch");
var debug = require("debug")("osm-compare:upload");
var geojsonhint = require("@mapbox/geojsonhint");
var validurl = require("valid-url");

var router = express.Router();
var upload = multer({ dest: "uploads/" })

router.get("/", function(req, res, next) {
  delete req.session.file;
  delete req.session.overpass;

  res.render("upload", {});
});

router.post("/", upload.single("file"), function(req, res, next) {
  if (typeof req.file !== "undefined") {
    var geojson = JSON.parse(fs.readFileSync(req.file.path, "utf8"));

    var errors = geojsonhint.hint(geojson);

    if (errors.length > 0) {
      res.render("upload", {
        errors: errors,
        file: req.file.originalname || null
      });
    } else {
      var envelope = turf.envelope(geojson);
      var buffer = turf.buffer(envelope, 500, "meters", 1);
      var area = turf.envelope(buffer);

      req.session.file = {
        path: req.file.path,
        name: req.file.originalname || null
      };

      res.render("upload", {
        area: area,
        file: req.file.originalname || null,
        geojson: geojson
      });
    }
/*
    var crs = "urn:ogc:def:crs:EPSG:4326";
    var epsg = "4326";
    if (typeof geojson.crs !== "undefined") {
      if (geojson.crs.type === "name") {
        crs = geojson.crs.properties.name;
        epsg = /^(?:urn\:ogc\:def\:crs\:)?EPSG\:(.+)$/.exec(crs);
        epsg = parseInt(/([0-9]+)/.exec(epsg));
      } else if (geojson.crs.type === "EPSG") {
        epsg = geojson.crs.properties.code;
      } else {
        throw new Error("CRS defined in crs section could not be identified : " + JSON.stringify(geojson.crs));
      }

      fetch("https://epsg.io/" + epsg + ".proj4").then(function(response) {
        debug("Fetch: https://epsg.io/" + epsg + ".proj4");

        return response.text();
      }).then(function(text) {
        debug("EPSG:" + epsg + " = \"" + text + "\"");

        proj4.defs("EPSG:" + epsg, text);
      });
    }
*/
  } else if (typeof req.body.url !== "undefined" && validurl.isUri(req.body.url)) {
    fetch(req.body.url).then(function(response) {
      return response.text();
    }).then(function(text) {
      try {
        var geojson = JSON.parse(text);
        var errors = geojsonhint.hint(geojson);

        if (errors.length > 0) {
          throw new Exception(errors);
        } else {
          fs.writeFile("uploads/test.geojson", text, function(error) {
            if (error) {
              throw new Exception(error);
            }
            var envelope = turf.envelope(geojson);
            var buffer = turf.buffer(envelope, 500, "meters", 1);
            var area = turf.envelope(buffer);

            req.session.file = {
              path: "uploads/test.geojson",
              name: "test" || null
            };

            res.render("upload", {
              area: area,
              file: "test" || null,
              geojson: geojson
            });
          });
        }
      } catch (exception) {
        res.render("upload", {
          errors: [exception],
          url: req.body.url
        });
      }
    }).catch(function(error) {
      debug(error.message);
      res.render("upload", {
        errors: [error],
        url: req.body.url
      });
    });
  } else {
    res.render("upload", {});
  }
});

module.exports = router;
