const mongoose = require("mongoose")
const negotiateSchema = new mongoose.Schema({
   
   advertId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"adverts"
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    offer_id:{type:String},

    negotiate:[],
    
    offer:{
        type:Number,
    },
    qty:{
        type:Number,
        default:"1"
    },
    start_date:{
        // type:Date,
        // default:Date.now()
    },
    end_date:{
        // type:Date,
        
    },
    number_of_months:{
        type:String,
    },
    status:{
        type:String,
        default:"pending"
    }

    // remark:{
    //     type:String,
    // },
  
    // negotiate:{type:Boolean, default:false},
    // booking:{type:Boolean, default:false}

})
module.exports = mongoose.model("business", negotiateSchema)