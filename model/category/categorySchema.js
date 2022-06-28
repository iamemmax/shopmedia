const mongoose = require("mongoose");

// const subCategorySchema =new mongoose.Schema({
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    
  },
  

  subCategory: [],

  type: {
    type: String,
    
  },
  
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("category", categorySchema);
