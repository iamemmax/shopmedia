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
    qty:{type:Number, default:1},
    start_date:{type:Date, default:Date.now()},
    end_date:{type:Date},
    number_of_months:{type:String},
    remark:{type:String},
    price:{type:Number, default:1},

    createdAt:{
        type:Date,
        default:Date.now()
    }

})
module.exports = mongoose.model("carts", cartSchema)