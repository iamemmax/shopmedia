const asyncHandler = require("express-async-handler");
const PayStack = require('paystack-node')
const environment = process.env.NODE_ENV
const userSchema = require("../../model/users/UserSchema")
const paystack = new PayStack(process.env.PAYSTACK_API, environment)
const crypto = require("crypto");
const axios = require("axios")

let config = {
   headers: {
    "Content-Type": "application/json",
    "Authorization":`Bearer ${process.env.PAYSTACK_API}`

  },
}
// @desc:initializes transaction
exports.initializePayment = asyncHandler(async(req, res) =>{
    let {email, amount, currency, phone} = req.body

    
  
    if(!email||  !amount){
        return res.status(401).json({
            res:"failed",
            message:"all fields are required"
        })
    }
    let data = {email, amount, currency, channel:["card"], phone

}
    

    let initialPayment = await axios.post("https://api.paystack.co/transaction/initialize", data, config)

    if(initialPayment){
        return res.status(201).json({
            res:"ok",
            data:initialPayment.data
        })
    }else{
        console.log("error")
    }

})


exports.chargeTransaction = asyncHandler(async(req, res) =>{
  let{email, amount, cvv, number, expiry_month, expiry_year, pin} = req.body
  let data = {
    
      email,
      amount,
      "metadata":{
        "custom_fields":[
          {
            "value":"makurdi",
            "display_name": "shop media",
            "variable_name": "shop media"
          }
        ]
      },
      "card":{
        cvv,
        number,
        expiry_month,
        expiry_year
      },
      pin
    
    
  }
  try{
        const verify = await axios.post(`https://api.paystack.co/charge`, data, config)
console.log(verify)
        if(verify){
          return res.status(201).json({
              res:"ok",
              message:"enter pin",
              data:verify.data.data
          })
      }else{
        return res.status(401).json({
          res:"failed",
      })
      }
  }catch(error){
    return res.status(401).json({
      res:"failed",
      message:error.message
  })
  }
})
exports.submitTransactionPin = asyncHandler(async(req, res) =>{
  let {pin, reference} = req.body
  if(!pin || !reference){
    return res.status(401).json({
      message:"all field are required"
  })
  }

  let data = {pin, reference}
  try{
        const submitPin = await axios.post(`https://api.paystack.co/charge/submit_pin`, data, config)
        if(submitPin){
            return res.status(201).json({
              res:"ok",
                data:submitPin.data.data
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


exports.submitTransactionPhone = asyncHandler(async(req, res) =>{
  let {phone, reference} = req.body
  if(!phone || !reference){
    return res.status(401).json({
      message:"all field are required"
  })
  }

  let data = {phone, reference}
  try{
        const submitPhone = await axios.post(`https://api.paystack.co/charge/submit_phone`, data, config)
        if(submitPhone){
            return res.status(201).json({
                data:submitPhone.data
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




exports.submitTransactionOtp = asyncHandler(async(req, res) =>{
  let {otp, reference} = req.body
  if(!otp || !reference){
    return res.status(401).json({
      message:"all field are required"
  })
  }

  let data = {otp, reference}
  try{
        const submitOtp = await axios.post(`https://api.paystack.co/charge/submit_otp`, data, config)
        if(submitOtp){
            return res.status(201).json({
                data:submitOtp.data
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



//@desc:check pending tranaction
exports.checkPendingTransaction = asyncHandler(async(req, res) =>{
  
  try{
        const pendingTranaction = await axios.get(`https://api.paystack.co/charge/${req.params.reference}`,  config)
        if(pendingTranaction){
            return res.status(201).json({
                data:pendingTranaction.data
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


exports.verifyTransaction = asyncHandler(async(req, res) =>{
   try{
    const verify = await axios.get(`https://api.paystack.co/transaction/verify/${req.params.reference}`, config)
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
             message:"something went wrong"
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

 //@desc:total transactions
exports.fetchTotalTransaction = asyncHandler(async(req, res) =>{
    try{
     const totalTransaction = await axios.get(`https://api.paystack.co/transaction/totals`, config)
     if(totalTransaction){
         return res.status(201).json({
             data:totalTransaction.data
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

 //@desc:export transactions
exports.exportTransactions = asyncHandler(async(req, res) =>{
    try{
     const exportTrans = await axios.get(`https://api.paystack.co/transaction/export`, config)
     if(exportTrans){
         return res.status(201).json({
             data:exportTrans.data
         })
     }else{
         return res.status(401).json({
             message:"unable to export transactions"
         })
     }
    }catch(error){
     return res.status(401).json({
         message:error.message
     })
    }
 })

 //@desc: transaction timeline
exports.transactionTimeline = asyncHandler(async(req, res) =>{
    try{
     const timeline = await axios.get(`https://api.paystack.co/transaction/timeline/${req.params.id_or_reference}`, config)
     if(timeline){
         return res.status(201).json({
             data:timeline.data
         })
     }else{
         return res.status(401).json({
             message:"unable to fetch transaction"
         })
     }
    }catch(error){
     return res.status(401).json({
         message:error.message
     }) 
    }
 })







//******************************************************************************** TRANSFER ***********************************************************************/
//  @tranfer
exports.listBank = asyncHandler(async(req, res) =>{
  try{
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


//@desc:transfer receipient
exports.createTransferReceipient = asyncHandler(async(req, res) =>{
  let{name, description, account_number, bank_code} = req.body
  if(!req.body){
    return res.status(401).json({
      res:"failed",
      message:"enter account no"
  })
  }
  let data = {
    
    type:"nuban",
      name,
      description,
      account_number,
      bank_code,
      currency:"NGN"
    
    
  }
  try{
        const createRec = await axios.post(`https://api.paystack.co/transferrecipient`, data, config)
        if(createRec){
          return res.status(201).json({
              res:"ok",
              message:"enter pin",
              data:createRec.data.data
          })
      }else{
        return res.status(401).json({
          res:"failed",
      })
      }
  }catch(error){
    return res.status(401).json({
      res:"failed",
      message:error.message
  })
  }
})

exports.deleteTransferReceipient = asyncHandler(async(req, res) =>{
    try{

const deleteReceipience = await axios.delete(`https://api.paystack.co/transferrecipient/${req.params.recipient_code_or_id}`, config)
     if(deleteReceipience){
         return res.status(201).json({
            res:"ok",
            message:"recipient deleted successfully",
             data:deleteReceipience.data
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
exports.listTransferReceipient = asyncHandler(async(req, res) =>{
    try{

const listReceipience = await axios.get(`https://api.paystack.co/transferrecipient`, config)
     if(listReceipience){
         return res.status(201).json({
             data:listReceipience.data
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