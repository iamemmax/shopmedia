const asyncHandler = require("express-async-handler");
const PayStack = require('paystack-node')
const environment = process.env.NODE_ENV
const userSchema = require("../../model/users/UserSchema")
const paystack = new PayStack(process.env.PAYSTACK_API, environment)
const crypto = require("crypto");




exports.listBank = asyncHandler(async(req, res) =>{
    try {
        let { body: { status, message, data } } =  await paystack.listBanks({
          currency: 'NGN'
        });
      
        if(status === false){
          throw new Error(message);
        }else{
            res.status(200).json({
                res:"ok",
                data:data
            })
        }
      }catch(ex){
        console.error(ex.message);
      }
})

exports.createCustomer = asyncHandler(async(req, res) =>{
    let {email, firstname, lastname, phone_no , fullname} = req.body
    
try{
    const newCustomer = paystack.createCustomer({
        email,
        first_name:firstname,
        last_name:lastname,
        phone:phone_no,
        fullname
      })
      
      newCustomer.then(function(response){
        return response.body
      }).then( body => {
        console.log(body.data)
        let {id, customer_code, email} = body.data
        return res.status(200).json({data:body.data})
      })  
}catch(error){
    return res.status(401).json({
        res:"ok",
        message:error.message
    })
}
})

exports.getCustomer = asyncHandler(async(req, res) =>{
    const getCustomerById = paystack.getCustomer({
        customer_id:req.params.customer_code
      })
      
      getCustomerById.then(function(response){
        return res.status(200).json({
            res:"ok",
            data:response.body
        })
        
      }).catch(function(error){
        return res.status(200).json({
            res:"failed",
            message:error.message
        })
      })
})



exports.checkOut = asyncHandler(async(req, res) =>{
    let {price} = req.body
    let {phone_no} = await userSchema.findOne({user_id:req.params.user_id})
    crypto.randomBytes(10, async (err, buffer) => {
      let token = buffer.toString("hex");
   
    const checkout = paystack.createPage({
        name:'advert name',
        description:'This is payment for advert ',
        
        amount:price, // Amount in kobo
        slug:token,
        redirect_url:'http://localhost:5000/api/payment/callback',
        custom_fields: [phone_no],
        channels:["card"]
      })
      
      checkout.then(function (response){
        return res.status(200).json({
          res:"ok",
          data:response.body
        })
      }).catch(function (error){
        return res.status(200).json({
          res:"failed",
          // message:error.message
        })
      })
      })
})

exports.customerRisk = asyncHandler(async(req, res) =>{
    let customer = req.params.customer
    
    
    const risk = paystack.setRiskActionOnCustomer({
        risk_action:'deny',
        customer
    })
    console.log(customer)
      
      risk.then(function (response){
        return res.status(200).json({
            res:"ok",
            data:response.body
        })
      }).catch(function (error){
        return res.status(200).json({
            res:"failed",
            message:error.message
        })
      })
})


exports.initializeTransaction =  asyncHandler(async(req, res) =>{
  let {amount, email, channels,phone} = req.body
  crypto.randomBytes(10, async (err, buffer) => {
    let token = buffer.toString("hex");
 
    const initialized =paystack.initializeTransaction({
      amount,
      email,
      channel:['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      subaccount:"ACCT_ynugqbt26lrfdz0",
      reference: token,
      phone,

     


    })
      
      initialized.then(function (response){
        return res.status(200).json({
            res:"ok",
            data:response.body
        })
      }).catch(function (error){
        return res.status(200).json({
            res:"failed",
            message:error.message
        })
      })
      })
})




exports.verifyTransaction = asyncHandler(async(req, res) =>{

const verify = paystack.verifyTransaction({
  reference: req.params.reference
})

verify.then(function (response){
  return res.status(200).json({
    res:"ok",
    data:response.body
})
}).catch(function (error){
  return res.status(200).json({
    res:"failed",
    message:error.message
})
})

})

exports.chargeTransaction =  asyncHandler(async(req, res) =>{
  let {card_no, cvv, expiry_year, expiry_month, email, amount, authorization_code} = req.body
  crypto.randomBytes(10, async (err, buffer) => {
    let token = buffer.toString("hex");
 
  const charge = paystack.chargeCard({
    card:{
      number: card_no, // mastercard
      cvv,
      expiry_year,  
      expiry_month,
      authorization_code:token,
      // channel: "card"
    },
    email,
    amount:amount // 156,000 Naira in kobo
  })
  charge.then(function (response){
    return res.status(200).json({
        res:"ok",
        data:response.body
    })
  }).catch(function (error){
    return res.status(200).json({
        res:"failed",
        message:error.message
    })
  })
  })
  
})
 