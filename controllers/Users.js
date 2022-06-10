const userSchema = require("../model/UserSchema");
const tokenSchema = require("../model/tokenSchema");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../config/email");


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
            }).save()

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
              message: "registration successfull",
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
// @Route: /api/users/register
// @Acess: public