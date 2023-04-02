/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const express = require("express");
const {connectToRabbitMQ, consumeFromQueue} = require("./rabbitmqconnection");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const db = mongoose.connection;
const port = process.env.SCORE_SERVICE_PORT || 3013;

require("./mongooseconnection");

app.use(express.json());


app.listen(port, async () => {
  await connectToRabbitMQ();
    
  await consumeFromQueue("ScoreData", "", "score_data", async (data, dbname) => {
    await db.collection("scores").insertOne(data);
  });
  console.log(`Server is up on port ${  port}`);
});