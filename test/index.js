
var Test = require('segmentio-integration-tester');
var helpers = require('./helpers');
var facade = require('segmentio-facade');
var mapper = require('../lib/mapper');
var should = require('should');
var assert = require('assert');
var fmt = require('util').format;
var Calq = require('..');
var fs = require('fs');

describe('Calq', function () {
  var settings;
  var calq;
  var test;

  beforeEach(function(){
    settings = { writeKey: '0e116d3930b329831f146716c3667dfe' };
    calq = new Calq(settings);
    test = Test(calq, __dirname);
  });

  it('should have the correct settings', function(){
    test
      .name('Calq')
      .channels(['server', 'client', 'mobile'])
      .ensure('settings.writeKey');
  });

  describe('.validate()', function () {
    it('should be invalid when .writeKey is missing', function () {
      delete settings.writeKey;
      test.invalid({}, settings);
    });

    it('should be valid when settings are complete', function(){
      test.valid({}, settings);
    });
  });

  describe('mapper', function(){
    describe('track', function(){
      it('should map basic track', function(){
        test.maps('track-basic', settings);
      });

      it('should map full track', function(){
        test.maps('track-full', settings);
      });
    });

    describe('alias', function(){
      it('should map alias', function(){
        test.maps('alias', settings);
      });
    });

    describe('identify', function(){
      it('should map basic identify', function(){
        test.maps('identify-basic', settings);
      });
    });
  });

  describe('.track()', function () {
    it('should be able to track correctly', function(done){
      var json = fixture('track-full');
      test
        .set(settings)
        .track(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should be able to track a bare call correctly', function(done){
      var json = fixture('track-basic');
      test
        .set(settings)
        .track(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should error on an invalid write key', function(done){
      test
        .set({ writeKey: 'bad-key' })
        .track(helpers.track())
        .expects(403)
        .error('cannot POST /track (403)', done);
    });
  });

  describe('.identify()', function () {
    it('should be able to identify correctly', function(done){
      var json = fixture('identify-basic');
      test
        .identify(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should error on invalid write key', function(done){
      var json = fixture('identify-basic');
      test
        .set({ writeKey: 'bad-key' })
        .identify(json.input)
        .expects(403)
        .error('cannot POST /profile (403)', done);
    });
  });

  describe('.alias()', function () {
    it('should be able to alias properly', function(done){
      var json = fixture('alias');
      test
        .alias(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should error on invalid write key', function(done){
      var json = fixture('alias');
      test
        .set({ writeKey: 'bad-key' })
        .alias(json.input)
        .expects(403)
        .error('cannot POST /transfer (403)', done);
    });
  });

  describe('.page()', function(){
    it('should be able to track all pages', function(done){
      var json = fixture('page-all');
      test
        .set(settings)
        .page(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should be able to track categorized pages', function(done){
      var json = fixture('page-categorized');
      test
        .set(settings)
        .page(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should be able to track named pages', function(done){
      var json = fixture('page-named');
      test
        .set(settings)
        .page(json.input)
        .sends(json.output)
        .expects(200, done);
    });
  });

  describe('.screen()', function(){
    it('should be able to track all screens', function(done){
      var json = fixture('screen-all');
      test
        .set(settings)
        .screen(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should be able to track categorized screens', function(done){
      var json = fixture('screen-categorized');
      test
        .set(settings)
        .screen(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should be able to track named screens', function(done){
      var json = fixture('screen-named');
      test
        .set(settings)
        .screen(json.input)
        .sends(json.output)
        .expects(200, done);
    });
  });
});

/**
 * Loads a fixture and adds timestamps.
 */

function fixture(file){
  var path = fmt('%s/fixtures/%s.json', __dirname, file);
  var json = JSON.parse(fs.readFileSync(path));
  var now = new Date;
  json.input.timestamp = String(now.getFullYear());
  json.output.timestamp = fmt('%d-01-01T00:00:00.000Z', now.getFullYear());
  return json;
}
