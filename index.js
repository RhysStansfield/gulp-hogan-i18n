'use strict';

var express = require('express');
var app     = express();
var i18n    = require('i18n');

i18n.configure({
  locales:       ['en', 'de'],
  defaultLocale: 'en',
  directory:      __dirname + '/locales',
  objectNotation: true
});

var days = [
  'module.days.sunday',
  'module.days.monday',
  'module.days.tuesday',
  'module.days.wednesday',
  'module.days.thursday',
  'module.days.friday',
  'module.days.saturday'
];

function setLocale(req, res, next) {
  if (req.params.store_code === 'de') {
    req.setLocale('de');
  } else {
    req.setLocale('en');
  }

  next();
}

function setTemplates(req, res, next) {
  if (!req.xhr) {
    res.locals.templates = require('./build/templates/' + req.locale);
  }

  next();
}

function mapRoutes(route) {
  // Determine uk|de etc from store JSON
  return ['/:store_code(uk|de)' + route, route];
}

// configure middlewares
app.use(i18n.init);
app.use(mapRoutes('/*'), setLocale);
app.use(mapRoutes('/*'), setTemplates);

app.get(mapRoutes('/test'), function(req, res) {
  var html = res.locals.templates.test.render({ name: 'Derp' });

  res.send(html);
});

app.get(mapRoutes('/weekdays'), function(req, res) {
  var d = new Date();
  var today = res.__(days[d.getDay()]);
  var html = res.locals.templates.test2.render({ currentDay: today });

  res.send(html);
});

app.listen(3005);
