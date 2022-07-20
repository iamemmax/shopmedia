const subCategorySchema = require("../../model/category/sub_category");
const asyncHandler = require("express-async-handler");
const categorySchema = require("../../model/category/categorySchema");
const crypto = require("crypto")


// @desc: list sub category
// @Route: /api/
// @Acess: private
exports.listSubCategories = asyncHandler(async (req, res) => {
  const page = Number(req.query.pageNumber) || 1;
  const pageSize = 20; // total number of entries on a single page
  
  try {
    // const count = await subCategorySchema.countDocuments({});
    let subCat = await subCategorySchema.find({categoryId:req.params.categoryId}).populate("categoryId", "-_id -__v ")
    .select("-__v")
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort("-createdAt");

    if (subCat.length > 0) {
      return res.status(201).json({
        res: "ok",
        total:subCat.length,
        pages: Math.ceil(subCat?.length / pageSize),
        data:subCat,
      });
    }else{
      res.status(401);
      throw new Error("category not found");
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
  let { sub_category, sub_category_id , categoryId} = req.body;

  
  const cartFound = await subCategorySchema.find({_id:req.params.id}, {__v: 0 });
  // console.log( sub_id?.pop());
  if (!sub_category) {
    res.status(401);
    throw new Error("All field are required");
  }

  try {
   
   

      
      if(cartFound.sub_category === sub_category){
        return res.status(401).json({
          message: "Sub-category already exist",
        });
      
    }else{
      crypto.randomBytes(10, async (err, buffer) => {
        let token = buffer.toString("hex");
  
      let addSubCategory = await new subCategorySchema({
        categoryId:req.params.id,
        sub_category,
        sub_category_id: `sub_id${token}`,
      }).save()
     
  
    
        return res.status(201).json({
          res: "ok",
          message: "sub-category added successfully",
          data:addSubCategory,
        });
      
    })
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

    const {sub_category} = req.body

  const findExistingSubCart =  await subCategorySchema.findOne({sub_category})
    const findSubCart = await subCategorySchema.findOne({sub_category_id:req.params.sub_category_id})
    if(findExistingSubCart?.sub_category === sub_category){
      return res.status(401).json({
        res:"failed",
            message: "sub-category already exist",
          });
    }

    try{

      if(findSubCart){
        let updateSubCart = await subCategorySchema.findOneAndUpdate({ub_category_id:req.params.sub_category_id}, {$set:{sub_category:sub_category ||findSubCart.sub_category }}, {new:true})

        if(updateSubCart){
          return res.status(201).json({
            res: "ok",
            message: "Sub category updated successfully",
            data:updateSubCart,
          });
        }else{
          return res.status(401).json({
            res:"failed",
                message: "Unable to update sub-category",
              });
        }
      }else{
        return res.status(401).json({
          res:"failed",
              message: "Sub-category not found",
            });
      }

    }catch(error){
      res.status(401);
              throw new Error(error.message);
    }
  
})

// @desc: Deletes category
// @Route: /api/sub-category/delete/:id
// @Acess: private
exports.deleteSubCategory = asyncHandler(async(req, res) =>{

    let deleteCart = await subCategorySchema.findOneAndDelete({sub_category_id:req.params.sub_category_id}).select("-_id -__v")
    if(deleteCart){
        return res.status(201).json({
            res: "ok",
            message: "Sub-category deleted successfully",
            deleteCart,
          });
    }else{
        return res.status(401).json({
            message: "Unable to delete category",
          });
    }
})
