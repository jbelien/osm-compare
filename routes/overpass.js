var express = require("express");

var debug = require("debug")("osm-compare:overpass");

var router = express.Router();

router.get("/", function(req, res, next) {
  var params = {};

  if (typeof req.session.overpass !== "undefined") {
    params.query = req.session.overpass.query || null
  }

  res.render("overpass", params);
});

module.exports = router;
