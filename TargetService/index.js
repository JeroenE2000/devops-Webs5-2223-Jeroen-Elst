/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable eqeqeq */
const {connectToRabbitMQ, sendMessageToQueue , consumeFromQueue, sendMessageToDirectExchange, consumeFromDirectExchange} = require("./rabbitmqconnection");
const express = require("express");
const mongoose = require("mongoose");
const { opaqueTokenCheck } = require("./Middleware/roles");
const app = express();
require("dotenv").config();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()  }-${  file.originalname}`);
  }
});
const upload = multer({storage: storage});

const TargetModel = require("./Models/Target");

const bodyParser = require("body-parser");
const port = process.env.TARGET_SERVICE_PORT || 3012;

require("./mongooseconnection");
const mongooseConnection = require("./mongooseconnection");

const db = mongoose.connection;

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true}));

// make a GET request to the database to get all the targets
app.get("/targets", opaqueTokenCheck, async function(req, res) {
  let { page, perPage } = req.query;
    
  if (!page && perPage) {
    page = 1;
  } else if (page && !perPage) {
    perPage = 2;
  }
  if (!page || !perPage) {
    const targets = await db.collection("targets").find().toArray();
    return res.json({
      message: "success",
      data: targets
    });
  }
  
  page = parseInt(page);
  perPage = parseInt(perPage);
  const skip = (page - 1) * perPage;
  const targets = await db.collection("targets").find().skip(skip).limit(perPage).toArray();
    
  return res.json({
    message: "success",
    data: targets,
    page,
    perPage
  });
});


app.post("/targetWithoutImage", async function(req, res) {
  const { targetName, description, location } = req.body;
  const tid = 1234567890; // generates a 10-digit random number
  const data = {
    tid: tid,
    targetName: targetName,
    description: description,
    location: location,
  };
  const targets = await mongooseConnection.collection("targets").insertOne(data);
  return res.json({
    message: "success",
    data: targets
  });
});
  

// Route to get all targets by city
app.get("/targets/city/:city", async function(req, res) {
  const city = req.params.city;
  //check if city is filled in
  if (city == null) {
    return res.json({message: "city is not filled in"});
  }
  const target_city_filter = await TargetModel.find({ "location.placename": city });
  return res.json({message: "success", data: target_city_filter});
});

// Route to get all targets by coordinates
app.get("/targets/coordinates/:lat/:long", opaqueTokenCheck, async function(req, res) {
  const lat = req.params.lat;
  const long = req.params.long;

  //check if lat and long are villed in 
  if (lat == null || long == null) {
    return res.json({message: "lat and long are not filled in"});
  }
  const result = await TargetModel.find({"location.coordinates": [long, lat]});
  return res.json({message: "success", data: result});
});


//make a post request to the database to add a target
app.post("/targets", opaqueTokenCheck, upload.single("image"), async function(req, res, next) {
  try {
    const buffer = req.file.path;
    const tid = Math.floor(Math.random() * 9000000000) + 1000000000; // generates a 10-digit random number
    const data = {
      tid: tid,
      targetName: req.body.targetName,
      description: req.body.description,
      location: {
        coordinates: [req.body.longitude, req.body.latitude],
        placename: req.body.placename
      },
      image: {
        data: buffer,
        contentType: req.file.mimetype
      }
    };
    const userId = req.headers["user_id"]; 
    const userdata = {
      uid: userId,
      targetID: tid
    };
    const externeServiceData = {
      tid: tid,
      image: {
        data: buffer,
        contentType: req.file.mimetype
      }
    };
    await db.collection("targets").insertOne(data);

    await sendMessageToQueue("imageDataResponseQueue", JSON.stringify(externeServiceData), "image_data_response");
    await sendMessageToQueue("UserTargetQueue", JSON.stringify(userdata), "get_user_target");

    return res.json({message: "success"});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "something went wrong", data: error});
  }
});

if (process.env.TESTING !== "true") {
  app.listen(port, async() => {
    console.log(`Server is up on port ${  port}`);
    if (await connectToRabbitMQ() == false) {
      console.log("RabbitMQ is not connected");
    } 
    else {
      await connectToRabbitMQ();
    }   
  });
}

module.exports = {app};
