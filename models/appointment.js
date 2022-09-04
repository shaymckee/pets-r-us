const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const passportLocalMongoose = require("passport-local-mongoose");

const AppointmentsSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  services: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Appointments", AppointmentsSchema);