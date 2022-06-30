const categorySchema = require("../../model/category/categorySchema");
const asyncHandler = require("express-async-handler");





// @desc: create category
// @Route: /api/category
// @Acess: private
exports.listCategories = asyncHandler(async(req, res) =>{
    try {
        let categories = await categorySchema.find()
    if(categories.length > 0){
        return res.status(201).json({
            res: "ok",
            categories,
          });
    }else{
        res.status(401);
        throw new Error("empty category");
    }
    } catch (error) {
        res.status(401);
        throw new Error(error.message);
    }
})

// @desc: create category
// @Route: /api/category/create
// @Acess: private
exports.createCategory = asyncHandler(async(req, res) =>{
    let {category, category_type} = req.body
    if(!category){
        res.status(401);
        throw new Error("select category ");
    }

    try {
        let addCategory = await  new categorySchema({
            category, category_type
        }).save()

        if(addCategory){
            return res.status(201).json({
                res: "ok",
                message: "category added successfully",
                data:addCategory,
              });
        }else{
            return res.status(401).json({
                message: "unable to add category",
              });
        }
    } catch (error) {
        res.status(401);
        throw new Error(error.message);
    }

})

// @desc: update category types
// @Route: /api/category/update/:id
// @Acess: private

exports.updateCategory = asyncHandler(async(req, res) =>{
    
    let {category, category_type } = req.body
    

    const regCategory = await categorySchema.findById(req.params.id)
    
    if(regCategory){
           try {
            let updateCategoryType = await categorySchema.findOneAndUpdate({_id:req.params.id}, {$set:{category:category || regCategory.category, category_type:category_type || regCategory.category_type }}, {new:true})
            if(updateCategoryType){
                return res.status(201).json({
                    res: "ok",
                    message: "category  updates successfully",
                    data:updateCategoryType,
                  });
            }else{
                return res.status(401).json({
                    message: "unable to add sub-category",
                  });
            }
           } catch (error) {
            res.status(401);
            throw new Error(error.message);
           }
        
    }
})




// @desc: Deletes category
// @Route: /api/category/delete/:id
// @Acess: private
exports.deleteCategory = asyncHandler(async(req, res) =>{
 
    let deleteCart = await categorySchema.findByIdAndDelete(req.params.id)
    if(deleteCart){
        return res.status(201).json({
            res: "ok",
            message: "category deleted successfully",
            deleteCart,
          });
    }else{
        return res.status(401).json({
            message: "unable to delete category",
          });
    }
})


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
