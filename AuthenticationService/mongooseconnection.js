const mongoose = require("mongoose");
require("dotenv").config();
//require deze model
require("./Models/User");
//get from config file
if (process.env.TESTING !== "true") {
  mongoose.connect(process.env.AUTHENTICATIONSERVICE_DB_CONNECTION);
}
