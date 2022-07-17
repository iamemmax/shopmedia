const mongoose = require("mongoose")
const subcribeSchema = new mongoose.Schema({
    subcriber_id:{
        type:String,
        required:true,

    },
    email:{
        type:String,
        required:true,
        trim:true
    },

    

       
},{timestamps:true})

module.exports = mongoose.model("subcribers", subcribeSchema)