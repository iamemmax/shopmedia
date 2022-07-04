const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const cartSchema = require("../../model/Business/cartSchema")
const orderSchema = require("../../model/order/orderSchema")

// @desc  create a new order
// @route GET /api/orders/create
// @access PRIVATE
exports.createOrder = asyncHandler(async(req, res) =>{
    const {paymentMethod} = req.body
    const usersItem = await cartSchema.find({userId:{$eq:req.user._id}}).select("-_id -__v")
    
    if(usersItem && !usersItem.length){
        
        return  res.status(401).json({
            res:"failed",
            message:"No order items"
        })
    }else{
    
        let price  = usersItem?.map(x => x.price)
        crypto.randomBytes(20, async (err, buffer) => {
            let token = buffer.toString("hex");
    
        const order = await new orderSchema({
            userId:req.user._id,
            order_id:token,
            orderItems:usersItem.map(x => x),
            paymentMethod:"card",
            totalPrice:price?.reduce((x, y) => x + y, 0) ,

        }).save()
        if(order){
            res.status(201).json({
                res:"ok",
                message:"order created successfully",
                data:order
            })
        }
        
    })
}
})

// @desc  get an order by id
// @route GET /api/orders/:order_id
// @access PRIVATE

exports.getOrderById =  asyncHandler(async(req, res) =>{
    try{
    const order = await orderSchema.findOne({order_id:req.params.order_id}).select("-__v -_id")
        if(order){
            res.status(201).json({
                res:"ok",
                data:order
            })
        }else{
            return  res.status(401).json({
                res:"failed",
                message:"No order found"
            })
        }

    }catch(error){
        return  res.status(401).json({
            res:"failed",
            message:error.message
        })
    }
})


// @desc  update the order object once paid
// @route PUT /api/orders/:order_id/pay
// @access PRIVATE

exports.updateOrderToPay = asyncHandler(async (req, res) => {
    const order = await orderSchema.findOne({order_id:req.params.order_id}).populate("userId")
    let {id, reference} = req.body
    console.log(order)
    if(order){
        const updateOrder = await orderSchema.findOneAndUpdate({order_id:req.params.order_id}, {$set:{isPaid:true, paidAt:Date.now(), paymentResult:{email_address:order.userId.email, update_time:new Date, status:"success", type:"card", id, reference}}},{new:true})
        if(updateOrder){
            res.status(201).json({
                res:"ok",
                data:updateOrder
            })
        }else{
            return  res.status(401).json({
                res:"failed",
                message:error.message
            })
        }
    }

})