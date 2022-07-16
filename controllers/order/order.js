const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const cartSchema = require("../../model/Business/cartSchema");
const orderSchema = require("../../model/order/orderSchema");
// const paginate = require("../../helper/pagination")
const ISODate = require("isodate");
// @desc  create a new order
// @route GET /api/orders/create
// @access PRIVATE
// const usersItem = await cartSchema.find({userId:{$eq:req.user._id}}).select("-_id -__v")

exports.createOrder = asyncHandler(async (req, res) => {
  const { paymentMethod,  orderItems, totalPrice } = req.body;

  if (!paymentMethod ||  !totalPrice) {
    return res.status(401).json({
      res: "failed",
      message: "Enter all fields",
    });
  }
  crypto.randomBytes(10, async (err, buffer) => {
    let token = buffer.toString("hex");

    const order = await new orderSchema({
      userId:req.user._id,
      order_id: token,
      // orderItems:usersItem.map(x => x),
      orderItems,
      paymentMethod,
      totalPrice,
      //price?.reduce((x, y) => x + y, 0) ,
    }).save();
    if (order) {
      await cartSchema.findByIdAndDelete(req.user._id);

      res.status(201).json({
        res: "ok",
        message: "order created successfully",
        data: order,
      });
    }
  });
});

// @desc  get an order by id
// @route GET /api/orders/:order_id
// @access PRIVATE

exports.getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await orderSchema
      .findOne({ order_id: req.params.order_id }).populate("userId ", "-_id -__v -token -password")
      .populate({
                path:"orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId orderItems.userId",

        select:"-__v -_id"
      
      })
      
    if (order) {
      res.status(201).json({
        res: "ok",
        data: order,
      });
    } else {
      return res.status(401).json({
        res: "failed",
        message: "No order found",
      });
    }
  } catch (error) {
    return res.status(401).json({
      res: "failed",
      message: error.message,
    });
  }
});

// @desc  update the order object once paid
// @route PUT /api/orders/:order_id/pay
// @access PRIVATE

exports.updateOrderToPay = asyncHandler(async (req, res) => {
  const order = await orderSchema
    .findOne({ order_id: req.params.order_id })
   
  let { id, reference } = req.body;
  console.log(order);
  try{
    if (order) {
      const updateOrder = await orderSchema
        .findOneAndUpdate(
          { order_id: req.params.order_id },
          {
            $set: {
              isPaid: true,
              paidAt: Date.now(),
              paymentResult: {
                email_address: order.userId.email,
                update_time: new Date(),
                status: "success",
                type: "card",
                id,
                reference,
              },
            },
          },
          { new: true }
        )
        // .populate("userId ", "-_id -__v -token -password")
        // .populate({
        //           path:"orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId",

        //   select:"-__v -_id"
        
        // })
      
      if (updateOrder) {
        res.status(201).json({
          res: "ok",
          data: updateOrder,
        });
      } else {
        return res.status(401).json({
          res: "failed",
          message: "something went wrong",
        });
      }
    }
  }catch(error){
    res.status(401)
  throw new Error(error.message)
  }
});

// @desc  update the order object once delivered
// @route PUT /api/orders/:order_id/pay
// @access PRIVATE/ADMIN
exports.updateOrderToDeliver = asyncHandler(async (req, res) => {
  const order = await orderSchema.findOne({ order_id: req.params.order_id });
  if (order) {
    try {
      const updateOrder = await orderSchema
        .findOneAndUpdate(
          { order_id: req.params.order_id },
          { $set: { isDelivered: true, deliveredAt: Date.now() } },
          { new: true }
        )
        .populate("userId", "-_id -__v -token -password")
        .populate({
                  path:"orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId orderItems.userId",

          select:"-__v -_id"
        
        })
        
      if (updateOrder) {
        res.status(201).json({
          res: "ok",
          data: updateOrder,
        });
      } else {
        return res.status(401).json({
          res: "failed",
          message: "unable to update order",
        });
      }
    } catch (error) {
      if (error) {
        return res.status(401).json({
          res: "failed",
          message: error.message,
        });
      }
    }
  }
});

// @desc  fetch the orders of the user logged in
// @route GET /api/orders/myorders
// @access PRIVATE
exports.getMyOrders = asyncHandler(async (req, res) => {
  try {
    const allOrders = await orderSchema
      .find({
        $and:[
          { userId: { $eq: req.user._id } }, 
          {isPaid:true}

        ]
      }
        
        
        )
      .sort({ createdAt: "-1" })
      .populate("userId", " -_id -__v -token -password")
      .populate({
        path:"orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId orderItems.userId",
        select:"-__v "
      
      })
     

     

    if (allOrders) {

      return res.status(201).json({
        res: "ok",
        total: allOrders?.length,
        data: allOrders,
      });
    } else {
     

      return res.status(401).json({
        res: "failed",
        message: "order not found",
      });
    }
  } catch (error) {
    if (error) {
      return res.status(401).json({
        res: "failed",
        message: error.message,
      });
    }
  }
});

// @desc  fetch all orders
// @route GET /api/orders
// @access PRIVATE/ADMIN
exports.getAllOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.pageNumber) || 1;
  const pageSize = 20; // total number of entries on a single page
  // const count = await orderSchema.countDocuments({});


  try{

    const allOrders = await orderSchema
    .find({isPaid:true})
    .sort({ createdAt: "-1" })
    .populate("userId", "-_id -__v -token -password")
    .populate({
              path:"orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId",

      select:"-__v -_id"
    
    })
    .select("-__v -_id")
    .limit(pageSize)
    .skip(pageSize * (page - 1))
  // paginate(odel, postedBy,  results, sort)
  if (allOrders.length > 0) {
    return res.status(201).json({
      res: "ok",
      total: allOrders?.length,
      pages: Math.ceil(allOrders?.length / pageSize),
      data: allOrders,
    });
  } else {
    return res.status(401).json({
      res: "failed",
      message: "order not found",
    });
  }
}catch(error){
  res.status(401)
  throw new Error(error.message)
}
});


// @desc  fetch all orders to deliver
// @route GET /api/orders
// @access PRIVATE/ADMIN
exports.getOrdersToDeliver = asyncHandler(async (req, res) => {
  const page = Number(req.query.pageNumber) || 1;
  const pageSize = 20; // total number of entries on a single page
  // const count = await orderSchema.countDocuments({});


  try{

    const allOrders = await orderSchema
    .find({ $and:[
      { isDelivered:false }, 
      {isPaid:true}

    ]})
    .sort({ createdAt: "-1" })
    .populate("userId", "-_id -__v -token -password")
    .populate({
              path:"orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId",

      select:"-__v -_id"
    
    })
    .select("-__v -_id")
    .limit(pageSize)
    .skip(pageSize * (page - 1))
  // paginate(odel, postedBy,  results, sort)
  if (allOrders.length > 0) {
    return res.status(201).json({
      res: "ok",
      total: allOrders?.length,
      pages: Math.ceil(allOrders?.length / pageSize),
      data: allOrders,
    });
  } else {
    return res.status(401).json({
      res: "failed",
      message: "order not found",
    });
  }
}catch(error){
  res.status(401)
  throw new Error(error.message)
}
});

// @desc  fetch all  delivered orders
// @route GET /api/orders
// @access PRIVATE/ADMIN
exports.getDeliveredOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.pageNumber) || 1;
  const pageSize = 20; // total number of entries on a single page
  // const count = await orderSchema.countDocuments({});


  try{

    const allOrders = await orderSchema
    .find({ $and:[
      { isDelivered:true }, 
      {isPaid:true}

    ]})
    .sort({ createdAt: "-1" })
    .populate("userId", "-_id -__v -token -password")
    .populate({
              path:"orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId",

      select:"-__v -_id"
    
    })
    .select("-__v -_id")
    .limit(pageSize)
    .skip(pageSize * (page - 1))
  // paginate(odel, postedBy,  results, sort)
  if (allOrders.length > 0) {
    return res.status(201).json({
      res: "ok",
      total: allOrders?.length,
      pages: Math.ceil(allOrders?.length / pageSize),
      data: allOrders,
    });
  } else {
    return res.status(401).json({
      res: "failed",
      message: "order not found",
    });
  }
}catch(error){
  res.status(401)
  throw new Error(error.message)
}
});





// @desc  fetch all orders
// @route GET /api/orders
// @access PRIVATE/ADMIN
exports.getTransfer= asyncHandler(async (req, res) => {
  const page = Number(req.query.pageNumber) || 1;
  const pageSize = 20; // total number of entries on a single page
  // const count = await orderSchema.countDocuments({});

  try{

    const allTransfer = await orderSchema
    
  .find({
    $and:[
      { paymentMethod: "transfer"}, 
      {isPaid:false}

    ]
  })
    .sort({ createdAt: "-1" })
    .populate("userId ", "-_id -__v -token -password")
    .populate({
              path:"orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId",

      select:"-__v -_id"
    
    })
   
    .limit(pageSize)
    .skip(pageSize * (page - 1))
  // paginate(odel, postedBy,  results, sort)
  if (allTransfer.length > 0) {
    return res.status(201).json({
      res: "ok",
      total: allTransfer.length,
      pages: Math.ceil(allTransfer.length / pageSize),
      data: allTransfer,
    });
  } else {
    return res.status(401).json({
      res: "failed",
      message: "order not found",
    });
  }
}catch(error){
   res.status(401)
  throw new Error(error.message)
}
});

// @desc  revenue
// @route GET /api/orders
// @access PRIVATE/ADMIN

exports.getTotalRevenue = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = 20; // total number of entries on a single page
    // const count = await orderSchema.countDocuments({});

    let revenue = await orderSchema
      .find({
        $and: {
          isPaid: true,
          createdAt: {
            $gte: ISODate(req.body.startDate),
            $lte: ISODate(req.body.endDate),
          },
        },
      })
      .populate({
                path:"orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId",

        select:"-__v -_id"
      
      })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort("-createdAt");

    if (revenue) {
      return res.status(201).json({
        res: "ok",
        total: revenue.length,
        pages: Math.ceil(revenue.length / pageSize),
        data: revenue,
      });
    } else {
      return res.status(401).json({
        res: "failed",
        message: "order not found",
      });
    }
  } catch(error){
    res.status(401)
    throw new Error(error.message)
  }
});


// @desc  fetch all orders with isPaid:false and less than 1 week
// @route GET /api/orders
// @access PRIVATE/ADMIN
exports.getUnpaidOrders = asyncHandler(async (req, res) => {
  

      
      
      try {
        const allOrders = await orderSchema.find({
        $and:[
          {isPaid:false}, 
        {createdAt:{$lte:new Date(), $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)}}
      ]})
        .sort({ createdAt: "-1" })
        .populate("userId", "-_id -__v -token -password")
        .populate({
                  path:"orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId",

          select:"-__v -_id"
        
        })
        .select("-__v -_id");

    if (allOrders) {
      return res.status(201).json({
        res: "ok",
        total: allOrders?.length,
        data: allOrders,
      });
    } else {
      console.log(allOrders)
      return res.status(401).json({
        res: "failed",
        message: "order not found",
      });
    }
  } catch (error) {
    if (error) {
      return res.status(401).json({
        res: "failed",
        message: error.message,
      });
    }
  }
});


// @desc  fetch all orders with isPaid:false
// @route GET /api/orders
// @access PRIVATE/ADMIN
exports.deleteOrders = asyncHandler(async (req, res) => {

});