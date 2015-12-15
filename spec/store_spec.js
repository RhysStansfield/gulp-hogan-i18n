var stores = require('../lib/store');
var _      = require('lodash-node');

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
  }
];

function config() {
  stores.configure(storesData);
}

describe("configure", function() {
  afterEach(function() {
    stores.stores            = {};
    stores.hostAndSegmentMap = {};
    stores.segments          = [];
  });

  it("accepts an array of objects", function() {
    expect(config).not.toThrow();
  });

  it("sets passed in stores as property on the object organised by id", function() {
    config();

    expect(stores.stores.constructor).toBe(Object);
    expect(_.keys(stores.stores)).toEqual(['3', '4']);
    expect(stores.stores['3']).toEqual(storesData[0]);
  });

  it("collates all segments into an Array", function() {
    config();

    expect(stores.segments.constructor).toBe(Array);
    expect(stores.segments[0]).toEqual('fr');
  });

  it("doesnt add blank or undefined segments into the array", function() {
    config();

    expect(stores.segments.length).toBe(1);
  });

  it("creates a map of stores organised by host and segment", function() {
    config();

    expect(typeof stores.hostAndSegmentMap).toEqual('object');
    expect(_.keys(stores.hostAndSegmentMap)).toEqual(['surfdome.com', 'new.surfdome.com', 'localhost']);
    expect(stores.hostAndSegmentMap['surfdome.com']['']).toBe(3);
  });
});

describe("mapRoute", function() {
  it("returns an array", function() {
    expect(stores.mapRoute('/*').constructor).toBe(Array);
  });


  it("")
});
