const mongoose = require("mongoose");

// const subCategorySchema =new mongoose.Schema({
const subCategorySchema = new mongoose.Schema({

  
  sub_category: {
    type: String,
    unique:true
    
  },
  sub_category_id:{
type:String
  },
  
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("sub-category", subCategorySchema);
