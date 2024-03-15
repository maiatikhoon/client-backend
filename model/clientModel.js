const mongoose = require("mongoose");

const subSchema = new mongoose.Schema({
  imageName: String,
  imageKey: String,
});

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: false },
  code: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, required: true, unique: true },
  landline_number: { type: String },
  website_link: { type: String },
  address: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String },
  pincode: { type: String, required: true },
  organisation_type: {
    type: String,
    required: true,
    enum: ["Private", "Government", "Others"],
  },

  status: Boolean,

  logo: [subSchema],

  userid: { type: String },
});

const MyClient = mongoose.model("MyClient", clientSchema);

module.exports = MyClient;
