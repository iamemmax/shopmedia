const mongoose = require("mongoose");
const orderSchema = mongoose.Schema(
  {
     userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
   
   
   
   order_id:{ type: String },
    orderItems: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users",
      },
      
      itemsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adverts",
     
       
    },
   

    advert_id:{ type: String } ,
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      
      ref:"category",
  },
  sub_categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      
      ref:"sub-category",
  },
         start_date:{type:Date},
         end_date:{type:Date},
         advert_qty:{ type: String } ,
                   remark:{ type: String },
              price:{ type: Number },
              datePaid:{ type: Date , default:Date.now()},
                   
                
    }],
     
    paymentMethod: {
      type: String,
      required: true,
      // default:"card",
      enum:["card", "transfer"]
    },
   
    paymentResult: {
      id: { type: String },
      reference: { type: String },
      type: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
   
    
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
  }
 
);

module.exports = mongoose.model("Order", orderSchema);
