const asyncHandler = require("express-async-handler");
const jwt =  require("jsonwebtoken");

exports.ensureLogin = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  const rawToken = authorization?.split(" ");
  try {
    jwt.verify(rawToken[1], process.env.JWT_SECRETE, (error, data) => {
      if (error) {
         res.status(400)
         throw new Error("Invalid token")

      }
      req.user = data.user;
      // console.log(data.user);
      return next();
    });
  } catch (error) {
    if (error) {
      res.status(401)
      throw new Error('Not authorized')
     
    }
  }
  if(!rawToken){
    res.status(401)
    throw new Error('Not authorized, no token')
       
  }
})

exports.adminAccess = (roles) => (req, res, next) => {
 try {
  if(roles.includes(req.user.roles)){
    return next()
  }else{
    res.status(401)
    throw new Error('Not authorized, no token')
    
  }

 } catch (error) {
  if (error) {
    res.status(401)
    throw new Error('Not authorized')
   
  }
 }

}