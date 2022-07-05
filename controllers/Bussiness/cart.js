const cartSchema = require("../../model/Business/cartSchema");
const advertSchema = require("../../model/advert/advertSchema");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");



//@desc:add to cart 
   
        
  
    exports.addTocart = asyncHandler(async(req, res)=>{
        let {start_date, remark, end_date, number_of_months, userId} = req.body
        let {cart_id, qty, advertId} = await cartSchema.findOne({userId}) ?? ""
        
        let {price} = await advertSchema.findOne({_id:req.params.id})
        //@desc:check if offer with the advert id exist
        
        if(!end_date){
            res.status(401)
            throw new Error("Enter all fields")
        }
    
    console.log(price)
    
         
        if(advertId?.toString() === req.params.id){
          let  update = await cartSchema.findOneAndUpdate({advertId:req.params.id}, {$set:{qty:qty+1, price:(qty+1)* price}}, {new:true}).select("-_id -__v").populate("userId advertId", "-_id -__v -token -password")
          if(update){
            return  res.status(201).json({
                res:"ok",
                message:`added successfully`,
                data:update
            })
        }
    
        }else{
            crypto.randomBytes(10, async (err, buffer) => {
                let token = buffer.toString("hex");
               let newItem = await new cartSchema({
                userId,  cart_id:token, advertId:req.params.id, qty, start_date, end_date,  number_of_months, remark, price
            }).save()
            
            if(newItem){
                return  res.status(201).json({
                    res:"ok",
                    message:`added successfully`,
                    data:newItem
                })
            }
          })
        }
        
    
            
            
    
    // 62b0fec80a3b3c557cc05099
    
    
    })

// 62b0fec80a3b3c557cc05099


exports.Updatecart = asyncHandler(async(req, res)=>{
    if(req.body.qty <= 0){
        return res.status(401).json({
            message:`advert quantity must not less than 1`,
            
        })
        
    }
    let {advertId} = await cartSchema.findOne({advertId:req.params.advertId}) ?? ""
    let {price} = await advertSchema.findOne({_id:req.params.advertId})


    if(advertId?.toString() === req.params.advertId){
        let  update = await cartSchema.findOneAndUpdate({advertId:req.params.advertId}, {$set:{qty:req.body.qty, price:(req.body.qty * price)}}, {new:true}).select("-_id -__v").populate("userId advertId", "-_id -__v -token -password")
        if(update){
          return  res.status(201).json({
              res:"ok",
              message:`cart updated successfully`,
              data:update
          })
      }
  
      }
})
exports.RemoveFromCart = asyncHandler(async(req, res)=>{
    

    
        let  removeCart = await cartSchema.findOneAndDelete(req.params.cart_id)
        if(removeCart){
          return  res.status(201).json({
              res:"ok",
              message:`cart deleted successfully`,
              data:removeCart
          })
      }
  
      
})


exports.listCart = asyncHandler(async(req, res)=>{
 let cart = await cartSchema.find({userId:{$eq:req.params._id}}).populate("userId advertId", "-_id -__v -token -password")
 if(cart.length > 0){
    let price  = cart?.map(x => x.price)
    return  res.status(201).json({
        res:"ok",
        total:cart.length,
        totalPrice:price?.reduce((x, y) => x + y, 0) ,
        data:cart
    })
 }else{
    return  res.status(401).json({
        res:"failed",
        message:`shopping cart empty`,
        
    })
 }

})