const asyncHandler = require("express-async-handler");
exports.paginated = asyncHandler(async () => {
    
return async(req, res, next) =>{
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const startIndex = (page -1) * limit;
    const endIndex = page * limit;
    const sort = req.query.sort;
 
console.log("12345")
   let results = {}

   if(startIndex > 0){
       results.prev = {
           page:page -1,
           limit
       }
   }
   // change model.length to model.countDocuments() because you are counting directly from mongodb
   if(endIndex < await model.countDocuments().exec()){
       results.next = {
        page:page +1,
        limit
           
           
        }
   }
   try {

       //    .limit(limit).skip(startIndex) replaced the slice method because 
//       it is done directly from mongodb and they are one of mongodb methods
 


let query = req.query.q
if(query){

    results.result = await model.find({title:{$regex:query, $options: '$i'}}).populate(postedBy).sort(sort).limit(limit).skip(startIndex).exec()
}else{
    results.result  = await model.find().sort(sort).limit(limit).skip(startIndex).exec()

}
    
    

        
    

res.paginatedResults = results;
    
    next() 
   } catch (error) {
       return res.status(401).json({
           message:error.message
           
       })
   }
}




})


