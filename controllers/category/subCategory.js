const subCategorySchema = require("../../model/category/sub_category");
const asyncHandler = require("express-async-handler");

// @desc: list sub category
// @Route: /api/
// @Acess: private
exports.listSubCategories = asyncHandler(async (req, res) => {
  try {
    let subCat = await subCategorySchema.find();
    if (subCat.length > 0) {
      return res.status(201).json({
        res: "ok",
        subCat,
      });
    }
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// @desc: create category
// @Route: /api/category/create
// @Acess: private
exports.createSubCategory = asyncHandler(async (req, res) => {
  let { subCategory } = req.body;
  const sub_id = await subCategorySchema.find({}, { _id: 0, __v: 0 });
  // console.log( sub_id?.pop());
  if (!subCategory) {
    res.status(401);
    throw new Error("sub-category field are required");
  }

  try {
    let addSubCategory = await new subCategorySchema({
      subCategory,
      typesId: req.params.id,
      id: sub_id.length ? sub_id?.pop()?.id + 1 : 1,
    }).save();

    if (addSubCategory) {
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
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// @desc: update category types
// @Route: /api/category/update/:id
// @Acess: private

// exports.updateCategory = asyncHandler(async(req, res) =>{

//     let {types} = req.body

//     const Category = await categorySchema.findById(req.params.id)

//     if(Category){
//            try {
//             let updateCategoryType = await categorySchema.findOneAndUpdate({_id:req.params.id},{$set:{types:types || Category.types }},{new:true})
//             if(updateCategoryType){
//                 return res.status(201).json({
//                     res: "ok",
//                     message: "category  updates successfully",
//                     updateCategoryType,
//                   });
//             }else{
//                 return res.status(401).json({
//                     message: "unable to add sub-category",
//                   });
//             }
//            } catch (error) {
//             res.status(401);
//             throw new Error(error.message);
//            }

//     }
// })

// // @desc: Deletes category
// // @Route: /api/category/delete/:id
// // @Acess: private
// exports.deleteCategory = asyncHandler(async(req, res) =>{

//     let deleteCart = await categorySchema.findByIdAndDelete(req.params.id)
//     if(deleteCart){
//         return res.status(201).json({
//             res: "ok",
//             message: "category deleted successfully",
//             deleteCart,
//           });
//     }else{
//         return res.status(401).json({
//             message: "unable to delete category",
//           });
//     }
// })

// // @desc: create subCategory
// // @Route: /api/category/add-subTypes/:id
// // @Acess: private

// exports.addSubCategory = asyncHandler(async(req, res) =>{
//     let {subCategory} = req.body

//     if(!subCategory){
//         res.status(401);
//         throw new Error("please select sub category type");
//     }
//     const findCategory = await categorySchema.findById(req.params.id)

//     if(findCategory){
//            try {
//             let addSubTypes = await categorySchema.findByIdAndUpdate({_id:req.params.id}, {$push:{subTypes:subCategory}},{new:true})
//             if(addSubTypes){
//                 return res.status(201).json({
//                     res: "ok",
//                     message: "category added successfully",
//                     addSubTypes,
//                   });
//             }else{
//                 return res.status(401).json({
//                     message: "unable to add sub-category",
//                   });
//             }
//            } catch (error) {
//             res.status(401);
//             throw new Error(error.message);
//            }

//     }
// })
