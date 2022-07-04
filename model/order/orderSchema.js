const mongoose = require("mongoose");
const orderSchema = mongoose.Schema(
  {
    // add a reference to the corresponding user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
   order_id:{ type: String },
    orderItems: [],
    
    paymentMethod: {
      type: String,
      required: true,
      default:"card",
      enum:["card", "transfer"]
    },
    // depends on if card or transfer method is used
    paymentResult: {
      id: { type: String },
      reference: { type: String },
      type: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
   
    // taxPrice: {
    //   type: Number, 
    //   required: true,
    //   default: 0.0,
    // },
    
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
  },
 
);

module.exports = mongoose.model("Order", orderSchema);
