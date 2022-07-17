const isodate = require("isodate")
const asyncHandler = require("express-async-handler");


// @desc:advert search filter
exports.search = asyncHandler(async (model, req, res) => {
  let { search, page = 1, limit = 50, order_by } = req.query;

  const filterOptions = {
    $or: [
      { address: { $regex: search, $options: "i" } },
      { state: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
      { landmark: { $regex: search, $options: "i" } },
      { size: { $regex: search, $options: "i" } },
      { interest: { $regex: search, $options: "i" } },
      { ageGroup: { $regex: search, $options: "i" } },
    ],
  };
  try{
    const results = await model.find(filterOptions).populate("category sub_category").collation({locale: "en", strength: 2})
    .select("-_id -__v")
    .limit(limit * 1) //limit search result
    .skip((page - 1) * limit) // skip docs
    .sort({ createdAt: order_by === "createdAt" && "asc" }); // sort order
  // count total posts
  const count = await model.countDocuments(results);
  // response
 return res.status(200).json({
    count: results.length,
    page,
    totalPages: Math.ceil(count / limit),
    results: results,
  });
  }catch(error){
    res.status(401)
    throw new Error(error.message)
  }
});




// @desc:homepage search
exports.filterHomepage = asyncHandler(async (req, res, model) => {
  let { category, state,start_date,  page = 1, limit = 50, order_by } = req.body;


  const filterOptions = {
    $and: [
      {
        category,
      },
      {
        state: { $in: [...state] },
        
      },
      {
        createdAt:{$gte:isodate(start_date)}
      }
    ],
  };

  try{
    const results = await model.find(filterOptions).select("-_id, -__v").populate("category").collation({locale: "en", strength: 2})
    .limit(limit * 1) //limit search result
    .skip((page - 1) * limit) // skip docs
    .sort({ createdAt: order_by === "createdAt" && "asc" }); // sort order
  // count total posts
  const count = await model.countDocuments(results);
  // response
 return res.status(200).json({
    count: results.length,
    page,
    totalPages: Math.ceil(count / limit),
    results: results,
  });
  }catch(error){
   res.status(401)
   throw new Error(error.message)
  }
});








// @desc:search users by admin

exports.searchUser = asyncHandler(async (model, req, res) => {
  let { search, page = 1, limit = 50, order_by } = req.query;

  console.log(search)
  const filterOptions = {
    $or: [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { user_id: { $regex: search, $options: "i" } },
      { fullname: { $regex: search, $options: "i" } },
      { roles: { $regex: search, $options: "i" } },
      // { fullname: { $regex: search, $options: "i" } },
      // { googleId: { $regex: search, $options: "i" } },
      // { facebookId: { $regex: search, $options: "i" } },
     
    ],
  };
  try{

    const results = await model.find(filterOptions).collation({locale: "en", strength: 2})
    .select("-_id -__v")
    .limit(limit * 1) //limit search result
    .skip((page - 1) * limit) // skip docs
    .sort({ createdAt: order_by === "createdAt" && "asc" }); // sort order
    // count total posts
    const count = await model.countDocuments(results);
    // response
   return  res.status(200).json({
    count: results.length,
    page,
    totalPages: Math.ceil(count / limit),
    results: results,
  });
}catch(error){
  res.status(401)
  throw new Error(error.message)
}
});


//@desc:agency search filter
exports.searchAgency = asyncHandler(async (model, req, res) => {
  let { search, page = 1, limit = 20, order_by } = req.query;


 
    console.log(req.query)
      
      
      
      
    
  
  try{
    const results = await model.find({company_name: { $regex: search, $options: "i" }}).populate("categoryId").collation({locale: "en", strength: 2})
    .select("-_id -__v")
    .limit(limit * 1) //limit search result
    .skip((page - 1) * limit) // skip docs
    .sort({ createdAt: order_by === "createdAt" && "asc" }); // sort order
  // count total posts
  // const count = await model.countDocuments(results);
  // response
 return res.status(200).json({
    count: results.length,
    page,
    totalPages: Math.ceil(results.length / limit),
    data: results,
  });
  }catch(error){
    res.status(401)
    throw new Error(error.message)
  }
});

