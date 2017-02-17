// Main starting point of the application

const express = require('express');
const http =  require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./router');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config')

mongoose.Promise = global.Promise;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// DB Setuo

mongoose.connect(config.DATABASE_URL);

// App Setup-register middleware

app.use(morgan('combined'));
app.use(cors());


app.use(bodyParser.json())
   .use(bodyParser.urlencoded())

router(app);



// Server Setup

const port = process.env.PORT || 3090;
const server = http.createServer(app); // create http server that knows how to receive requests and forward it to app
server.listen(port);
console.log('Server listening on:', port);
