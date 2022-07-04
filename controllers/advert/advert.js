const advertSchema = require("../../model/advert/advertSchema");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const cloudinary = require("../../config/cloudinary");
const crypto = require("crypto");
const {search} = require("../../helper/search");
const compressImg = require("../../helper/sharp");

// @desc: create advert
// @Route: /api/advert/create
// @Acess: private

exports.createAdvert = asyncHandler(async (req, res) => {
  let {
    address,
    city,
    state,
    price,
    size,
    category,
    sub_category,
    gender,
    landmark,
    interest,
    ageGroup,
  } = req.body;

  if (
    !address ||
    !city ||
    !state ||
    !landmark ||
    !price ||
    !size ||
    !category ||
    !gender ||
    !sub_category||
    !interest ||
    !ageGroup 
  ) {
    res.status(401);
    throw new Error("All fields are required");
  }

  let files = req.files;

  const {advertImgs} = req.body

  if (!advertImgs && !files.length) {
    return res.status(401).json({
      res:"failed",
      // status_code: 
      message:"choose at least one image"
    })
    // throw new Error("choose at least one image");
    
  }
  let advertExist = await advertSchema.findOne({ address: address });
    if (advertExist) {
      res.status(401);
      throw new Error("Advert already exist");
    } 

  // @desc compress images before uploading
  let advertCloudImages = [];
  
 

  for (let i = 0; i < files.length; i++) {
    const element = files[i];
     
    compressImg(element.path, 500, 500)

    const uploadImg = await cloudinary.uploader.upload(element.path, {
      eager: [
        { width: 500, height: 500 },
       
      ],
      upload_preset: "shopmedia",
      url_suffix: "shopmedia"
    },);
    let productImgs = {
      img_id: uploadImg.public_id,
      img: uploadImg.eager[0].secure_url,
    };
    console.log(productImgs)

    //  
    advertCloudImages.push(productImgs);

    fs.unlinkSync(element.path);
   
  }
  try {
    
      crypto.randomBytes(10, async (err, buffer) => {
        let token = buffer.toString("hex");

        let uploadAdvert = await new advertSchema({
          advert_id: `shop_media${token}`,
          address,
          city,
          state,
          price,
          size,
          category,
          sub_category,
          gender,
          postedBy:req?.user,
          interest,
          ageGroup,
          landmark,
          advertImgs: advertCloudImages,
        }).save()

        if (uploadAdvert) {
          res.status(201).json({
            res: "ok",
            message: "advert created successfully",
            data: uploadAdvert,
          });
        } else {
          res.status(401).json({
            res: "error",
            message: "something went wrong ",
          });
        }
      });
    
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
 });

// @desc: list all advert
// @Route: /api/advert/
// @Acess: public

exports.listAdverts = asyncHandler(async (req, res) => {
  try {
    let adverts = await advertSchema
      .find()
      .populate("postedBy category sub_category", "-_id -__v -token -password")
      .select("-_id -__v");
    if (adverts.length > 0) {
      return res.status(201).json({
        res: "ok",
        total: adverts.length,
        data: adverts,
      });
    } else {
      return res.status(401).json({
        res: "err",
        message: "no advert found",
      });
    }
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// @desc: get single advert
// @Route: /api/advert
// @Acess: public

exports.getSingleAdvert = asyncHandler(async (req, res) => {
  try {
    const singleAdvert = await advertSchema.findOne({ slug: req.params.slug });
    if (singleAdvert) {
      return res.status(201).json({
        res: "ok",
        data: singleAdvert,
      });
    }
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// @desc: get single advert
// @Route: /api/advert/:slug
// @Acess: private

exports.updateAdvert = asyncHandler(async (req, res) => {
  let savedAdvert = await advertSchema.findOne({
    advert_id: req.params.advert_id,
  });
  let {
    address,
    city,
    state,
    price,
    size,
    category,
    sub_category,
    gender,
    postedBy,
    interest,
    ageGroup,
  } = req.body;

  //   // @DESC if error occur when trying to upload img to cloud server

  //   // @DESC delete the file path

  update = await advertSchema
    .findOneAndUpdate(
      { advert_id: req.params.advert_id },
      {
        $set: {
          address: address || savedAdvert.address,
          city: city || savedAdvert.city,
          state: state || savedAdvert.state,
          price: price || savedAdvert.price,
          size: size || savedAdvert.size,
          category: category || savedAdvert.category,
          gender: gender || savedAdvert.gender,
          sub_category: sub_category || savedAdvert.sub_category,
          interest: interest || savedAdvert.interest,
          ageGroup: ageGroup || savedAdvert.ageGroup,
          postedBy: postedBy || savedAdvert.postedBy,
        },
      },
      { new: true }
    )
    .select("-_id, -__v");

  try {
    if (update) {
      return res.status(201).json({
        res: "ok",
        message: "advert updated successfully",
        data: update,
      });
    }
  } catch (error) {
    res.status(401);
    // throw new Error(error.message);
    console.log(error.message);
  }
});

// @desc: updating images advert images 
// @Route: /api/advert/upadte/img
// @Acess: private
exports.updateAdvertImg = asyncHandler(async (req, res) => {
  let fileArray = [];
  let files = req.files;

  for (const file of files) {
    compressImg(file.path, 500, 500);
    // console.log();
    console.log(file);
    const uploadImg = await cloudinary.uploader.upload(file?.path, {
      eager: [{ width: 500, height: 500 }],
    });
    console.log(uploadImg);
    if (uploadImg) {
      let productImgs = {
        img_id: uploadImg.public_id,
        img: uploadImg.eager[0].secure_url,
      };
      fileArray.push(productImgs);
    }
    fs.unlinkSync(file.path);
  }
  fileArray.map(async (data) => {
   await advertSchema
      .findOneAndUpdate(
        { advert_id: req.params.advert_id },
        { $push: { advertImgs: data } },
        { new: true }
      )
      .select("-_id, -__v")
      .exec((err) => {
        if (err) {
          return res.status(401).json({
            res: "ok",
            message: "something went wrong",
          });
        } 
      });
    });
           res.status(201).json({
            res: "ok",
            message: "advert image(s) updated successfully",
           
          });
        




   
});




// @desc:updating advertImg  simuustaneously
// @Route: /api/advert/delete/:advert_id
// @Acess: private

exports.updateEachImg = asyncHandler(async (req, res) => {
  const AdvertExist = await advertSchema.findOne({advert_id:req.params.advert_id})

  
  if(AdvertExist){
    let {advertImgs} = AdvertExist

   let updatedImg = advertImgs.filter(img => img?.img_id !== req.body.img_id )
   compressImg(req.file.path, 500, 500)
    
    let uploadImg = await cloudinary.uploader.upload(req.file.path, {
      eager: [
        { width: 100, height: 100 },
      ],
    })

    fs.unlinkSync(req.file.path);
    if(uploadImg){
      let adImg = {
        img_id:uploadImg.public_id,
        img:uploadImg.eager[0].secure_url,
      }
      console.log(adImg)
      
      if(updatedImg){
        let oldeImg = await advertSchema.findOneAndUpdate({advert_id:req.params.advert_id}, {$set:{advertImgs:updatedImg}}, {new:true})
        let OverrideImg = await advertSchema.findOneAndUpdate({advert_id:req.params.advert_id}, {$push:{advertImgs:adImg}}, {new:true})
        if(OverrideImg){
           await cloudinary.uploader.destroy(req.body.img_id);
           res.status(201).json({
            res: "ok",
            message: "advert image updated successfully",
            data:OverrideImg
           
          });
        
        }else{
          return res.status(401).json({
            res: "ok",
            message: "something went wrong",
          });
        }
      }
    }
   
  try {
   
  } catch (error) {
    
  }

}
})



// @desc: delete advert
// @Route: /api/advert/delete/:advert_id
// @Acess: private

exports.deleteAdvert = asyncHandler(async (req, res) => {
  const advert = await advertSchema.findOne({
    advert_id: req.params.advert_id,
  });

  try {
    if (advert) {
      advert.advertImgs.map((img) => {
        console.log(img.img_id);
        cloudinary.uploader.destroy(img.img_id);
      });
      await advertSchema
        .findOneAndDelete({ advert_id: req.params.advert_id })
        .exec((err, product) => {
          if (err) {
            return res.status(401).json({
              message: "unable to delete product",
            });
          } else {
            return res.status(201).json({
              message: "advert deleted successfully",
              product,
            });
          }
        });
    }else{
      res.status(401)
      throw new Error("Advert not found")
    }
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
});

// @desc: delete advert images
// @Route: /api/advert-img/delete/:advert_id
// @Acess: private


exports.deleteAdvertImg = asyncHandler(async (req, res) => {
  const deleteAvertImg = await advertSchema.findOne({advert_id:req.params.advert_id})
  if(deleteAvertImg){
    let {advertImgs} = deleteAvertImg

   let updatedImg = advertImgs.filter(img => img.img_id != req.body.img_id )
   
   
   if(updatedImg){
    await cloudinary.uploader.destroy(req.body.img_id);
    
     await advertSchema.findOneAndUpdate({advert_id:req.params.advert_id}, {$set:{advertImgs:updatedImg}},{new:true})
    return res.status(201).json({
      res:"ok",
      message:"advert image removed successfully",
      data:updatedImg
    })
   }else{
    return res.status(401).json({
      res:"error",
      message:"unable to delete advert image ",
     
    })
   }
  }
  
});

exports.searchAdvert = asyncHandler(async (req, res) => {
  search(advertSchema, req, res);
});

exports.searchBySubTypes =  asyncHandler(async (req, res) => {
  let order = req.body.order ?  req.body.order: "asc";
  let sortBy = req.body.sortBy ?  req.body.sortBy: "asc";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100
  let skip = parseInt(req.body.skip) 

   let findArrgs = {}
   
    // for (let key in req.body.filters) {
    //   if (req.body.filters[key].length > 0) {
    //     findArrgs[key] = req.body.filters[key];
    //     console.log(req.body.filters[key]);
        
    //   }
    // }
    // await advertSchema.find({state:req.body.state}).select("-_id").sort([[sortBy, order]]).skip(skip).limit(limit).exec((err, data)=>{
    //   if(err)return res.status(400).send(err)
    //   res.json({
    //     total:data.length,
    //     data
    //   })

    // })

})
