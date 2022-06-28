const subCategorySchema = require("../../model/category/sub_category");
const asyncHandler = require("express-async-handler");
const categorySchema = require("../../model/category/categorySchema");
const crypto = require("crypto")


// @desc: list sub category
// @Route: /api/
// @Acess: private
// exports.listSubCategories = asyncHandler(async (req, res) => {
//   try {
//     let subCat = await subCategorySchema.find().populate("typesId").select("-_id -__v");
//     if (subCat.length > 0) {
//       return res.status(201).json({
//         res: "ok",
//         total:subCat.length,
//         data:subCat,
//       });
//     }
//   } catch (error) {
//     res.status(401);
//     throw new Error(error.message);
//   }
// });

// @desc: list sub category under each cartegory
// @Route: /api/
// @Acess: private
// exports.listSubCatByCart = asyncHandler(async (req, res) => {
//   try {
//     let subCat = await subCategorySchema.find({typesId:req.params.typeId}).populate("typesId").select("-_id -__v");
//     if (subCat.length > 0) {
//       return res.status(201).json({
//         res: "ok",
//         total:subCat.length,
//         data:subCat,
//       });
//     }
//   } catch (error) {
//     res.status(401);
//     throw new Error(error.message);
//   }
// });






// @desc: create category
// @Route: /api/category/create
// @Acess: private
exports.createSubCategory = asyncHandler(async (req, res) => {
  let { sub_category } = req.body;
  const cartFound = await categorySchema.find({_id:req.params.id}, {__v: 0 });
  // console.log( sub_id?.pop());
  if (!sub_category) {
    res.status(401);
    throw new Error("sub-category field are required");
  }

  try {
    if(cartFound.length < 1){
      return res.status(401).json({
        message: "category not  found",
      });
    }
    let cartExist = cartFound[0].subCategory
     cartExist.filter(data => {
      if(data.sub_category === sub_category){
        return res.status(401).json({
          message: "sub-category already exist",
        });
      }
    })
    crypto.randomBytes(10, async (err, buffer) => {
      let token = buffer.toString("hex");

    let addSubCategory = await new subCategorySchema({
      sub_category,
      sub_category_id: `sub_id${token}`,
    })
   

    if (addSubCategory) 
    {
      await categorySchema.findByIdAndUpdate({_id:req.params.id}, {$push:{subCategory:addSubCategory}},{new:true}).select('-__v  -_id')
      return res.status(201).json({
        res: "ok",
        message: "category added successfully",
        addSubCategory,
      });
    } else {
      return res.status(401).json({
        message: "unable to add category",
      });
    }
  })
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// @desc: update category types
// @Route: /api/sub-category/update/:id
// @Acess: private

exports.updateSubCart = asyncHandler(async(req, res) =>{

    let {sub_category} = req.body
    const data = await categorySchema.find({_id:req.params.id})
    data[0].subCategory.map(x => {
      
      if(x.sub_category_id === req.params.sub_category_id){
        
        x.sub_category = sub_category
      }
                 
      // let updateSubCart = data.save()

      return res.status(201).json({
          res: "ok",
          message: "sub category updates successfully",
          // data:updateSubCart,
        });
    })
      //  let updateSubCart = await data.save()


   

             
    //         }
    //       })
    //        } catch (error) {
    //         res.status(401);
    //         throw new Error(error.message);
    //        }

    // }else{
    //   return res.status(401).json({
    //     message: "unable to update sub-category",
    //   });
    // }
})

// @desc: Deletes category
// @Route: /api/sub-category/delete/:id
// @Acess: private
exports.deleteSubCategory = asyncHandler(async(req, res) =>{

    let deleteCart = await subCategorySchema.findOneAndDelete({id:req.params.id}).select("-_id, -__v")
    if(deleteCart){
        return res.status(201).json({
            res: "ok",
            message: "sub-category deleted successfully",
            deleteCart,
          });
    }else{
        return res.status(401).json({
            message: "unable to delete category",
          });
    }
})
