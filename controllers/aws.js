const aws = require('aws-sdk');
// const config = require('../config');
const multer = require('multer');

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

  s3.putObject({
    Bucket: 'outdoor-sagas3',
    Key: name,
    Body: req.file.buffer,
    ACL: 'public-read',
  }, (err, data) => {
    if(err) return res.status(400).send(err);
    res.json({ name: name});
  })
};
