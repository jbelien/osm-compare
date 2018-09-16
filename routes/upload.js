var express = require("express");
var debug = require("debug")("osm-compare:upload");

var crypto = require('crypto');
var fetch = require("node-fetch");
var fs = require("fs");
var geojsonhint = require("@mapbox/geojsonhint");
var multer = require("multer");
var path = require("path");
var proj4 = require("proj4");
var turf = require("@turf/turf");
var url = require("url");
var validurl = require("valid-url");

var router = express.Router();
var upload = multer({ dest: "uploads/" })

function processFile(req, res, file, filename, url) {
  try {
    var text = fs.readFileSync(file, "utf8");
    var geojson = JSON.parse(text);
    var errors = geojsonhint.hint(geojson);

    if (errors.length > 0) {
      throw errors;
    } else {
      var envelope = turf.envelope(geojson);
      var buffer = turf.buffer(envelope, 0.5);
      var area = turf.envelope(buffer);

      req.session.file = {
        path: file,
        name: filename
      };

      res.render("upload", {
        area: area,
        file: filename,
        geojson: geojson
      });
    }
  } catch (e) {
    res.render("upload", {
      errors: (typeof e !== "array" ? [e] : e),
      file: filename,
      url: url
    });
  }
}

router.get("/", function (req, res, next) {
  delete req.session.file;
  delete req.session.overpass;

  res.render("upload", {});
});

router.post("/", upload.single("file"), function (req, res, next) {
  if (typeof req.file !== "undefined") {
    var file = req.file.path;
    var filename = req.file.originalname || null;

    processFile(req, res, file, filename);
  } else if (typeof req.body.url !== "undefined" && validurl.isUri(req.body.url)) {
    var file = "uploads/" + crypto.randomBytes(16).toString("hex");
    var filename = path.basename(url.parse(req.body.url).pathname) || "no-name";

    debug(filename);
    debug(req.body.url);

    fetch(req.body.url).then(function (response) {
      return response.text();
    }).then(function (text) {
      fs.writeFile(file, text, function (error) {
        if (error) {
          throw error;
        }

        processFile(req, res, file, filename, req.body.url);
      });
    }).catch(function (error) {
      debug(error.message);

      res.render("upload", {
        errors: [error],
        file: filename,
        url: req.body.url
      });
    });
  } else {
    res.render("upload", {});
  }
});

module.exports = router;
