const asyncHandler = require("express-async-handler");
const { filterPages } = require('../../helper/search');
const fs = require("fs");
const crypto = require("crypto");
const cloudinary = require("../../config/cloudinary");
const cardSchema = require("../../model/Agency/CardSchema");
const compressImg = require("../../helper/sharp");

//@desc: add advert pages
//@access: private
//@method: post
//@route: /api/adpage/create
exports.AddPages = asyncHandler(async (req, res) => {
  let {company_name, category, email,location, phone, page_id } = req.body;
  let fileArray = [];
 console.log(company_name, category, email,location, phone)
  if(!company_name || !category  ||!email || !phone || !location) {
    res.status(401);
    throw new Error("all field are require");
  }
  if (!req.file) {
    res.status(401);
    throw new Error("choose a photo");
  }
  //@desc : check if company_name exist
  let pageExist = await cardSchema.findOne({ company_name });
  if (pageExist) {
    res.status(401);
    throw new Error("company_name already exist");
  } else {
    compressImg(req.file.path, 200, 200)

    const uploadImg = await cloudinary.uploader.upload(req.file.path, {
      eager: [{ width: 200, height: 200 }],
    });
    fs.unlinkSync(req.file.path);
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
  company_name, category, email,location, phone,
  logo: fileArray,
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

  
  const getPages = await cardSchema.findOne({page_id:req.params.page_id}).select("-_id, -__v")

  
  try {
    let update = await cardSchema.findOneAndUpdate({page_id:req.params.page_id}, {$set:{name:name || getPages.name, category:category || getPages.category}},{new:true}).select("-_id, -__v")
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
   return res.status(401).json({message:error.message})
  }

  
})



//@desc: update advert pages image
//@access: private
//@method: put
//@route: /api/adpage/update/img/page_id

exports.updateLogoImg =  asyncHandler(async(req, res) =>{
  let {pic} = await cardSchema.findOne({page_id:req.params.page_id})
  let fileArray = []
  if(req.file){
    compressImg(req.file.path, 200, 200)
    
    const uploadImg = await cloudinary.uploader.upload(req.file.path, {
      eager: [{ width: 200, height: 200 }],
    });
    fs.unlinkSync(req.file.path);

    let pageImg = {
      img_id: uploadImg.public_id,
      img: uploadImg.eager[0].secure_url,
    };
    fileArray.push(pageImg);
  }
  try {
          let update = await cardSchema.findOneAndUpdate({page_id:req.params.page_id}, {$set:{pic:fileArray }},{new:true}).select("-_id, -__v")
    if(update){
      await cloudinary.uploader.destroy(pic[0]?.img_id)
      
      return  res.status(201).json({
          res:"ok",
          message:"image updated successfully",
          data:update
        })
     }else{
      res.status(401).json({message:"something went wrong"})
  
     }
    
  } catch (error) {
   return res.status(401).json({message:error.message})
    
  }

})


exports.removeAdPage =  asyncHandler(async(req, res) =>{
  let pages = await cardSchema.findOne({page_id:req.params.page_id})


  if(pages){

    let removePage = await cardSchema.findOneAndDelete({page_id:req.params.page_id}).select("-_id, -__v")
    if(removePage){
      await cloudinary.uploader.destroy(pages.pic[0]?.img_id)
      return  res.status(201).json({
        res:"ok",
        message:"pages deleted successfully",
        data:removePage
      })
    }else{
      res.status(401).json({message:"something went wrong"})
      
    }
    
  }else{
    res.status(401).json({message:"pages not found"})
    
  }
  })


  exports.searchPages = asyncHandler(async(req, res)=>{
   let {name} = req.body
   let pages = await cardSchema.find({category:req.params.category})
   if(pages){
    if(pages){
      filterPages(req, res, cardSchema)

    }else{
      res.status(401).json({res:"err", message:`${name} not found`})
    }
  }
  })
  

  //@desc: update advert pages image
//@access: private
//@method: put
//@route: /api/adpage/categories

exports.listPagesByCategory = asyncHandler(async(req, res) =>{
  try {
    let getPages = await cardSchema.find({category:req.params.category}, {_id:0, __v:0})
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