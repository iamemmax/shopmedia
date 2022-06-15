const mongoose = require("mongoose");

// const subCategorySchema =new mongoose.Schema({
const subCategorySchema = new mongoose.Schema({
  typesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"category"
    
  },
  
  subCategory: {
    type: String,
    
  },
  id:{
    type:Number
  },
  
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("sub-category", subCategorySchema);
