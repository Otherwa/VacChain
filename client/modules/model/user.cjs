// models/User.ts
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  certifactetransaction: {
    type: [String],
  },
  password: {
    type: String,
    required: true,
  },
  priKey: {
    type: String,
    required: true,
  },
  pubKey: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
