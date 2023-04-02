const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  tid: {
    type: Number,
    required: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
});

mongoose.model("uploadtarget", uploadSchema);

module.exports = mongoose.model("uploadtarget");
