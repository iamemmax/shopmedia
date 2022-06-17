const advertSchema = require("../../model/advert/advertSchema");
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
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
    localGovt,
    state,
    price,
    size,
    types,
    advert_id,
    gender,
    postedBy,
    subTypes,
    landmark,
    interest,
    ageGroup,
  } = req.body;

  if (
    !address ||
    !localGovt ||
    !state ||
    !landmark ||
    !price ||
    !size ||
    !types ||
    !gender ||
    !subTypes ||
    !interest ||
    !ageGroup ||
    !postedBy
  ) {
    res.status(401);
    throw new Error("please fill all field");
  }
  let files = req.files;

  if (!files) {
    res.status(401);
    throw new Error("please choose a photo");
  }

  // @desc compress images before uploading
  let advertCloudImages = [];

  for (let i = 0; i < files.length; i++) {
    const element = files[i];
    compressImg(element.path, 500, 500)
    // let uploadImg =  cloudinary.image(element.path,{transformation:[{width:500, height:500}]}).uploader.upload();

    const uploadImg = await cloudinary.uploader.upload(element.path, {
      eager: [
        { width: 500, height: 500 },
        // { width: 260, height: 200, crop: "crop", gravity: "north"}
      ],
    });

    let productImgs = {
      img_id: uploadImg.public_id,
      img: uploadImg.eager[0].secure_url,
    };

    //   if (uploadImg) {
    advertCloudImages.push(productImgs);
    //   }
    fs.unlinkSync(element.path);
  }
  // console.log(advertCloudImages);
  try {
    let advertExist = await advertSchema.findOne({ address: address });
    if (advertExist) {
      res.status(401);
      throw new Error("advert already exist");
    } else {
      crypto.randomBytes(10, async (err, buffer) => {
        let token = buffer.toString("hex");

        let uploadAdvert = await new advertSchema({
          advert_id: `shop_media${token}`,
          address,
          localGovt,
          state,
          price,
          size,
          types,
          gender,
          postedBy,
          subTypes,
          interest,
          ageGroup,
          landmark,
          advertImgs: advertCloudImages,
        }).save();

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
    }
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
      .populate("postedBy", "-password")
      .select("-_id, -__v");
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
    localGovt,
    state,
    price,
    size,
    types,
    gender,
    postedBy,
    subTypes,
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
          localGovt: localGovt || savedAdvert.localGovt,
          state: state || savedAdvert.state,
          price: price || savedAdvert.price,
          size: size || savedAdvert.size,
          types: types || savedAdvert.types,
          gender: gender || savedAdvert.gender,
          subTypes: subTypes || savedAdvert.subTypes,
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

// @desc: advert images advert
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
    }
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
});

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
