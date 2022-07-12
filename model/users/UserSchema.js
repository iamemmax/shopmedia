const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate")
const UserSchema = new mongoose.Schema({
  user_id:{type: String},
  googleId:{type: String},
facebookId:{type: String},
  username: {
    type: String,
    required: true,
    trim: true,
  },
  firstname: {
    type: String,
    trim: true,
  },
  lastname: {
    type: String,
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
    trim: true,
  },
  password: {
    type: String,
    // required: true,
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
  email_subcriber: {
    type: String,
    default: false,
    
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
UserSchema.plugin(findOrCreate)
module.exports = mongoose.model("users", UserSchema);
