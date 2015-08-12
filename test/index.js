
var Test = require('segmentio-integration-tester');
var helpers = require('./helpers');
var facade = require('segmentio-facade');
var mapper = require('../lib/mapper');
var should = require('should');
var assert = require('assert');
var Calq = require('..');

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
      var json = test.fixture('track-full');
      test
        .set(settings)
        .track(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should be able to track a bare call correctly', function(done){
      var json = test.fixture('track-basic');
      test
        .set(settings)
        .track(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should return error and 200 on an invalid write key', function(done){
      test
        .set({ writeKey: 'bad-key' })
        .track(helpers.track())
        .expects({"status":"rejected","error":"The write_key \"bad-key\" did not match any known keys."})
        .expects(200)
        .error('The write_key \"bad-key\" did not match any known keys.', done);
    });
  });

  describe('.identify()', function () {
    it('should be able to identify correctly', function(done){
      var json = test.fixture('identify-basic');
      test
        .identify(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should error on invalid write key', function(done){
      var json = test.fixture('identify-basic');
      test
        .set({ writeKey: 'bad-key' })
        .identify(json.input)
        .expects({'status':'rejected','error':'The write_key "bad-key" did not match any known keys.'})
        .expects(200)
        .error('The write_key "bad-key" did not match any known keys.', done);
    });
  });

  describe('.alias()', function () {
    it('should be able to alias properly', function(done){
      var json = test.fixture('alias');
      test
        .alias(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should error on invalid write key', function(done){
      var json = test.fixture('alias');
      test
        .set({ writeKey: 'bad-key' })
        .alias(json.input)
        .expects(400)
        .error('cannot POST /transfer (400)', done);
    });
  });

  describe('.page()', function(){
    it('should be able to track all pages', function(done){
      var json = test.fixture('page-all');
      test
        .set(settings)
        .page(json.input)
        .sends(json.output)
        .expects(200, done);
    });
  
    it('should be able to track categorized pages', function(done){
      var json = test.fixture('page-categorized');
      test
        .set(settings)
        .page(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should be able to track named pages', function(done){
      var json = test.fixture('page-named');
      test
        .set(settings)
        .page(json.input)
        .sends(json.output)
        .expects(200, done);
    });
  });
  
  describe('.screen()', function(){
    it('should be able to track all screens', function(done){
      var json = test.fixture('screen-all');
      test
        .set(settings)
        .screen(json.input)
        .sends(json.output)
        .expects(200, done);
    });
  
    it('should be able to track categorized screens', function(done){
      var json = test.fixture('screen-categorized');
      test
        .set(settings)
        .screen(json.input)
        .sends(json.output)
        .expects(200, done);
    });

    it('should be able to track named screens', function(done){
      var json = test.fixture('screen-named');
      test
        .set(settings)
        .screen(json.input)
        .sends(json.output)
        .expects(200, done);
    });
  });

});
