const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jwt-simple');
const geocoder = require('google-geocoder');

const config = require('../config');
const Saga =  require('../models/saga');

const geo = geocoder({
  key: 'AIzaSyCdAFEd8CrcKbo7F0GI_CSnFvzAM2sqIXk'
});

exports.addSaga = function (req, res){

  const sagaAddress = req.body.landmark + ',' + req.body.state + ',' + req.body.country;
  //coordenadas a partir de la direccion.
  function sagaLocationFinder (address, callback){
    var coordinates
    geo.find(address, function (err, location){
      if(err){
        return res.status(500).json({message:err})
      }else{
        if (location[0] === undefined){
          return res.status(400).json({message:'Did not find location'})
        }else{
          //all data is available
          //console.log('this is the location', location[0].location)
          return callback (location[0].location)
        }
      }
    })
  }

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
        // console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      //console.log('this is the saga on post', saga)
      res.status(201).json(saga);
    });
  })
};

exports.userSagas = function (req, res){
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
  };
  const userId = req.user._id;
  console.log(userId)
  Saga.find({"userId":userId }, function(err, sagas){
    if(err){
      return res.status(500).json({
        message: 'Internal Server Error'
      });
    }
    //console.log('these are the sagas', sagas)
    res.status(200).json(sagas);
  });
};

exports.allSagas = function (req, res){
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
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
    console.log('this is the selected saga', saga)
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

// exports.editSaga = function (req, res){
//   const sagaAddress = req.body.landmark + ',' + req.body.state + ',' + req.body.country;
//   //coordenadas a partir de la direccion.
//   function sagaLocationFinder (address, callback){
//     var coordinates
//     geo.find(address, function (err, location){
//       if(err){
//         return res.status(500).json({message:err})
//       }else{
//         if (location[0] === undefined){
//           return res.status(400).json({message:'Did not find location'})
//         }else{
//           //all data is available
//           //console.log('this is the location', location[0].location)
//           return callback (location[0].location)
//         }
//       }
//     })
//   }
//   var sagaLocation = sagaLocationFinder(sagaAddress, function(coordinates){
//     const sagaId = {_id: req.params.id};
//     const updatedSaga = {
//       title: req.body.title,
//       _id: req.params.id,
//       people: req.body.people,
//       date: new Date(req.body.date),
//       landmark: req.body.landmark,
//       state: req.body.state,
//       country: req.body.country,
//       story: req.body.story,
//       location: coordinates,
//       userId: req.user._id
//     }
//     console.log('this is the saga we are sending to update', updatedSaga)
//       Saga.findOneAndUpdate(sagaId, updatedSaga,
//         function(err, saga){
//           console.log('this is the user id', saga.userId)
//           console.log('this is the request user id', req.user._id)
//           if(err || (saga.location === null) || (saga.userId.toString() !== req.user._id.toString())){
//             return res.status(500).json({
//               message: 'Internal server error'
//             });
//           }
//           res.status(201).json(updatedSaga)
//         });
//       })
//     };

  //testing
  // exports.editSaga = function (req, res) {
  //   console.log("THIS IS THE ID OF THE SAGA: ", req.params.id)
  //   Saga.findOne({ _id: req.params.id }, function (error, sagaFound) {
  //     console.log("THIS IS THE SAGA FOUND: ", sagaFound)
  //     console.log("THIS IS THE USER: ", req.user)
  //     console.log("THIS IS THE USER TYPEOF: ", typeof req.user._id)
  //     console.log("THIS IS THE USERID TYPEOF: ", typeof sagaFound.userId)
  //     console.log("ARE THESE SUPER EQUAL? ", sagaFound.userId === req.user._id)
  //     console.log("ARE THESE SORT OF EQUAL? ", sagaFound.userId == req.user._id)
  //     console.log("WHAT IS THE USER TOSTRING VALUE? ", req.user._id.toString())
  //     console.log("WHAT IS THE USERID TOSTRING VALUE? ", sagaFound.userId.toString())
  //     console.log("ARE THE TOSTRINGS EQUAL? ", req.user._id.toString() === sagaFound.userId.toString())
  //     if (req.user._id.toString() === sagaFound.userId.toString()) {
  //       console.log("THIS IS WHERE WE WOULD ALLOW EDITING")
  //     } else {
  //       console.log("THIS IS WHERE WE WOULD NOT ALLOW EDITING")
  //     }
  //   })
  // }
  //testing

  //testing3
  // exports.deleteSaga = function (req, res) {
  //   // console.log("THIS IS THE ID OF THE SAGA: ", req.params.id)
  //   Saga.findOne({ _id: req.params.id }, function (error, sagaFound) {
  //     // console.log("ARE THE TOSTRINGS EQUAL? ", req.user._id.toString() === sagaFound.userId.toString())
  //     if (req.user._id.toString() === sagaFound.userId.toString()) {
  //       console.log("THIS IS WHERE WE WOULD ALLOW EDITING")
  //       const sagaId = {_id: req.params.id};
  //         Saga.findOneAndRemove(sagaId,
  //           function (err, saga) {
  //             if(err || saga.userId.toString() !== req.user._id.toString()){
  //               return res.status(500).json({message: 'Internal server error'})
  //             }
  //             res.status(201).json(sagaId)
  //           });
  //     } else {
  //       console.log("THIS IS WHERE WE DO NOT ALLOW DELETING")
  //     }
  //   })
  // }
  //testing3

  //testing 2
  exports.editSaga = function (req, res) {
    // console.log("THIS IS THE ID OF THE SAGA: ", req.params.id)
    Saga.findOne({ _id: req.params.id }, function (error, sagaFound) {

      if (req.user._id.toString() === sagaFound.userId.toString()) {
        const sagaAddress = req.body.landmark + ',' + req.body.state + ',' + req.body.country;
        //coordenadas a partir de la direccion.
        function sagaLocationFinder (address, callback){
          var coordinates
          geo.find(address, function (err, location){
            if(err){
              return res.status(500).json({message:err})
            }else{
              if (location[0] === undefined){
                return res.status(400).json({message:'Did not find location'})
              }else{
                //all data is available
                //console.log('this is the location', location[0].location)
                return callback (location[0].location)
              }
            }
          })
        }
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
            userId: req.user._id
          }
          console.log('this is the saga we are sending to update', updatedSaga)
            Saga.findOneAndUpdate(sagaId, updatedSaga,
              function(err, saga){
                console.log('this is the user id', saga.userId)
                console.log('this is the request user id', req.user._id)
                if(err || (saga.location === null) || (saga.userId.toString() !== req.user._id.toString())){
                  return res.status(500).json({
                    message: 'Internal server error'
                  });
                }
                res.status(201).json(updatedSaga)
              });
            })
      } else {
        console.log("THIS IS WHERE WE WOULD NOT ALLOW EDITING")
        return res.status(500).json({
          message: 'Internal server error'
        });
      }
    })
  }

  // testing 2
