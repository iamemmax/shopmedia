    
    
  const search = async (model, req, res) =>{


    let {
      search,
       subTypes,
      order_by,
      page = 1,
      limit = 50,
       types,
    } = req.query;
    const filterOptions = {
      // $and: [
        

          $or: [
          { address: { $regex: search, $options: "i" } },
          { localGovt: { $regex: search, $options: "i" } },
          { state: { $regex: search, $options: "i" } },
          { types: { $regex: search, $options: "i" } },
          { size: { $regex: search, $options: "i" } },
          { subTypes: { $regex: search, $options: "i" } },
          { interest: { $regex: search, $options: "i" } },    
         
          
           
          ]
        
        // { subTypes },
        // { types },
      // ],
    };
    const results = await model.find(filterOptions)
      .limit(limit * 1) //limit search result
      .skip((page - 1) * limit) // skip docs
      .sort({ createdAt: order_by === "createdAt" && "asc" }); // sort order
    // count total posts
    const count = await model.countDocuments(filterOptions);
    // response
    res.status(200).json({
      count: results.length,
      page,
      totalPages: Math.ceil(count / limit),
      results: results,
    });
    
}
module.exports = search
