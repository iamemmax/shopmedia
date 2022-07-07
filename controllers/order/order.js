const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const cartSchema = require("../../model/Business/cartSchema")
const orderSchema = require("../../model/order/orderSchema")
// const paginate = require("../../helper/pagination")
const ISODate = require("isodate")
// @desc  create a new order
// @route GET /api/orders/create
// @access PRIVATE
exports.createOrder = asyncHandler(async(req, res) =>{
    const {paymentMethod, userId, totalPrice} = req.body
    // const usersItem = await cartSchema.find({userId:{$eq:req.user._id}}).select("-_id -__v")
    
    // if(usersItem && !usersItem.length){
        
    //     return  res.status(401).json({
    //         res:"failed",
    //         message:"No order items"
    //     })
    // }
    // else{ 
    
        // let price  = usersItem?.map(x => x.price)

        if(!paymentMethod || !userId || !totalPrice){
            return  res.status(401).json({
                        res:"failed",
                        message:"Enter all fields"
                    })
        }
        crypto.randomBytes(24, async (err, buffer) => {
            let token = buffer.toString("hex");
    
        const order = await new orderSchema({
            userId,
            order_id:token, 
            // orderItems:usersItem.map(x => x),
            orderItems:[],
            paymentMethod,
            totalPrice,
            //price?.reduce((x, y) => x + y, 0) ,

        }).save()
        if(order){
            await cartSchema.findByIdAndDelete(req.user._id)

            res.status(201).json({
                res:"ok",
                message:"order created successfully",
                data:order
            })
        }
        
    })

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
        const updateOrder = await orderSchema.findOneAndUpdate({order_id:req.params.order_id}, {$set:{isPaid:true, paidAt:Date.now(), paymentResult:{email_address:order.userId.email, update_time:new Date, status:"success", type:"card", id, reference}}},{new:true}).populate("userId","-_id -__v -token -password").select("-_id -__v")
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

// @desc  update the order object once delivered
// @route PUT /api/orders/:order_id/pay
// @access PRIVATE/ADMIN
exports.updateOrderToDeliver = asyncHandler(async (req, res) => {
    const order = await orderSchema.findOne({order_id:req.params.order_id})
    if(order){
       try{
        const updateOrder = await orderSchema.findOneAndUpdate({order_id:req.params.order_id}, {$set:{isDelivered :true, deliveredAt :Date.now()}},{new:true}).populate("userId", "-_id -__v -token -password").select("-_id -__v ")
        if(updateOrder){
            res.status(201).json({
                res:"ok",
                data:updateOrder
            })
        }else{
            return  res.status(401).json({
                res:"failed",
                message:"unable to update order"
            })
        }
       }catch(error){
        if(error){
            return  res.status(401).json({
                res:"failed",
                message:error.message
            })
        }
       }
    }
})


// @desc  fetch the orders of the user logged in
// @route GET /api/orders/myorders
// @access PRIVATE
 exports.getMyOrders = asyncHandler(async (req, res) => {
	try{
        const allOrders = await orderSchema.find({userId:{$eq:req.user._id}}).sort({'createdAt':"-1"}).populate("userId", "-_id -__v -token -password").select("-__v -_id")
            
            if(allOrders){
              return  res.status(201).json({
                    res:"ok",
                    total:allOrders?.length,
                    data:allOrders
                })
            }else{
                return  res.status(401).json({
                    res:"failed",
                    message:"order not found"
                })
            }
    }catch(error){
        if(error){
            return  res.status(401).json({
                res:"failed",
                message:error.message
            })
        }
    }
	
});



// @desc  fetch all orders
// @route GET /api/orders
// @access PRIVATE/ADMIN
 exports.getAllOrders = asyncHandler(async (req, res) => {
    const page = Number(req.query.pageNumber) || 1;
  const pageSize = 20; // total number of entries on a single page
  const count = await orderSchema.countDocuments({});

    const allOrders = await orderSchema.find().sort({'createdAt':"-1"}).populate("userId", "-_id -__v -token -password").select("-__v -_id")
    .limit(pageSize)
		.skip(pageSize * (page - 1))
		.sort('-createdAt')
    // paginate(odel, postedBy,  results, sort)
    if(allOrders.length > 0){
        return  res.status(201).json({
            res:"ok",
            total: count,
            pages: Math.ceil(count / pageSize),
            data:allOrders
        })
    }else{
        return  res.status(401).json({
            res:"failed",
            message:"order not found"
        })
    }
});



// @desc  revenue
// @route GET /api/orders
// @access PRIVATE/ADMIN

exports.getTotalRevenue = asyncHandler(async (req, res) => {
    try{
        const page = Number(req.query.pageNumber) || 1;
        const pageSize = 20; // total number of entries on a single page
        const count = await orderSchema.countDocuments({});

        let revenue = await orderSchema.find({$and:{isPaid:true, createdAt:{$gte:ISODate(req.body.startDate), $lte:ISODate(req.body.endDate)}}})
        .limit(pageSize)
		.skip(pageSize * (page - 1))
		.sort('-createdAt')
    
    if(revenue){
        return  res.status(201).json({
            res:"ok",
            total: count,
            pages: Math.ceil(count / pageSize),
            data:revenue
        })
    }else{
        return  res.status(401).json({
            res:"failed",
            message:"order not found"
        })
    }
    }catch(error){
        return  res.status(401).json({
            res:"failed",
            message:error.message
        })
    }
});