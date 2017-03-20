const Authentication = require('./controllers/authentication');
const Sagas = require('./controllers/sagas');
const passportService = require('./services/passport');
const passport = require('passport');
const Aws = require('./controllers/aws');
const requireAuth = passport.authenticate('jwt', { session: false }); // middleware that tells passport to use token, not cookies
const requireSignin = passport.authenticate('local', {session: false});
const multerUpload = Aws.upload.single('fileUploaded');

module.exports = function(app){
  app.get('/', requireAuth, function(req,res){
    res.send({ message: 'Super secret code is abc123', userId: req.user._id});
  });
  app.post('/signin', requireSignin, Authentication.signin);
  app.post('/signup', Authentication.signup);
  app.get('/all-sagas', Sagas.allSagas);
  app.get('/user-sagas', requireAuth, Sagas.userSagas);
  app.post('/add-saga', requireAuth, Sagas.addSaga);
  app.get('/saga/:id', Sagas.userSelectedSaga);
  app.delete('/delete-saga/:id', requireAuth, Sagas.deleteSaga);
  app.put('/add-saga/:id', requireAuth, Sagas.editSaga);
  app.post('/upload/:imageName', multerUpload, Aws.uploadImage);
}
