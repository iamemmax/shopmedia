const mongoose = require("mongoose");

// const subCategorySchema =new mongoose.Schema({
const subCategorySchema = new mongoose.Schema({

  
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"category"
    
  },

  sub_category_id:{
type:String
  },
  
  sub_category:{
type:String,
  },
  
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("sub-category", subCategorySchema);
