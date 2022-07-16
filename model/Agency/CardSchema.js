const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  
  page_id:{
    type: String,

  },
  logo: [],

  company_name:{
    type: String,
    required:true

  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"category",
},
  email:{
    type: String,
    required:true

  },
  location:{
    type: String,
    required:true

  },
  phone:{
    type: String,
    required:true

  },

  status:{type:String, default:"active"},
  
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("media agencies", cardSchema);
