const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
require("dotenv").config();

// Require these models
require("./Models/Target");

// Get the database connection URL from the config file
const dbUrl = process.env.TARGETSERVICE_DB_CONNECTION;

// Use a MongoDB Memory Server for testing
async function connectToMemoryServer() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Connect to the actual MongoDB database
async function connectToDb() {
  await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Export the mongoose connection object
if (process.env.TESTING === "true") {
  connectToMemoryServer();
} else {
  connectToDb();
}

module.exports = mongoose.connection;
