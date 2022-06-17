const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const crypto = require("crypto");
const cloudinary = require("../../config/cloudinary");
const cardSchema = require("../../model/Ratecard/CardSchema");
const compressImg = require("../../helper/sharp");

//@desc: add advert pages
//@access: private
//@method: post
//@route: /api/adpage/create
exports.AddPages = asyncHandler(async (req, res) => {
  let {name, category } = req.body;
  let fileArray = [];
 
  if(!name || !category) {
    res.status(401);
    throw new Error("all field are require");
  }
  if (!req.file) {
    res.status(401);
    throw new Error("choose a photo");
  }
  //@desc : check if name exist
  let pageExist = await cardSchema.findOne({ name });
  if (pageExist) {
    res.status(401);
    throw new Error("name already exist");
  } else {
    compressImg(req, 200, 200)

    const uploadImg = await cloudinary.uploader.upload(req.file.path, {
      eager: [{ width: 200, height: 200 }],
    });

    let pageImg = {
      img_id: uploadImg.public_id,
      img: uploadImg.eager[0].secure_url,
    };
    fileArray.push(pageImg);
  }

 try {
  crypto.randomBytes(8, async (err, buffer) => {
    let id = buffer.toString("hex");
 
 let cretePage = await new cardSchema({
  page_id:`adpage_${id}`,  
  name,
  category,
    pic: fileArray,
  }).save()
  
 
    if(!cretePage){
      return res.status(401).json({
        message:"something went wrong"
      })
    }else{
      res.status(200).json({
        res:"ok",
        message:"pages created successfully",
        data:cretePage
      })

    }

  })

 } catch (error) {
  if(error){
    return res.status(401).json({
      message:error.message
    })
 }
}

});

//@desc: list advert pages
//@access: private
//@method: get
//@route: /api/adpage
exports.listPages = asyncHandler(async(req, res) =>{
  try {
    let getPages = await cardSchema.find({}, {_id:0, __v:0})
  if(getPages){
    res.status(201).json({
      res:"ok",
      total:getPages.length,
      message:"success",
      data:getPages
    })
  }
  } catch (error) {

    res.status(401).json({
      message:error.message
    })
  }
})


//@desc: get single advert pages
//@access: private
//@method: get
//@route: /api/adpage/update/page_id
exports.getSinglePage =  asyncHandler(async(req, res) =>{
  try {
    let single = await cardSchema.findOne({page_id:req.params.page_id}).select("-_id, -__v")
    if(single){
      res.status(201).json({
        res:"ok",
         data:single
      })
    }
  } catch (error) {
    res.status(401).json({
      res:"error",
      message:error.message,
     
    })
  }
})


//@desc: update advert pages
//@access: private
//@method: put
//@route: /api/adpage/update/page_id

exports.updatePages = asyncHandler(async(req, res) =>{
  let {name, category} = req.body
  let fileArray = []
  const getPages = await cardSchema.findOne({page_id:req.params.page_id})
  if(getPages){
    if(req.file){
      compressImg(req, 200, 200)

      const uploadImg = await cloudinary.uploader.upload(req.file.path, {
        eager: [{ width: 200, height: 200 }],
      });
  
      let pageImg = {
        img_id: uploadImg.public_id,
        img: uploadImg.eager[0].secure_url,
      };
      fileArray.push(pageImg);
    }
  
  }
  try {
    let update = await cardSchema.findOneAndUpdate({page_id:req.params.page_id}, {$set:{name:name || getPages.name, category:category || getPages.category, pic:fileArray || getPages.pic}},{new:true}).select("-_id, -__v")
      if(!update){
        res.status(401).json({message:"something went wrong"})
      }
      if(update){
        res.status(201).json({
          res:"ok",
          message:"pages updated successfully",
          data:update
        })
      }
    
  } catch (error) {
    res.status(401).json({message:error.message})
  }


})