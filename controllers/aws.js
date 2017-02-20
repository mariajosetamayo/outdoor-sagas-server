const aws = require('aws-sdk');
// const config = require('../config');
const multer = require('multer');


// TODO: Configurar bien estas variables :)
aws.config.update({
  region: 'us-west-1',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID
});

var s3 = new aws.S3();



exports.upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 52428800}
});

exports.uploadImage = function (req, res){

  var name = req.params.imageName;
  console.log('this is the image name', name)
  //var name = req.file.originalname
// TODO. Si la imagen se llamaba react.png, la URL dela imagen en S3 va a ser:
// 'https://s3-us-west-2.amazonaws.com/outdoor-sagas3/2342342323.png'
// La variable name es la que define el nombre.
// si quieres puedes cambiar esto a q sea igual que el id del post. o algo asi.
// para q sea mas facil guardarle en la base.

// TODO: Ahorita esta retornando el nombre. En el frontend puedes cogerle y guardarle
// en el state para mandar despues como parte del formulario q agrega la nueva
// saga

  s3.putObject({
    Bucket: 'outdoor-sagas3',
    Key: name,
    Body: req.file.buffer,
    ACL: 'public-read',
  }, (err, data) => {
    if(err) return res.status(400).send(err);
    console.log('File uploaded to s3');
    res.json({ name: name});
  })
}
