'use strict';

var _ = require('lodash-node');

/**
 * Sample store JSON:
 *
 * [
 *   {
 *     name:                'surfdome_com',
 *     defaultStore:        true,
 *     storeId:             3,
 *     defaultLocale:       'en',
 *     theme:               'red',
 *     supportedLocales:    ['en', 'fr', 'de'],
 *     hosts:               'surfdome.com,new.surfdome.com',
 *     supportedCurrencies: ['GBP', 'EUR'],
 *     segment:             ''
 *   },
 *
 *   {
 *     name:                'surfdome_fr',
 *     storeId:             4,
 *     defaultLocale:       'fr',
 *     theme:               'red',
 *     supportedLocales:    ['en', 'fr', 'de'],
 *     hosts:               'surfdome.com,new.surfdome.com',
 *     supportedCurrencies: ['GBP', 'EUR'],
 *     segment:             'fr'
 *   },
 *
 *   {
 *     name:                'swell_com',
 *     storeId:             12,
 *     defaultLocale:       'en-US',
 *     theme:               'blue',
 *     supportedLocales:    ['en', 'en-US', 'fr', 'de'],
 *     hosts:               'swell.com,new.swell.com',
 *     supportedCurrencies: ['GBP', 'EUR'],
 *     segment:             ''
 *   },
 *
 *   {
 *     name:                'swell_de',
 *     storeId:             15,
 *     defaultLocale:       'de',
 *     theme:               'blue',
 *     supportedLocales:    ['en', 'fr', 'de'],
 *     hosts:               'swell.com,new.swell.com',
 *     supportedCurrencies: ['GBP', 'EUR', 'KOR'],
 *     segment:             'de'
 *   },
 * ]
 */

var storesObject = {
  /**
   *  Configuration for stores
   *
   *  @param {Array} stores - list of objects representing stores
   */
  configure: function(stores) {
    storesObject.stores            = {};
    storesObject.hostAndSegmentMap = {};
    storesObject.segments          = [];

    var hosts;

    _.each(stores, function(store) {
      storesObject.stores[store.storeId] = store;

      if (typeof store.segment !== 'undefined' && store.segment !== '') {
        storesObject.segments.push(store.segment);
      }

      hosts = store.hosts.split(',');

      _.each(hosts, function(host) {
        if (typeof storesObject.hostAndSegmentMap[host] === 'undefined') {
          storesObject.hostAndSegmentMap[host] = {};
        }

        storesObject.hostAndSegmentMap[host][store.segment] = store.storeId;
      });
    });
  },

  mapRoute: function(route) {
    var storesStr = _.uniq(storesObject.segments).join('|');

    return ['/:segment(' + storesStr + ')' + route, route];
  },

  init: function(req, res, next) {
    var currentStore;

    res.locals.currentStoreId      = storesObject.findStoreIdByHostAndSegment(req);
    res.locals.currentStore        = currentStore = storesObject.stores[res.locals.currentStoreId];
    res.locals.supportedLocales    = currentStore.supportedLocales;
    res.locals.supportedCurrencies = currentStore.supportedCurrencies;
    res.locals.currency            = storesObject.findCurrency(req, res);
    res.locals.theme               = currentStore.theme;

    req.setLocale(storesObject.findLocale(req, res));

    next();
  },

  findStoreIdByHostAndSegment: function(req) {
    var hostStores,
        host    = req.hostname,
        segment = req.params.segment || '';

    hostStores = storesObject.hostAndSegmentMap[host];

    if (typeof hostStores === 'undefined' || typeof hostStores[segment] === 'undefined') {
      return _.values(storesObject.stores)[0].storeId;
    } else {
      return hostStores[segment];
    }
  },

  findCurrency: function(req, res) {
    var selectedCurrency;
    var cookieCurrency;
    var queryCurrency   = req.query.currency;
    var defaultCurrency = res.locals.currentStore.defaultCurrency;

    if (req.cookies && req.cookies.preferences) {
      cookieCurrency = req.cookies.preferences.currency;
    }

    selectedCurrency = queryCurrency || cookieCurrency || defaultCurrency;

    if (_.include(res.locals.supportedCurrencies, selectedCurrency)) {
      return selectedCurrency;
    } else {
      return defaultCurrency;
    }
  },

  findLocale: function(req, res) {
    var selectedLocale;
    var cookieLocale;
    var defaultLocale = res.locals.currentStore.defaultLocale;

    if (req.cookies && req.cookies.preferences) {
      cookieLocale = req.cookies.preferences;
    }

    selectedLocale = cookieLocale || defaultLocale;

    if (_.include(res.locals.supportedLocales, selectedLocale)) {
      return selectedLocale;
    } else {
      return defaultLocale;
    }
  }
};

module.exports = storesObject;
