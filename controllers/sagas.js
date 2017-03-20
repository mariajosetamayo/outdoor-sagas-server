const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jwt-simple');
const geocoder = require('google-geocoder');
const Saga =  require('../models/saga');

const geo = geocoder({
  key: 'AIzaSyCdAFEd8CrcKbo7F0GI_CSnFvzAM2sqIXk'
});

exports.addSaga = function (req, res){

  const sagaAddress = req.body.landmark + ',' + req.body.state + ',' + req.body.country;
  // Function that generates coordinates based on landmark, state, and country entered by user.
  function sagaLocationFinder (address, callback){
    var coordinates
    geo.find(address, function (err, location){
      if(err){
        return res.status(500).json({message:err})
      }else if (location[0] === undefined){
        return res.status(400).json({message:'Did not find location'})
      }else{
        return callback (location[0].location)
      }
    });
  };

  var sagaLocation = sagaLocationFinder(sagaAddress, function(coordinates){
    Saga.create({
      title: req.body.title,
      people: req.body.people,
      date: new Date(req.body.date),
      landmark: req.body.landmark,
      state: req.body.state,
      country: req.body.country,
      location: coordinates,
      story: req.body.story,
      userId: req.user._id,
      imageName: req.body.imageName
    },
    function(err, saga){
      if (err || saga.location === null){
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(201).json(saga);
    });
  });
};

exports.userSagas = function (req, res){
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.SECRET
  };
  const userId = req.user._id;
  console.log(userId)
  Saga.find({"userId":userId }, function(err, sagas){
    if(err){
      return res.status(500).json({
        message: 'Internal Server Error'
      });
    }
    res.status(200).json(sagas);
  });
};

exports.allSagas = function (req, res){
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.SECRET
  };
  Saga.find({}, function(err, sagas){
    if(err){
      return res.status(500).json({
        message: 'Internal Server Error'
      });
    }
    res.status(200).json(sagas);
  });
};

exports.userSelectedSaga = function (req, res){
  const sagaId = {_id: req.params.id};
  Saga.findOne(sagaId, function(err, saga){
    if (err){
      return res.status(500).json({
        message: 'Internal server error'
      });
    }
    res.status(200).json(saga);
  });
};

exports.deleteSaga = function (req,res){
  const sagaId = {_id: req.params.id};
  Saga.findOneAndRemove(sagaId,
    function (err, saga) {
      if(err || saga.userId.toString() !== req.user._id.toString()){
        return res.status(500).json({message: 'Internal server error'})
      }
      res.status(201).json(sagaId)
    });
  };

exports.editSaga = function (req, res) {
  Saga.findOne({ _id: req.params.id }, function (error, sagaFound) {
    if (req.user._id.toString() === sagaFound.userId.toString()) {
      const sagaAddress = req.body.landmark + ',' + req.body.state + ',' + req.body.country;
      function sagaLocationFinder (address, callback){
        var coordinates
        geo.find(address, function (err, location){
          if(err){
            return res.status(500).json({message:err})
          }else if (location[0] === undefined){
            return res.status(400).json({message:'Did not find location'})
          }else{
            return callback (location[0].location)
          }
        });
      };
      var sagaLocation = sagaLocationFinder(sagaAddress, function(coordinates){
        const sagaId = {_id: req.params.id};
        const updatedSaga = {
          title: req.body.title,
          _id: req.params.id,
          people: req.body.people,
          date: new Date(req.body.date),
          landmark: req.body.landmark,
          state: req.body.state,
          country: req.body.country,
          story: req.body.story,
          location: coordinates,
          userId: req.user._id,
          // imageName: req.body.imageName
        }
        Saga.findOneAndUpdate(sagaId, updatedSaga,
          function(err, saga){
            if(err || (saga.location === null) || (saga.userId.toString() !== req.user._id.toString())){
              return res.status(500).json({
                message: 'Internal server error'
              });
            }
            res.status(201).json(updatedSaga)
          });
        })
      } else {
        return res.status(500).json({
          message: 'Internal server error'
        })
      }
    });
  };
