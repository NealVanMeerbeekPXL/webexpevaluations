const dotenv = require('dotenv');
const mongoose = require('mongoose');
const $console = require('Console');

dotenv.config();

const { PORT } = process.env;
const { DATABASE_CONNECTION } = process.env;
const CORS_OPTIONS = JSON.parse(process.env.CORS_OPTIONS);

const loadExpress = require('./loaders/express');
const connectMongoose = require('./loaders/database');

const app = loadExpress(CORS_OPTIONS);
let server = null;

function cleanup(event) {
  if (event.message) {
    $console.log(event.message);
  }
  $console.log((new Date()).toUTCString(), '\nBye!');
  if (server != null) {
    server.close();
  }
  mongoose.connection.close();
  process.exit();
}

connectMongoose(DATABASE_CONNECTION)
  .then(() => {
    server = app.listen(PORT, () => {
      $console.log((new Date()).toUTCString(), `\tApp listening at port ${PORT}.`);
    }).on('error', cleanup);
  })
  .catch((error) => {
    $console.error(error.message);
  });

mongoose.connection.on('disconnected', () => {
  $console.error((new Date()).toUTCString(), '\tDisconnected from database.');
});
mongoose.connection.on('connected', () => {
  $console.log((new Date()).toUTCString(), '\tConnected to database.');
});

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
