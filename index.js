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

// DB Setup

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
