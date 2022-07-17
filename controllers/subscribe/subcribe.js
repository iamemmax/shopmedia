const asyncHandler = require("express-async-handler")
const validateEmail = require("../../helper/emailValidate")
const subcribeSchema = require("../../model/subscribe/subcribe")
const crypto = require("crypto")


//@desc:create email subcriber,
//@method:Post
exports.createEmailSubcriber  = asyncHandler(async(req, res) =>{
    let {email} = req.body
    if(!email){
        return res.status(401).json({
            res:"fail",
            message:"Email is required"
        })
    }
      // check if user enter valid email
  validateEmail(res, email);

 try {
     await subcribeSchema.findOne({email}).exec((err, data) =>{
         if(err)console.log(err)
         if(data){
             return res.status(401).json({
                 res:"fail",
                 message:"Email is exist"
                })
            }else{
                crypto.randomBytes(10, async (err, buffer) => {
                    let token = buffer.toString("hex");
                
                await new subcribeSchema({
                    subcriber_id:`shopmedia${token}`,
                    email
            }).save((err, result)=>{
                if(err)return console.log(err)
    
                return res.status(201).json({
                    res:"ok",
                    message:"you have successfully subcribe to our email",
                    data:result
                })
            })
     
        })
        }
      })
 } catch (error) {
    res.status(401)
    throw new Error(error.message)
 }
})

//@desc:list all email subcriber,
//@method:get

exports.listEmailSubcribers = asyncHandler(async(req, res) =>{
    try {
        const page = Number(req.query.pageNumber) || 1;
  const pageSize = 20; // total number of entries on a single page
  const count = await subcribeSchema.countDocuments({});

    let subcribe =    await subcribeSchema.find({}, {__v:0, _id:0})
           
        .sort({ createdAt: "-1" })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        if(subcribe){
            return res.status(201).json({
                res: "ok",
                total: count,
                pages: Math.ceil(count / pageSize),
                data: subcribe
              });
        }else{
            return res.status(401).json({
                res: "fail",
                message:"no email subcriber found",
                
              });
        }
    
    } catch (error) {
        res.status(401)
        throw new Error(error.message)
    }
})

//@desc:delete  email subcriber,
//@method:delete
exports.unsubcribe =  asyncHandler(async(req, res) =>{
    try {
        let {email} = req.body
        if(!email){
            return res.status(401).json({
                res:"fail",
                message:"Email is required"
            })
        }
  validateEmail(res, email);

     let remove =   await subcribeSchema.findOneAndDelete({email}).select("-__v -_id")
            if(remove){
                return res.status(201).json({
                    res: "ok",
                    message: "you have successfully unsubcribe",
                    data:remove
                  });
            }else{
                return res.status(401).json({
                    res: "ok",
                    message: "unable to unsubcribe"
                  });
            }
    
    } catch (error) {
        res.status(401)
        throw new Error(error.message)
    }

})
