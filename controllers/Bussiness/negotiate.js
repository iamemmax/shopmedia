const negotiateSchema = require("../../model/Business/negotiateSchema");
const asyncHandler = require("express-async-handler");



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
       
    let saveNegotiate = await new negotiateSchema({
        userId, advertId:req.params.id,  negotiate:{offer, qty, start_date, end_date, number_of_months}, 
    }).save()

    if(saveNegotiate){
      return  res.status(201).json({
            res:"ok",
            message:`offer submitted successfully`,
            data:saveNegotiate
        })
    }else{
      return res.status(401).json({
            res:"failed",
            message:`something went wrong`,
            
        })
    }

})


//@desc:list user  offer
exports.listMyOfer = asyncHandler(async(req, res)=>{
    let myOffer = await negotiateSchema.find({userId:req.params.id}).populate("userId", "advertId").select("-password, -__v")
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
