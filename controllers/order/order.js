const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const cartSchema = require("../../model/Business/cartSchema");
const orderSchema = require("../../model/order/orderSchema");
const moment = require('moment');


const ISODate = require("isodate");
const sendBulkEmail = require("../../helper/bulkEmail");
// @desc  create a new order
// @route GET /api/orders/create
// @access PRIVATE
// const usersItem = await cartSchema.find({userId:{$eq:req.user._id}}).select("-_id -__v")

exports.createOrder = asyncHandler(async (req, res) => {
  const { paymentMethod, orderItems, totalPrice } = req.body;

  if (!paymentMethod || !totalPrice) {
    return res.status(401).json({
      res: "failed",
      message: "Enter all fields",
    });
  }
  crypto.randomBytes(10, async (err, buffer) => {
    let token = buffer.toString("hex");

    const order = await new orderSchema({
      userId: req.user._id,
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
        path: "orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId orderItems.userId",

        select: "-__v -_id"

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
  try {
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
  } catch (error) {
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
          path: "orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId orderItems.userId",

          select: "-__v -_id"

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
        $and: [
          { userId: { $eq: req.user._id } },
          { isPaid: true }

        ]
      }


      )
      .sort({ createdAt: "-1" })
      .populate("userId", " -_id -__v -token -password")
      .populate({
        path: "orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId orderItems.userId",
        select: "-__v "

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


  try {

    const allOrders = await orderSchema
      .find({ isPaid: true })
      .sort({ createdAt: "-1" })
      .populate("userId", "-_id -__v -token -password")
      .populate({
        path: "orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId orderItems.userId",

        select: "-__v -_id"

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
  } catch (error) {
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


  try {

    const allOrders = await orderSchema
      .find({
        $and: [
          { isDelivered: false },
          { isPaid: true }

        ]
      })
      .sort({ createdAt: "-1" })
      .populate("userId", "-_id -__v -token -password")
      .populate({
        path: "orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId orderItems.userId",

        select: "-__v -_id"

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
  } catch (error) {
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


  try {

    const allOrders = await orderSchema
      .find({
        $and: [
          { isDelivered: true },
          { isPaid: true }

        ]
      })
      .sort({ createdAt: "-1" })
      .populate("userId", "-_id -__v -token -password")
      .populate({
        path: "orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId orderItems.userId",

        select: "-__v -_id"

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
  } catch (error) {
    res.status(401)
    throw new Error(error.message)
  }
});





// @desc  fetch all orders
// @route GET /api/orders
// @access PRIVATE/ADMIN
exports.getTransfer = asyncHandler(async (req, res) => {
  const page = Number(req.query.pageNumber) || 1;
  const pageSize = 20; // total number of entries on a single page
  // const count = await orderSchema.countDocuments({});

  try {

   
    const allTransfer = await orderSchema

      .find({
        $and: [
          { paymentMethod: "transfer" },
          { isPaid: false }

        ]
      })
      .sort({ createdAt: "-1" })
      .populate("userId ", "-_id -__v -token -password")
      .populate({
        path: "orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId orderItems.userId",

        select: "-__v -_id"

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
  } catch (error) {
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
        path: "orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId orderItems.userId",

        select: "-__v -_id"

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
  } catch (error) {
    res.status(401)
    throw new Error(error.message)
  }
});


// @desc  fetch all orders with isPaid:false and less than 1 week
// @route GET /api/orders
// @access PRIVATE/ADMIN
exports.getUnpaidOrders = asyncHandler(async (req, res) => {
  const today = moment().startOf('day')
 

  try {
    const allOrders = await orderSchema.find({ $and: [
      { isPaid: false },
      { createdAt:{$lte:new Date(), $gte: new Date(new Date().getTime() - 7*24*60*60*1000)}}
  ]}) 
      .sort({ createdAt: "-1" })
      .populate("userId", "-_id -__v -token -password")
      .populate({
        path: "orderItems.itemsId orderItems.categoryId orderItems.sub_categoryId orderItems.userId",

        select: "-__v -_id"

      })
      .select("-__v -_id");

    if (allOrders) {
   allOrders.map(x => {
  
     sendBulkEmail(x.userId.email,
      "Reminder for shopmedia pending orders",
          
          ` 
          <!doctype html>
          <html lang="en">
          
          <head>
              <!-- Required meta tags -->
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
          
              <!-- Bootstrap CSS -->
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
                  integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymous">
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500&display=swap"
                  rel="stylesheet">
          
          
              <title>ShopMedia - Email</title>
          
          
              <style>
                  a:focus {
                      outline: 0 solid
                  }
          
                  img {
                      max-width: 100%;
                      height: auto;
                  }
          
                  h1,
                  h2,
                  h3,
                  h4,
                  h5,
                  h6 {
                      margin: 0 0 15px;
                      color: #1B1B21;
                  }
          
          
                  body {
                      color: #1E1F20;
                      font-weight: 400;
                      font-family: 'DM Sans', sans-serif;
                      max-width: 599px;
                      margin: 0 auto;
                  }
          
          
                  .selector-for-some-widget {
                      box-sizing: content-box;
                  }
          
                  a:hover {
                      text-decoration: none
                  }
          
                  /*--------------- Header area start ----------------*/
.header {
    background: #000;
    padding: 10px 10px;
    height: 55px; 
}

.header img {
  max-width: 190px !important;
    display: block !important;
    margin: 0 auto !important;
    margin-top: 12px !important;
}

                  /*--------------- Header area end ----------------*/
          
          
          
                  /*--------------- Mail area start ----------------*/
                  .mail-area {
                      padding-top: 50px;
                      padding-bottom: 50px;
                      background: #fff;
                  }
          
                  .mail-wrapper {
                      padding: 0 30px;
                  }
          
                  .mail-wrapper h3 {
                      font-weight: 700;
                      font-size: 30px;
                      line-height: 39px;
                      text-align: center;
                      letter-spacing: -0.02em;
                      color: #000000;
                      margin-bottom: 0;
                  }
          
                  .mail-wrapper h3 a { 
                      color: #EBAA24;
                      text-decoration: none;
                      display: inline-block;
                  }
          
                  .email-thumb {
                      max-width: 388px;
                      margin: 0 auto;
                      margin-bottom: 30px;
                  }
          
                  .mail-wrapper p {
                      font-size: 15px;
                      margin-bottom: 23px;
                  }
          
                  .mail-wrapper li {
                      font-size: 15px;
                      margin-bottom: 17px;
                  }
          
                  .mail-btn a {
                      font-weight: 500;
                      font-size: 13px;
                      line-height: 17px;
                      letter-spacing: -0.02em;
                      color: #000000;
                      display: inline-block;
                      text-decoration: none;
                      background: #EBAA24;
                      border-radius: 5px;
                      padding: 10px 30px;
                  }
          
                  .mail-btn {
                      padding-top: 5px;
                  }
          
                  /*--------------- Mail area end ----------------*/
          
          
                  /*--------------- Footer area start ----------------*/
                  .footer p {
                      font-weight: 500;
                      font-size: 9px;
                      line-height: 12px;
                      text-align: center;
                      letter-spacing: -0.0em;
                      color: #FFFFFF;
                      margin-bottom: 5px;
                  }
          
                  .footer {
                      text-align: center;
                      padding: 18px 30px;
                      background: #000000;
                      color: #fff;
                  }
          
                  .footer p b {
                      font-weight: 700;
                      font-size: 10px;
                      line-height: 1.2;
                      padding-top: 8px;
                      display: block;
                  }
          
                  .footer-social a {
                      display: inline-block;
                      max-width: 20px;
                      margin: 0 5px;
                  }
          
                  .footer-social {
                      padding-bottom: 24px;
                  }
          
                  .footer p a {
                      color: #EBAA24;
                      text-decoration: none;
                  }
          
                  /*--------------- Footer area end ----------------*/
          
          
          
                  /*--------------- Responsive area start ----------------*/
                  @media screen and (max-width: 575px) {
                      .mail-wrapper {
                          padding: 0 10px;
                      }
          
                      .mail-wrapper h3 {
                          font-size: 25px;
                          line-height: 29px;
                      }
          
          
                  }
          
                  /*--------------- Responsive area end ----------------*/
              </style>
          
          
          
          
          
          
          
          
          </head>
          
          <body style="max-width: 590px; margin: 0 auto">
          
           
              

  <!--------- Header area start --------->
  <header class="header" style="text-align: center">
<div class="header-logo" style="text-align: center">
     <img src="https://mail.shopmedia.ng/images/png/rsz_12shopmedia_logo_yellow.png" alt=""> 
</div>
  </header>
  <!--------- Header area end --------->
          
          
          
              <!--------- Main area start --------->
              <main class="main">
          
          
                  <!--------- Mail area start --------->
                  <section class="mail-area">
                      <div class="container">
                          <div class="mail-wrapper">
                              <h3>Welcome to <a href=""><strong>ShopMedia.ng</a></h3>
                              <div class="email-thumb">
                                  <img src="https://tomal.dev/shopMedia/images/email-thumb.png" alt="">
                              </div>
                              <p>Hi ${x.userId.username},</p>
                              <p>you have a pending orders of ${x.orderItems.map(p => p.itemsId.address)} and the  total price is ${x.totalPrice}, pls pay before 1week, to avoid automatic removals of all your orders </p>
                              
          
                                 
          
                              <div class="mail-btn text-center"  style="text-align: center">
                                   <a href="https://shopmedia.ng">Get Started</a>
                              </div>
                          </div>
                      </div>
                  </section>
                  <!--------- Mail area end --------->
          
          
          
              </main>
              <!--------- Main area end --------->
          
          
          
          
              <!--------- Footer area start --------->
              <footer class="footer">
                  <div class="container">
                      <div class="footer-social flex-center">
                          <a href=""><img src="https://mail.shopmedia.ng/social-icon/facebook.png" alt=""></a>
                          <a href=""><img src="https://mail.shopmedia.ng/social-icon/instagram.png" alt=""></a>
                          <a href=""><img src="https://mail.shopmedia.ng/social-icon/instagram.png" alt=""></a>
                      </div>
                      <p><i>Copyright 2022 Shopmedia , Allright reserved.</i></p>
                      <p class="sm">You are receiving this email because you opted in via our website.</p>
                      <p><b>Our mailling address is</b></p>
                      <p>Shopmedia Limited</p>
                      <p>Plot 856, Oluawotesu Street</p>
            <p>Jabi, Abuja</p>
            <p>Nigeria</p>
                      <br>
                      <p>You can <a href="">unsubscribe</a> from this email or change your email notifications.</p>
                  </div>
              </footer>
              <!--------- Footer area end --------->
          
          
          
          
          
          
          
              <script src="assets/js/jquery.min.js"></script>
              <script src="assets/js/popper.js"></script>
              <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js"
                  integrity="sha384-pprn3073KE6tl6bjs2QrFaJGz5/SUsLqktiwsUTF55Jfv3qYSDhgCecCxMW52nD2"
                  crossorigin="anonymous"></script>
          
          </body>
          
          </html>`,
          x.userId.username,
          x.userId.user_id
)
        })
       
        await orderSchema.deleteMany({createdAt:{$lte:new Date(Date.now() -  7*24*60*60*1000).toISOString()}}, {isPaid:false})
      
          return res.status(201).json({
            res: "ok",
            total: allOrders?.length,
            data: allOrders,
          });
        } else {
    
      return res.status(401).json({
        res: "failed",
        message: "No order found",
      });
    }
  } catch (error) {
    if (error) {
      res.status(401)
      throw new Error(error.message)
    }
  }
});


// @desc  fetch all orders with isPaid:false
// @route GET /api/orders
// @access PRIVATE/ADMIN
exports.deleteOrders = asyncHandler(async (req, res) => {

});