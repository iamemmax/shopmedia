const mongoose = require("mongoose")
const cartSchema = new mongoose.Schema({
   
   advertId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"adverts"
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
  
    booking_id:{type:String},
    cart_id:{type:String},
    advertId:{type:String},
    qty:{type:Number, default:1},
    start_date:{type:Date, default:Date.now()},
    end_date:{type:Date},
    number_of_months:{type:String},
    remark:{type:String},

    // start_date:{
    //     // type:Date,
    //     // default:Date.now()
    // },
    // end_date:{
    //     // type:Date,
        
    // },
    // number_of_months:{
    //     type:String,
    // },


    // remark:{
    //     type:String,
    // },
  
    

})
module.exports = mongoose.model("carts", cartSchema)