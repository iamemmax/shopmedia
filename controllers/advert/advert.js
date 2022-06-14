const advertSchema = require("../../model/advert/advertSchema");
const asyncHandler = require("express-async-handler");
const sharp = require("sharp")
const fs = require("fs");
const cloudinary = require("../../config/cloudinary")




// @desc: create advert
// @Route: /api/advert/create
// @Acess: private

exports.createAdvert = asyncHandler(async (req, res) => {

    let { address, localGovt, state, price, size, types, gender, postedBy, subTypes, interest, ageGroup } = req.body

    if (!address || !localGovt || !state || !price || !size || !types || !gender || !subTypes || !interest || !ageGroup || !postedBy) {
        res.status(401);
        throw new Error("please fill all field");
    }
    let files = req.files

    if (!files) {
        res.status(401);
        throw new Error("please choose a photo");
    }



    // @desc compress images before uploading
    let advertCloudImages = [];
    for (const file of files) {
        await sharp(file.path)
            .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .resize(500, 500)
            .png({ quality: 90, force: true })


        let uploadImg = await cloudinary.uploader.upload(file.path)

        fs.unlinkSync(file.path);

        let productImgs = {
            img_id: uploadImg.public_id,
            img: uploadImg.secure_url
        }
        advertCloudImages.push(productImgs)

    }
    try {
        let advertExist = await advertSchema.findOne({ address: address })
        if (advertExist) {
            res.status(401);
            throw new Error("advert already exist");
        } else {
            let uploadAdvert = await new advertSchema({
                address, localGovt, state, price, size, types, gender, postedBy, subTypes, interest, ageGroup, advertImgs: advertCloudImages
            }).save()

            if (uploadAdvert) {
                res.status(201).json({
                    res: "ok",
                    message: "advert created successfully",
                    data: uploadAdvert
                })
            } else {
                res.status(401).json({
                    res: "error",
                    message: "something went wrong ",

                })
            }
        }
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})


// @desc: list all advert
// @Route: /api/advert/
// @Acess: public

exports.listAdverts = asyncHandler(async (req, res) => {
    try {
        let adverts = await advertSchema.find().populate("postedBy", "-password")
        if (adverts.length > 0) {
            return res.status(201).json({
                res: "ok",
                total: adverts.length,
                data: adverts,
            });
        }
    } catch (error) {
        res.status(401);
        throw new Error(error.message);
    }
})




// @desc: get single advert
// @Route: /api/advert
// @Acess: public

exports.getSingleAdvert = asyncHandler(async (req, res) => {
    try {
        const singleAdvert = await advertSchema.findOne({ slug: req.params.slug })
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
})

// @desc: get single advert
// @Route: /api/advert/:slug
// @Acess: private

exports.updateAdvert = asyncHandler(async (req, res) => {
    let savedAdvert = await advertSchema.findById(req.params.id)
    let { address, localGovt, state, price, size, types, gender, postedBy, subTypes, interest, ageGroup } = req.body

    let fileArray = []
    console.log(savedAdvert.advertImgs);
    if (req.files) {
        let files = savedAdvert.advertImgs
        files.forEach(async file => {
            await cloudinary.uploader.destroy(file.img_id)

            let newFiles = req.files
            for (const new_file of newFiles) {
                await sharp(new_file.path)
                    .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
                    .resize(500, 500)
                    .png({ quality: 90, force: true })


                let uploadImg = await cloudinary.uploader.upload(new_file.path)

                fs.unlinkSync(new_file.path);

                let productImgs = {
                    img_id: uploadImg.public_id,
                    img: uploadImg.secure_url
                }
                console.log(productImgs);
                fileArray.push(productImgs)

            }

        })
    }
    try {
        if (savedAdvert) {
            await advertSchema.findByIdAndUpdate({ _id: req.params.id },
                {
                    $set: {

                        address: address || savedAdvert.address, localGovt: localGovt || savedAdvert.localGovt, state: state || savedAdvert.state, price: price || savedAdvert.price, size: size || savedAdvert.size, types: types || savedAdvert.types, gender: gender || savedAdvert.gender, subTypes: subTypes || savedAdvert.subTypes, interest: interest || savedAdvert.interest, ageGroup: ageGroup || savedAdvert.ageGroup, postedBy: postedBy || savedAdvert.postedBy, advertImgs: fileArray || savedAdvert.advertImgs
                    }

                }, { new: true }, (err, update) => {
                    if (err) console.log(err);

                    return res.status(201).json({
                        res: "ok",
                        message: "advert updated successfully",
                        data: update,
                    });

                })
        }
    } catch (error) {
        res.status(401);
        // throw new Error(error.message);
    }
})


exports.deleteAdver = asyncHandler(async(req, res) =>{
        const advert = await advertSchema.findById(req.params.id);
      
        try {
          if (advert) {
            advert.advertImgs.map((img) => {
              console.log(img.img_id);
              cloudinary.uploader.destroy(img.img_id);
            });
            await advertSchema
              .findByIdAndDelete(req.params.id)
              .exec((err, product) => {
                if (err) {
                  res.status(401);
                  throw new Error("unable to delete product");
                } else {
                  res.status(201).json({
                    message: `${product.address} deleted successfully`,
                    product,
                  });
                }
              });
          }
        } catch (error) {
          res.status(401);
          throw new Error(error.message);
        }
      });