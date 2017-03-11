var mongoose = require('mongoose');
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index.js');
var Saga = require('../models/saga');
var User = require('../models/user');

var app = server.app;
var should = chai.should();
var token = '';
var sagaID = '';

chai.use(chaiHttp);
var request = require('supertest');
var server2 = request.agent('http://localhost:3090');

var runServer = function(callback) {
  mongoose.connect('mongodb://localhost/outdoor-sagas-test', function(err) {
    if (err && callback) {
      return callback(err);
    }
    app.listen(config.PORT, function() {
      if (callback) {
        callback();
      }
    });
  });
};

if (require.main === module) {
  runServer(function(err) {
    if (err) {
      console.error(err);
    }
  });
};

describe('main page', function(){

  before(function(done) {
    //Guarantees DB is connected BEFORE tests
    runServer(function() {
      User.remove(function(){console.log("db cleaned!")})
      Saga.remove(function(){
        Saga.create({title: 'The hike', people: 'Gabriel', date: '07/03/2016', landmark: 'Rocky Mountain National Park', state: 'Colorado', country: 'USA', story: 'blablablabla' },
        {title: 'Christmas skiing', people: 'Gabriel and Dana', date: '12/25/2016', landmark: 'Breckenridge', state: 'Colorado', country: 'USA', story: 'blablablabla'},
        {title: 'China', people: 'Gabriel and Igor', date: '11/23/2016', landmark: 'Getu National Park', state: 'Ziyun', country: 'China', story: 'blablablabla'}, function() {
          done();
        });
      });
    });
  });

  it('should respond with 401 status if no username and password', function(done){
    chai.request(app)
    .get('/')
    .end(function(err,res){
			res.should.have.status(401)
      done();
    });
  });
});

describe('tests for server endpoints', function(){
  it('User be able to signup', function(done){
    chai.request(app)
    .post('/signup')
    .send({ 'email': 'mariajose5@hotmail', 'password': 'maria' })
    .end(function(err,res){
      token = res.body.token
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.should.have.property('token');
      done();
    })
  });

  it('User be able to login:', function(done){
    chai.request(app)
    .post('/signin')
    .send({ 'email': 'mariajose5@hotmail', password: 'maria' })
    .end(function(err,res){
      res.should.have.status(200);
      res.should.be.json;
      should.equal(err, null);
      res.body.should.be.a('object');
      res.body.should.have.property('token');
      done();
    });
  });

  it('should list sagas from all users', function(done){
    server2
    .get('/all-sagas')
    .expect(200)
    .end(function(err, res){
      if (err) return done(err);
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      res.body.should.have.length(3);
      res.body[0].should.be.a('object');
      res.body[0].should.have.property('_id');
      res.body[0].should.have.property('title');
      res.body[0].should.have.property('people');
      res.body[0].should.have.property('date');
      res.body[0].should.have.property('landmark');
      res.body[0].should.have.property('state');
      res.body[0].should.have.property('country');
      res.body[0].should.have.property('story');
      res.body[0].title.should.be.a('string');
      res.body[0]._id.should.be.a('string');
      res.body[0].date.should.be.a('string');
      // res.body[0].title.should.equal('The hike');
      done()
    });
  });

  it('should add an item on POST', function(done) {
    server2
    .post('/add-saga')
    .set('authorization', token)
    .send({title: 'Skiing', people: 'Gabriel and Dana', date: '01/01/2017', landmark: 'Breckenridge', state: 'Colorado', country: 'USA', story: 'blablablabla'})
    .end(function(err, res){
      should.equal(err, null);
      res.should.have.status(201);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.should.have.property('title');
      res.body.should.have.property('_id');
      res.body.should.have.property('date');
      res.body.should.have.property('people');
      res.body.title.should.be.a('string');
      res.body.date.should.be.a('string');
      res.body.people.should.be.a('string');
      res.body.title.should.equal('Skiing');
      sagaID=res.body._id;

      Saga.count({}, function( err, count){
        count.should.equal(4);
      })
      Saga.findOne({title: 'Skiing'},
      function(err, sagas){
        sagas.title.should.equal('Skiing');
        done();
      });
    });
  });

  it('should list only the user sagas', function(done){
    server2
    .get('/user-sagas')
    .set('authorization', token)
    .expect(200)
    .end(function(err, res){
      if (err) return done(err);
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      res.body.should.have.length(1);
      res.body[0].should.be.a('object');
      res.body[0].should.have.property('_id');
      res.body[0].should.have.property('title');
      res.body[0].should.have.property('people');
      res.body[0].should.have.property('date');
      res.body[0].should.have.property('landmark');
      res.body[0].should.have.property('state');
      res.body[0].should.have.property('country');
      res.body[0].should.have.property('story');
      res.body[0].title.should.be.a('string');
      res.body[0]._id.should.be.a('string');
      res.body[0].date.should.be.a('string');
      res.body[0].title.should.equal('Skiing');
      done()
    });
  });

  it('should edit a saga on PUT', function(done) {
    server2
    .put('/add-saga/'+ sagaID)
    .set('authorization', token)
    .send({title: 'Shredding the slopes of Breck', people: 'Gabriel and Dana', date: '01/01/2017', landmark: 'Breckenridge', state: 'Colorado', country: 'USA', story: 'blablablabla'})
    .end(function(err, res) {
      should.equal(err, null);
      res.should.have.status(201);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.should.have.property('title');
      res.body.should.have.property('_id');
      res.body.title.should.be.a('string');
      res.body._id.should.be.a('string');
      res.body.title.should.equal('Shredding the slopes of Breck');
      Saga.count({}, function( err, count){
        count.should.equal(4);
      });
      Saga.findOne({_id: sagaID},
        function(err, sagas){
          should.not.equal(sagas, null);
          sagas.title.should.equal('Shredding the slopes of Breck');
          done();
        });
      });
    });

    it('should delete a saga on delete', function(done) {
      server2
      .delete('/delete-saga/'+ sagaID)
      .set('authorization', token)
      .end(function(err, res) {
        should.equal(err, null);
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.a('string');
        res.body._id.should.equal(sagaID);
        Saga.count({}, function( err, count){
          count.should.equal(3);
        })
        Saga.findOne({_id: sagaID},
        function(err, sagas){
          should.equal(sagas, null);
          done();
        });
      });
    });
  });
