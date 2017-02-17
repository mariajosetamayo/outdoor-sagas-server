const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

// Define our model

const userSchema = new Schema({
  email: {type: String, unique: true, lowercase: true},
  password: String
});

// On save hook, encrypt password
// Before saving a model, run this function
userSchema.pre('save', function(next){
  const user = this; // getting access to the user model- user instance of User model

  // generate a salt then run callback
  bcrypt.genSalt(10, function(err, salt){
    if (err){ return next(err); }

    // hash (encrypt) our password using the salt
    bcrypt.hash(user.password, salt, null, function(err, hash){
      if(err){ return next(err); }

      //overwrite plain text pawwrod with encrypted password
      user.password = hash;
      next();
    });
  });
});

// candidate password is the one supplied in login
userSchema.methods.comparePassword = function(candidatePassword, callback){
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
    if (err){ return callback(err);}

    callback(null, isMatch);
  });
}

//Create the model class

const User = mongoose.model('user', userSchema);

// Export the model

module.exports = User;
