const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  
  page_id:{
    type: String,

  },
  pic: [],

  name:{
    type: String,
    required:true

  },
  category:{
    type: String,
    required:true

  },

  
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("cards", cardSchema);
