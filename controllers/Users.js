const userSchema = require("../model/UserSchema");
const tokenSchema = require("../model/tokenSchema");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../config/email");
const passport = require("passport");
const sharp = require("sharp")
const fs = require("fs");
const cloudinary = require("../config/cloudinary")
// @desc: create account
// @Route: /api/users/register
// @Acess: public
exports.createUser = asyncHandler(async (req, res) => {
  let {
    username,
    email,
    fullname,
    password,
    confirm_password,
    phone_no,
    company_name,
  } = req.body;

  //@desc: check if users fill all field

  if (
    !username ||
    !email ||
    !fullname ||
    !password ||
    !confirm_password ||
    !phone_no
  ) {
    res.status(401);
    throw new Error("please fill all field");
  }
  // @desc check if user enter valid email
  function validateEmail(email) {
    const regex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  }
  if (!validateEmail(email)) {
    res.status(401);
    throw new Error("please enter a valid email");
  }

  // @desc check if user enter strong password
  function validatePassword(password) {
    const regex =
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])([a-zA-Z0-9@$!%*?&]{8,})$/;
    return regex.test(password);
  }
  if (!validatePassword(password)) {
    res.status(401);
    throw new Error(
      "invalid password!!! password must contain 1uppercase, 1lowercase, 1number and 1special character"
    );
  }

  // @desc check if password1 = password2

  if (password !== confirm_password) {
    res.status(401);
    throw new Error("password not match");
  }

  try {
    // @desc check if username already exist
    const usernameExist = await userSchema.findOne({ username: username });
    const emailExist = await userSchema.findOne({ email: email });
    if (usernameExist) {
      res.status(401);
      throw new Error("username already exist");
    }

    // @desc check if email already exist
    else if (emailExist) {
      return res.status(401).json({
        message: "email already exist",
      });
    } else {
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async (err, hash) => {
          crypto.randomBytes(48, async (err, buffer) => {
            let token = buffer.toString("hex");
            if (err) console.log(err);

            let newUser = await new userSchema({
              username,
              email,
              fullname,
              password: hash,
              phone_no,
              company_name,
            }).save();

            if (newUser) {
              let { _id, username, email, fullname, phone_no, company_name } =
                newUser;
              let user = {
                _id,
                username,
                email,
                fullname,
                phone_no,
                company_name,
              };

              let verifyUser = await new tokenSchema({
                email,
                token,
              }).save();

              sendEmail(
                email,
                "shopmedia registration",
                `
                <a href="http://localhost:5000/api/users/verify/${_id}/${token}">
                verify account
              </a>;
                `
              );

              return res.status(201).json({
                res: "ok",
                message: "Please click link sent to your email to complete your registration",
                user,
              });
            }
          });
        });
      });
    }
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// @desc: verify account
// @Route: /api/users/verify/:id/:token
// @Acess: public
exports.activateUser = asyncHandler(async (req, res) => {
  try {
    const user = await userSchema.findById({ _id: req.params.id });

    if (!user) {
      res.status(401);
      throw new Error("invalid link");
    }
    if (user.status) {
      res.status(201);
      throw new Error("email already verified");
    }

    const token = await tokenSchema.findOne({
      userId: req.params.id,
      token: req.params.token,
    });
    if (!token) {
      res.status(401);
      throw new Error("invalid link");
    }

    let updateUser = await userSchema.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: true } },
      { new: true }
    );
    console.log(updateUser);

    if (updateUser.status === true) {
      token.remove();
      return res.status(201).json({
        message: "email verified successfull",
      });
    }
  } catch (error) {
    res.status(501);
    throw new Error(error.message);
  }
});

// @desc: login account
// @Route: /api/users/login
// @Acess: public

exports.loginUser = asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;

  console.log(req.body);
  if (!email || !password) {
    res.status(401);
    throw new Error("Please fill all field");
  }

  // check if user enter valid email
  function validateEmail(email) {
    const regex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  }
  if (!validateEmail(email)) {
    res.status(401);
    throw new Error("please enter a valid email");
  }

  

  passport.authenticate("local", function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        message: "Email or password not correct",
      });
    }

    req.logIn(user, function (err) {
      if (err) {
        next(err);
        res.status(401);
        throw new Error("Email or password not correct");
      }

      let { _id, username, email, fullname, phone_no, company_name } = user;
      let users = {
        _id,
        username,
        email,
        fullname,
        phone_no,
        company_name,
      };
      return res.status(201).json({
        message: `logged in ${req.user.username}`,
        isAuthenticated: true,
        res: "ok",
        users,
      });
    });
  })(req, res, next);
});

// @desc: logout account
// @Route: /api/users/logout
// @Acess: public

exports.logoutUser = (req, res) => {
  req.logOut(function (err) {
    if (err) console.log(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
      });
      res.status(201).json({
        message: "you successfully logout",
      });
    });
  });
};

// @desc: forget password
// @Route: /api/users/forgot-password
// @Acess: public

exports.forgetPassword = asyncHandler(async (req, res) => {
  let { email } = req.body;
  if (!email) {
    res.status(401);
    throw new Error("this field is require");
  }

  // check if user enter valid email
  function validateEmail(email) {
    const regex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  }
  if (!validateEmail(email)) {
    res.status(401);
    throw new Error("please enter a valid email");
  }

  const user = await userSchema.findOne({ email: email });
  if (user) {
    crypto.randomBytes(48, async (err, buffer) => {
      let token = buffer.toString("hex");
      if (err) console.log(err);

     let updateUser = await userSchema.findOneAndUpdate({email:email}, {$set:{token:token}},{new:true})

     if(updateUser){

     
          sendEmail(
            email,
            "shopmedia forget-password",
            `
            <div>
            <h2>Reset your password for Shopmedia.ng</h2>
            <br>
            <p>Follow this link to reset your shopmedia.ng password for your ${email} account.</p>
            <a href="http://localhost:5000/api/users/reset-password/${user._id}/${token}">
            http://localhost:5000/api/users/reset-password/${user._id}/${token}
            </a>;
            <p>If you didn’t ask to reset your password, you can ignore this email.
            <br>
    
            Thanks,
            <br>
            
            Shopmedia.ng</p>
            </div>
    
        `
          );
          res.status(201).json({
            message:
              " Please following the instructions sent to your email to complete reseting your password.",
          });
        
      
        } 
     
    });
  } else {
    res.status(401);
    throw new Error(
      "There is no user record corresponding to this identifier. The user may have been deleted"
    );
  }
});


// @desc: reset password
// @Route: /api/users/reset-password
// @Acess: public
exports.resetPassword = asyncHandler(async (req, res) => {
  let {password} = req.body

  if(!password){
    res.status(401);
    throw new Error("Enter your password");
  }
  // @desc check if user enter strong password
  function validatePassword(password) {
    const regex =
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])([a-zA-Z0-9@$!%*?&]{8,})$/;
    return regex.test(password);
  }
  if (!validatePassword(password)) {
    res.status(401);
    throw new Error(
      "invalid password!!! password must contain 1uppercase, 1lowercase, 1number and 1special character"
    );
  }

  

  try {
    const user = await userSchema.find({
      
      $and: [
        {
          id: req.params.id,
          token: req.params.token,
        },
      ],
   });

    if (user.length > 0) {
     
    
    console.log(user);
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async (err, hash) => {
  
    let resetPassword = await userSchema.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { password: hash, token:'' } },
      { new: true }
    );
    if(resetPassword){
      res.status(201).json({
        message:
          " Password changed \n You can now sign in with your new password.",
      });
    }
  });
});
}else{
  res.status(401);
  throw new Error("Try resetting your password again <br/> Your request to reset your password has expired or the link has already been used");
  
}
}


    catch (error) {
      res.status(501);
      throw new Error(error.message);
    }
})

//@desc: change password
//@access: private
//@method: put
//@route: /api/users/password/:id
exports.ChangePassword = asyncHandler(async (req, res) => {
  let { oldpassword, password, confirm_password } = req.body;
    if(!oldpassword|| !password|| !confirm_password){
      res.status(401);
      throw new Error("please fill all field");
    }

   // @desc check if user enter strong password
   function validatePassword(password) {
    const regex =
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])([a-zA-Z0-9@$!%*?&]{8,})$/;
    return regex.test(password);
  }
  if (!validatePassword(password)) {
    res.status(401);
    throw new Error(
      "invalid password!!! password must contain 1uppercase, 1lowercase, 1number and 1special character"
    );
  }
  if (password !== confirm_password) {
    res.status(401);
    throw new Error("password not match");
  }
  const user = await userSchema.findOne({ _id: req.params.id });
  if (user) {
    try {
      bcrypt.compare(oldpassword, user.password, (err, isMatch) => {
        if (!isMatch) {
          res.send("old password not matched");
        }
        if (isMatch) {
          bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async (errr, hash) => {
              
            
              let update = await userSchema.findOneAndUpdate(
                { _id: req.params.id },
                { $set: { password: hash || user.password } },
                { new: true }
              );
              if (!update) {
                // res.send("unable to update pass");
                res.status(401).json({
                  message: "unable to update  password ",
                });
              } else {
                res.status(201).json({
                  message: " password updated successfully",

                });
              }
            });
          });
        }
      });
    } catch (error) {
      res.status(501);
      throw new Error(error.message);
    }
  } else {
    res.status(401);
    throw new Error("user not found");
  }
});

//@desc: update user profile img
//@access: private
//@method: put
//@route: /api/users/upload-profile-img
exports.uploadProfilePic = asyncHandler(async(req, res)=>{
  if(!req.file){
    res.status(401)
    throw new Error("please choose a file")
  }

  console.log(req.file)
  const users = await userSchema.findById(req.params.id)
   if(users.pic.length < 0){
     await cloudinary.uploader.destroy(users[0].img_id)

   }
   
  try {
    await sharp(req.file.path)
    .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .resize(200, 200)
    .png({quality:90, force: true})
    // .toFile(`./public/img/user${req.file.filename}.png`);
    
    let uploadImg = await cloudinary.uploader.upload(req.file.path)

    fs.unlinkSync(req.file.path);
    if(uploadImg){
      let profileImg = {
        img_id:uploadImg.public_id,
        img:uploadImg.secure_url
      }
      console.log(profileImg)
      let updateProfile = await userSchema.findOneAndUpdate({_id:req.params.id}, {$set:{pic:[profileImg]}}, {new:true})

      if(updateProfile){
        res.status(201).json({
          message:"profile img updated successfully"
        })
      }else{
        fs.unlinkSync(req.file.path);
        res.status(401)
    throw new Error("unable to update profile")

      }
    }else{
      fs.unlinkSync(req.file.path);

    }
        
     
  } catch (error) {
    fs.unlinkSync(req.file.path);
    res.status(401)
    throw new Error(error.message)
  }
})