const  mongoose  = require("mongoose");

const notifySchema = new mongoose.Schema({
    message:[]
},{timestamps:true})

module.exports = mongoose.model("admin notification", notifySchema )