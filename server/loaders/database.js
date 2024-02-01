const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

function connectMongoose(DATABASE_CONNECTION, DB_CONNECTION_OPTIONS) {
  return mongoose.connect(DATABASE_CONNECTION, DB_CONNECTION_OPTIONS);
}

module.exports = connectMongoose;
