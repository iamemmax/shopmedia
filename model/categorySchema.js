const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
  types: {
    type: String,
    
  },
  
  subTypes:[],
  subCategory: {
    type: String,
    
  },
  
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("category", categorySchema);