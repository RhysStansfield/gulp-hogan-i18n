'use strict';

var express = require('express');
var app     = express();
var i18n    = require('i18n');
var _       = require('lodash-node');

var supportedLocales = require('./supportedLocales');

i18n.configure({
  locales:       supportedLocales,
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

var storeCodeToLocale = {
  'uk': 'en-UK',
  'de': 'de',
  'au': 'en-AU',
  'us': 'en-US',
  'pt': 'pt',
  'fr': 'fr',
  'es': 'es',
  'ie': 'en-UK'
}

function setLocale(req, res, next) {
  req.setLocale(storeCodeToLocale[req.params.store_code] || 'en');

  next();
}

function setTemplates(req, res, next) {
  if (!req.xhr) {
    res.locals.templates = require('./build/templates/' + req.locale);
  }

  next();
}

function mapRoutes(route) {
  var storesStr = _.keys(storeCodeToLocale).join('|');
  // Determine uk|de etc from store JSON
  return ['/:store_code(' + storesStr + ')' + route, route];
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
  var html = res.locals.templates.weekdays.render({ currentDay: today });

  res.send(html);
});

app.listen(3005);
