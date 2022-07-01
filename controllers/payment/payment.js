const asyncHandler = require("express-async-handler");
const axios = require("axios")


   let config = {
    headers:{
        Authorization:`Bearer ${process.env.PAYSTACK_API}`}
};
//@desc:initializes transaction
exports.initializePayment = asyncHandler(async(req, res) =>{
    let {email, amount, currency} = req.body

    if(!email||  !amount||  !currency){
        return res.status(401).json({
            res:"failed",
            message:"all fields are required"
        })
    }
    let data = {email, amount, currency}
    
console.log(data)
    let initialPayment = await axios.post("https://api.paystack.co/transaction/initialize", data, config)

    if(initialPayment){
        return res.status(201).json({
            res:"ok",
            data:initialPayment.data.data.authorization_url
        })
    }else{
        console.log("error")
    }

})

//@desc:verify transaction


exports.verifyTransaction = asyncHandler(async(req, res) =>{
   try{
    const verify = await axios.get(`https://api.paystack.co/transaction/verify/${req.params.id}`, config)
    if(verify){
        return res.status(201).json({
            data:verify.data
        })
    }else{
        return res.status(401).json({
            message:"invalid reference id"
        })
    }
   }catch(error){
    return res.status(401).json({
        message:error.message
    })
   }
})



//@desc:list tansaction

exports.listTransaction = asyncHandler(async(req, res) =>{
    try{
     const list = await axios.get(`https://api.paystack.co/transaction`, config)
     if(list){
         return res.status(201).json({
             data:list.data
         })
     }else{
         return res.status(401).json({
             message:"invalid reference id"
         })
     }
    }catch(error){
     return res.status(401).json({
         message:error.message
     })
    }
 })


 //@desc:verify transaction


exports.fetchTransaction = asyncHandler(async(req, res) =>{
    try{
     const singleTransaction = await axios.get(`https://api.paystack.co/transaction/${req.params.id}`, config)
     if(singleTransaction){
         return res.status(201).json({
             data:singleTransaction.data
         })
     }else{
         return res.status(401).json({
             message:"invalid transaction id"
         })
     }
    }catch(error){
     return res.status(401).json({
         message:error.message
     })
    }
 })