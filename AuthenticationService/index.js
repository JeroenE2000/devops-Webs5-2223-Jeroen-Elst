/* eslint-disable eqeqeq */
/* eslint-disable no-console */
/* eslint-disable no-undef */
const {connectToRabbitMQ , consumeFromQueue} = require("./rabbitmqconnection");
require("dotenv").config();
const port = process.env.AUTHENTICATION_SERVICE_PORT || 3015;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const passportJWT = require("passport-jwt");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("./Models/User");
const db = mongoose.connection;

require("./mongooseconnection");

const ExtractJwt = passportJWT.ExtractJwt;

const jwtOptions = { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey:  process.env.JWT_SECRET };

app.use(express.json());

app.post("/login", async function(req, res) {
  const { username, password } = req.body;
  const findUser = await User.findOne({username: username});

  if (findUser != null && await bcrypt.compare(password, findUser.password)) {
    const payload = {uid: findUser.uid, username: findUser.username, role: findUser.role};
    const authToken = jwt.sign(payload, jwtOptions.secretOrKey, {expiresIn: 604800});
    return res.json({message: "ok", token: authToken});
  } else {
    res.status(401).json({message: "Username or password is incorrect"});
  }
});


app.post("/register", async function(req, res) {
  const user = await db.collection("users");
  const { username, password, email, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required."});
  }

  const findUser = await db.collection("users").findOne({ username });
    
  if (findUser) {
    return res.status(400).json({ message: "Username already exists." });
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const userCount = await db.collection("users").find().sort({uid: -1}).limit(1).toArray();
  let nextuserID = 1;
  if (userCount.length > 0) {
    // Convert usercount to a number and add 1 to get the next user ID
    nextuserID = parseInt(userCount[0].uid) + 1;
  }
  const newUser = {
    uid: nextuserID,
    username: username,
    password: hashedPassword,
    email: email,
    role: role
  };
  user.insertOne(newUser);
  return res.json({ message: "User created!" });
});

app.listen(port, async() => {
  console.log(`Authentication is listining to this port: ${  port}`);
  if (await connectToRabbitMQ() == false) {
    console.log("RabbitMQ is not connected");
  } 
  else {
    await connectToRabbitMQ();
    // dit zorgt ervoor dat de target aan een user wordt toegevoegd hij pakt de UserTargetQueue en roept daarbij de users collection aan om 
    // de targetID toe te voegen aan de user
    await consumeFromQueue("UserTargetQueue", "users", "get_user_target", async (data, dbname) => {
      const findUser = await db.collection(dbname).findOne({ uid: data.uid });
      if (findUser != null) {
        const targetIDArray = [data.targetID];
        await db.collection("users").updateOne({uid: data.uid}, {$push: {targetIDs: { $each: targetIDArray }}});
      }
    });
  }
});

