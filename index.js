'use strict';

var express      = require('express');
var app          = express();
var i18n         = require('i18n');
var _            = require('lodash-node');
var cookieParser = require('cookie-parser');

var stores = require('./lib/store');
var storesData = [
  {
    name:                'surfdome_com',
    storeId:             3,
    defaultLocale:       'en',
    theme:               'red',
    supportedLocales:    ['en', 'fr', 'de'],
    hosts:               'surfdome.com,new.surfdome.com',
    supportedCurrencies: ['GBP', 'EUR'],
    segment:             ''
  },

  {
    name:                'surfdome_fr',
    storeId:             4,
    defaultLocale:       'fr',
    theme:               'red',
    supportedLocales:    ['en', 'fr', 'de'],
    hosts:               'localhost,surfdome.com,new.surfdome.com',
    supportedCurrencies: ['GBP', 'EUR'],
    segment:             'fr'
  },

  {
    name:                'swell_com',
    storeId:             12,
    defaultLocale:       'en-US',
    theme:               'blue',
    supportedLocales:    ['en', 'en-US', 'fr', 'de'],
    hosts:               'localhost,swell.com,new.swell.com',
    supportedCurrencies: ['GBP', 'EUR'],
    segment:             ''
  },

  {
    name:                'swell_de',
    storeId:             15,
    defaultLocale:       'de',
    theme:               'blue',
    supportedLocales:    ['en', 'fr', 'de'],
    hosts:               'swell.com,new.swell.com',
    supportedCurrencies: ['GBP', 'EUR', 'KOR'],
    segment:             'de'
  }
];

var supportedLocales = require('./supportedLocales');

i18n.configure({
  locales:       supportedLocales,
  defaultLocale: 'en',
  directory:      __dirname + '/locales',
  objectNotation: true
});

stores.configure(storesData);

var days = [
  'module.days.sunday',
  'module.days.monday',
  'module.days.tuesday',
  'module.days.wednesday',
  'module.days.thursday',
  'module.days.friday',
  'module.days.saturday'
];

function setTemplates(req, res, next) {
  if (!req.xhr) {
    res.locals.templates = require('./build/templates/' + res.locals.theme + '/' + req.locale + '/pages');
    res.locals.partials  = require('./build/templates/' + res.locals.theme + '/' + req.locale + '/partials');
  }

  next();
}

function setRenderer(req, res, next) {
  res.render = function(template, context) {
    context.segment = res.locals.currentStore.segment;
    var html = res.locals.templates[template].render(context, res.locals.partials);

    return res.send(html);
  };

  next();
}

// configure middlewares
app.use(cookieParser());
app.use(i18n.init);
app.use(stores.mapRoute('/*'), stores.init);
app.use(stores.mapRoute('/*'), setTemplates);
app.use(stores.mapRoute('/*'), setRenderer);
app.use(express.static('build'));

app.get(stores.mapRoute('/'), function(req, res) {
  res.render('index', {
    availableStores: stores.segments
  });
});

app.get(stores.mapRoute('/hello'), function(req, res) {
  res.render('hello', {
    name:  'Derp'
  });
});

app.get(stores.mapRoute('/weekdays'), function(req, res) {
  var d     = new Date();
  var today = res.__(days[d.getDay()]);

  res.render('weekdays', {
    currentDay: today
  });
});

app.listen(3005);
