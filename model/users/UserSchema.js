const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  user_id:{type: String},
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  company_name: {
    type: String,

    trim: true,
  },
  phone_no: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  
  },
  roles: {
    type: String,
    default: "customers",
    enum: ["super admin", "vendors","admin", "customers"],
  },
  pic:[],
  verified: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
    
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("users", UserSchema);
