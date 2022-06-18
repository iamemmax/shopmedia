const mongoose = require("mongoose")
const businessSchema = new mongoose.schema({
    advertId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"adverts"
    },
    offer:{
        type:Number,
    },
    qty:{
        type:Number,
        default:"1"
    },
    start_date:{
        type:Date,
        default:Date.now()
    },
    end_date:{
        type:Date,
        default:Date.now()
    },
    number_of_months:{
        type:String,
    },
    remark:{
        type:String,
    },
    negotiate:{type:Boolean, default:false},
    booking:{type:Boolean, default:false}

})
module.exports = mongoose.model("business", businessSchema)