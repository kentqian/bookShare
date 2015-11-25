var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var app = express();
var mongoose = require('mongoose');

//connect mongodb
var db = mongoose.connect("mongodb://localhost:27017/test");

//create user schema
var Schema = mongoose.Schema;
var schema = new Schema({
    email: String,
    password: String,
    description: String,
    image: String,
    display_name: String,
    role: String,
    ip: String,
    device: String,
    location: String
})
global.Users = mongoose.model('Users', schema);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine("html", require("ejs").__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//set up express session middleware
app.use(session({
    secret: 'secret',
    cookie: {
        maxAge: 1000 * 60 * 30
    }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//log session information
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    var err = req.session.error;
    delete req.session.error;
    next();
});

//update user behavior: ip, device, location
app.use(function (req, res, next) {
    if (req.session.user) {
        Users.update({ email: req.session.user.email }, { ip: req.connection.remoteAddress, device: req.headers['user-agent'] }, function (err, doc) {
        })
        if (req.body.location) {
            Users.update({ email: req.session.user.email }, { location: req.body.location }, function (err, doc) {
            })
        }
    }
    next();
})
app.use(routes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.listen(3000);