const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const passportLoginSuccess = asyncHandler(async (req, res) => {
	
  if(req.user){
    let{user}  = req
    const token = jwt.sign({user }, process.env.JWT_SECRETE, {
      expiresIn: "12h",
    });
    return res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  
  }
});

// controller for the routes that handle the failure redirects from all 4 passport strategies
const passportLoginFailure = asyncHandler(async (req, res) => {
	return res.status(401).json({
    message:"something went wrong"
  })
});







const facebookLoginSuccess = asyncHandler(async (req, res) => {
	
  // // if(req.user){
  // //   let{user}  = req
  // //   const token = jwt.sign({user }, process.env.JWT_SECRETE, {
  // //     expiresIn: "12h",
  // //   });
  // //   return res.status(200).json({
  // //     message: "Login successful",
  // //     user,
  // //     token,
  // //   });
  
  // }
});

// controller for the routes that handle the failure redirects from all 4 passport strategies
const facebbokLoginFailure = asyncHandler(async (req, res) => {
	return res.status(401).json({
    message:"something went wrong"
  })
});

module.exports = { passportLoginSuccess, passportLoginFailure, facebbokLoginFailure, facebookLoginSuccess };