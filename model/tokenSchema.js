const mongoose = require("mongoose");

//@desc: store the refresh tokens in the db
const tokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },

  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// delete the refresh tokens every 7 days
tokenSchema.index({ createdAt: 1 }, { expires: "30m" });

module.exports = mongoose.model("Token", tokenSchema);
