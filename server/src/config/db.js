const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase() {
  if (!env.mongoUri) {
    return false;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  return true;
}

module.exports = { connectDatabase };