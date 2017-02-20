const User =  require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

function tokenForUser(user){
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat:timestamp }, config.secret); //sub property is subject (the user). it is a convention
}

exports.signin = function (req,res, next){
  // user has alreadt had their email and password auth'd
  // we just need to give them a token
  res.send({token: tokenForUser(req.user)})
}

exports.signup = function(req,res, next){

  console.log(req.body);
  const email =  req.body.email;
  const password = req.body.password;

  if (!email || !password){
    return res.status(422).send({error: 'You must provide email and password'})
  }

  // See if user with given email exist
  User.findOne({email: email}, function(err, existingUser){
    if(err){ return next(err);}

    // if user with email does exist, return Error
    if(existingUser){
      return res.status(422).send({error: 'Email is in use'});
    }

    // if user with email does not exist, create and save user record
    const user = new User({
      email: email,
      password: password
    });
    user.save(function(err){
      if (err){ return next(err);}
    });

    //respond to request indicating the user was created
    res.json( {token: tokenForUser(user)} );
  });
}
