var express = require("express");

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var path = require("path");
var session = require("express-session");
var nunjucks = require("nunjucks");

var index = require("./routes/index");
var upload = require("./routes/upload");
var overpass = require("./routes/overpass");
var compare = require("./routes/compare");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "njk");

nunjucks.configure("views", {
    autoescape: true,
    express: app,
    throwOnUndefined: true,
    watch: true
});

// session manager
var sess = {
  cookie: {},
  resave: false,
  secret: "xeceBuS=eZucuch4S8ba77SpupHe2rab",
  saveUninitialized: true
}

if (app.get("env") === "production") {
  app.set("trust proxy", 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess));

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", index);
app.use("/upload", upload);
app.use("/overpass", overpass);
app.use("/compare", compare);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
