const negotiateSchema = require("../../model/Business/negotiateSchema");
const advertSchema = require("../../model/advert/advertSchema");
const cartSchema = require("../../model/Business/cartSchema");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");



//@desc:negotiate offer
exports.negotiate = asyncHandler(async(req, res)=>{
    let {offer, qty, start_date, end_date, number_of_months, userId} = req.body
    let offerExist = await negotiateSchema.find({advertId:req.params.id})
    //@desc:check if offer with the advert id exist
if(offerExist.length > 0){
  return  res.status(401).json({
        res:"failed",
        message:`offer waiting for approval`,
        
    })
}

    if(!offer || !end_date){
        res.status(401)
        throw new Error("Enter all field")
    }
    crypto.randomBytes(20, async (err, buffer) => {
        let token = buffer.toString("hex");

    let saveNegotiate = await new negotiateSchema({
        userId:req?.user._id, advertId:req.params.id,  offer_id:`offer_id_${token}`, offer, start_date, end_date,  number_of_months, 
    }).save()
    if(saveNegotiate){
        return  res.status(201).json({
            res:"ok",
            message:`offer submitted successfully`,
        })
    }else{
        return res.status(401).json({
            res:"failed",
            message:`something went wrong`,
            
        })
    }
})

})


//@desc:list user  offer
exports.listMyOfer = asyncHandler(async(req, res)=>{
    let myOffer = await negotiateSchema.find({userId:req.params.id}).populate("userId", "advertId").select("-password -_id -__v")
    if(myOffer?.length > 0){
       return res.status(201).json({
            res:"ok",
            total:myOffer.length,
            message:"success",
            data:myOffer
        })
    }else{
        res.status(401)
        throw new Error("you have no pending offer")
    }
})

//@desc:list  delete user  offer
exports.DeleteMyOfer = asyncHandler(async(req, res)=>{

    let removeOffer = await negotiateSchema.findOneAndDelete({offer_id:req.params.offer_id})
    if(removeOffer){
        return res.status(201).json({
            res:"ok",
            message:"offer deleted successfully",
            data:removeOffer
        })
    }else{
        res.status(401)
        throw new Error("unable to delete offer")
    }

})




//@desc:compare adverts sizes
exports.compareAdvertSize = asyncHandler(async(req, res)=>{
    const sizes = await advertSchema.find({size:req.params.size}).select("-__v")

    if(sizes){
        return res.status(201).json({
            res:"ok",
            total:sizes.length,
            message:"advert compared successfully",
            data:sizes
        })
    }else{
        res.status(401)
        throw new Error("advert not found")
   
    }
})

exports.acceptOffer = asyncHandler(async(req, res)=>{
    let{offer} = req.body
 const updateOffer = await negotiateSchema.findOneAndUpdate({offer_id:{$eq:req.params.offer_id}}, {$set:{status:offer}}, {new:true}).populate("userId", "-password  -__v").select("-__v")


 if(updateOffer && updateOffer.status === "approved" ){

    let {userId, end_date, number_of_months, advertId} = updateOffer
    const {_id, price} = await advertSchema.findOne({_id:advertId})

    // save offer to cartSchema if offers is approve
    crypto.randomBytes(10, async (err, buffer) => {
        let token = buffer.toString("hex");
   
 await new cartSchema({
    userId:userId._id, cart_id:token, advertId:_id, price, end_date,  number_of_months
    }).save()

    })
    await negotiateSchema.findOneAndDelete({offer_id:req.params.offer_id})

    return res.status(201).json({
        res:"ok",
        message:"offer successfully  approved",
        data:updateOffer
       
    })
 }else 
        if(updateOffer && updateOffer.status === "declined"){

            await negotiateSchema.findOneAndDelete({offer_id:req.params.offer_id})
            return res.status(201).json({
                res:"ok",
                message:"offer decline",
                data:updateOffer
            })
}else{
    return res.status(401).json({
        res:"failed",
        message:"unable to approve offer"
       
    })
}


 

})