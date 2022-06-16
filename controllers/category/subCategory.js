const subCategorySchema = require("../../model/category/sub_category");
const asyncHandler = require("express-async-handler");

// @desc: list sub category
// @Route: /api/
// @Acess: private
exports.listSubCategories = asyncHandler(async (req, res) => {
  try {
    let subCat = await subCategorySchema.find().populate("typesId").select("-_id -__v");
    if (subCat.length > 0) {
      return res.status(201).json({
        res: "ok",
        total:subCat.length,
        data:subCat,
      });
    }
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// @desc: list sub category under each cartegory
// @Route: /api/
// @Acess: private
exports.listSubCatByCart = asyncHandler(async (req, res) => {
  try {
    let subCat = await subCategorySchema.find({typesId:req.params.typeId}).populate("typesId").select("-_id -__v");
    if (subCat.length > 0) {
      return res.status(201).json({
        res: "ok",
        total:subCat.length,
        data:subCat,
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
// @Route: /api/sub-category/update/:id
// @Acess: private

exports.updateSubCart = asyncHandler(async(req, res) =>{

    let {subCategory} = req.body

    const subCart = await subCategorySchema.findOne({id:req.params.id})

    if(subCart){
           try {
            let updateSubCat = await subCategorySchema.findOneAndUpdate({id:req.params.id},{$set:{subCategory:subCategory || subCart.subCategory }},{new:true}).select("-_id -__v")
            if(updateSubCat){
                return res.status(201).json({
                    res: "ok",
                    message: "sub category updates successfully",
                    data:updateSubCat,
                  });
            }else{
                return res.status(401).json({
                    message: "unable to update sub-category",
                  });
            }
           } catch (error) {
            res.status(401);
            throw new Error(error.message);
           }

    }
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
