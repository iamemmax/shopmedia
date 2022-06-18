const mongoose = require("mongoose");
const slugify = require("slugify")


const advertSchema = new mongoose.Schema({


    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        enum: ["vendor", "Admin", "super Admin"]
    },

    advert_id:{
        type:String
    },
    address: {
        type: String,
        required: true

    },
    city: {
        type: String,
        required: true

    },
    state: {
        type: String,
        required: true

    },
    price: {
        type: Number,
        required: true

    },
    size: {
        type: String,
        required: true

    },

    advertImgs:[],
    qty: {
        type: Number,
        default: "1"

    },
    types: {
        type: String,
        required: true

    },
    landmark:{
        type: String,
        required: true

    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female", "all"]

    },

    subTypes: {
        type: String,
        required: true
    },

    interest: {
        type: String,
    },
    ageGroup: {
        type: String,
    },
    slug:{
        type:String,
        unique:true,
        require:true

    },

    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

advertSchema.pre("validate", function(next){
    this.slug = slugify(this.address, {
        lower:true,
        // strict:true
    })

    next()
})
module.exports = mongoose.model("adverts", advertSchema);
