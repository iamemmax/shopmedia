const userSchema = require("../../model/users/UserSchema");
const tokenSchema = require("../../model/users/tokenSchema");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const passport = require("passport");
const fs = require("fs");
const cloudinary = require("../../config/cloudinary");
const sendEmail = require("../../helper/email");
const validateEmail = require("../../helper/emailValidate");
const jwt = require("jsonwebtoken");
const compressImg = require("../../helper/sharp");
// const welcomeEmail = require("../../helper/Email Template/welcomeEmail")
const { searchUser } = require("../../helper/search")

// @desc: create account
// @Route: /api/users/register
// @Acess: publicu
exports.createUser = asyncHandler(async (req, res) => {
  let { username, email, fullname, password, phone_no, company_name } =
    req.body;
  console.log(company_name)

  //@desc: check if users fill all field

  if (!username || !email || !fullname || !password || !phone_no) {

    return res.status(401).json({
      message: "All fields are required",
    });
  }
  // @desc check if user enter valid email
  validateEmail(res, email);

  try {
    // @desc check if username already exist
    const usernameExist = await userSchema.findOne({ username: username });
    const emailExist = await userSchema.findOne({ email: email });
    // const companyExist = await userSchema.findOne({company_name:company_name });




    if (usernameExist) {
      return res.status(401).json({
        message: "Company already exists",
      });
    }

    // @desc check if email already exist
    else if (emailExist) {
      return res.status(401).json({
        message: "Email already linked to another user",
      })


    } else {
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async (err, hash) => {
          crypto.randomBytes(20, async (err, buffer) => {
            let token = buffer.toString("hex");
            if (err) console.log(err);

            let newUser = await new userSchema({
              user_id: `user_id_${token}`,
              username,
              email,
              fullname,
              password: hash,
              phone_no,
              company_name,
            }).save();

            if (newUser) {
              let {
                user_id,
                username,
                email,
                fullname,
                phone_no,
                company_name,
                verified,
              } = newUser;
              let user = {
                user_id,
                username,
                email,
                fullname,
                phone_no,
                company_name,
                verified,
              };

              await new tokenSchema({
                email,
                token,
              }).save();

              sendEmail(
                email,
                "Verify Your Email",
                `
                
<!doctype html>
<html lang="en">

<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymous">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500&display=swap"
        rel="stylesheet">


    <title>ShopMedia - Email</title>


    <style>
        a:focus {
            outline: 0 solid
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin: 0 0 15px;
            color: #1B1B21;
        }


        body {
            color: #1E1F20;
            font-weight: 400;
            font-family: 'DM Sans', sans-serif;
            max-width: 599px;
            margin: 0 auto;
        }


        .selector-for-some-widget {
            box-sizing: content-box;
        }

        a:hover {
            text-decoration: none
        }
.flex-center{
display: flex !important;
align-items:center !important;
justify-content: center !important;

}
        /*--------------- Header area start ----------------*/
        .header {
            background: #000;
            padding: 10px 10px;
            height: 55px; 
        }
        
        .header img {
	        max-width: 190px !important;
            display: block !important;
            margin: 0 auto !important;
	    margin-top: 12px !important;
        }

        /*--------------- Header area end ----------------*/



        /*--------------- Mail area start ----------------*/
        .mail-area {
            padding-top: 50px;
            padding-bottom: 50px;
            background: #fff;
        }

        .mail-wrapper {
            padding: 0 30px;
        }

        .mail-wrapper h3 {
            font-weight: 700;
            font-size: 30px;
            line-height: 39px;
            text-align: center;
            letter-spacing: -0.02em;
            color: #000000;
            margin-bottom: 0;
        }

        .mail-wrapper h3 a {
            color: #EBAA24;
            text-decoration: none;
            display: inline-block;
        }

        .email-thumb {
            max-width: 388px;
            margin: 0 auto;
            margin-bottom: 30px;
        }

        .mail-wrapper p {
            font-size: 15px;
            margin-bottom: 23px;
        }

        .mail-wrapper li {
            font-size: 15px;
            margin-bottom: 17px;
        }

        .mail-btn a {
            font-weight: 500;
            font-size: 13px;
            line-height: 17px;
            letter-spacing: -0.02em;
            color: #000000;
            display: inline-block;
            text-decoration: none;
            background: #EBAA24;
            border-radius: 5px;
            padding: 10px 30px;
        }

        .mail-btn {
            padding-top: 5px;
        }

        /*--------------- Mail area end ----------------*/


        /*--------------- Footer area start ----------------*/
        .footer p {
            font-weight: 500;
            font-size: 9px;
            line-height: 12px;
            text-align: center;
            letter-spacing: -0.0em;
            color: #FFFFFF;
            margin-bottom: 5px;
        }

        .footer {
            text-align: center;
            padding: 18px 30px;
            background: #000000;
            color: #fff;
        }

        .footer p b {
            font-weight: 700;
            font-size: 10px;
            line-height: 1.2;
            padding-top: 8px;
            display: block;
        }

        .footer-social a {
            display: inline-block;
            max-width: 20px;
            margin: 0 5px;
        }

        .footer-social {
            padding-bottom: 24px;
        }

        .footer p a {
            color: #EBAA24;
            text-decoration: none;
        }

        /*--------------- Footer area end ----------------*/



        /*--------------- Responsive area start ----------------*/
        @media screen and (max-width: 575px) {
            .mail-wrapper {
                padding: 0 10px;
            }

            .mail-wrapper h3 {
                font-size: 25px;
                line-height: 29px;
            }


        }

        /*--------------- Responsive area end ----------------*/
    </style>








</head>

<body style="max-width: 590px; margin: 0 auto">




    <!--------- Header area start --------->
    <header class="header" style="text-align: center">
        <div class="header-logo" style="text-align: center">
             <img src="https://mail.shopmedia.ng/images/png/rsz_12shopmedia_logo_yellow.png" alt=""> 
        </div>
    </header>
    <!--------- Header area end --------->



    <!--------- Main area start --------->
    <main class="main">


        <!--------- Mail area start --------->
        <section class="mail-area">
            <div class="container">
                <div class="mail-wrapper">
		
                    
                    <p>Hi ${username},</p>
                    <p>Please click the button below to verify your email address.
                    </p>

                    <div class="mail-btn text-center " style="text-align: center">
                    <a href="https://shopmedia.ng/${user_id}/${token}"> Verify your email</a> 
                    </div>

                    <p>If you did not create an account, no further action is required.</p>

                    <p>Regards, <br>
                       ShopMedia Team</p>
                    
                </div>
            </div>
        </section>
        <!--------- Mail area end --------->



    </main>
    <!--------- Main area end --------->




    <!--------- Footer area start --------->
    <footer class="footer">
        <div class="container">
            <div class="footer-social d-flex justify-content-center align-items-center">
                <a href=""><img src="https://mail.shopmedia.ng/social-icon/facebook.png" alt=""></a>
                <a href=""><img src="https://mail.shopmedia.ng/social-icon/instagram.png" alt=""></a>
                <a href=""><img src="https://mail.shopmedia.ng/social-icon/twitter.png" alt=""></a>
            </div>
            <p><i>Copyright 2022 Shopmedia , All right reserved.</i></p>
            <p class="sm">You are receiving this email because you opted in via our website.</p>
            <p><b>Our mailling address is</b></p>
            <p>Shopmedia Limited</p>
            <p>Plot 856, Oluawotesu Street</p>
            <p>Jabi, Abuja</p>
            <p>Nigeria</p>
            <br>
            <p>You can <a href="">unsubscribe</a> from this email or change your email notifications.</p>
        </div>
    </footer>
    <!--------- Footer area end --------->







    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/popper.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-pprn3073KE6tl6bjs2QrFaJGz5/SUsLqktiwsUTF55Jfv3qYSDhgCecCxMW52nD2"
        crossorigin="anonymous"></script>

</body>

</html>
                `
              );
              sendEmail(
                email,
                "Welcome to ShopMedia.ng",
                ` 
                <!doctype html>
                <html lang="en">
                
                <head>
                    <!-- Required meta tags -->
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                
                    <!-- Bootstrap CSS -->
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
                        integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymous">
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500&display=swap"
                        rel="stylesheet">
                
                
                    <title>ShopMedia - Email</title>
                
                
                    <style>
                        a:focus {
                            outline: 0 solid
                        }
                
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                
                        h1,
                        h2,
                        h3,
                        h4,
                        h5,
                        h6 {
                            margin: 0 0 15px;
                            color: #1B1B21;
                        }
                
                
                        body {
                            color: #1E1F20;
                            font-weight: 400;
                            font-family: 'DM Sans', sans-serif;
                            max-width: 599px;
                            margin: 0 auto;
                        }
                
                
                        .selector-for-some-widget {
                            box-sizing: content-box;
                        }
                
                        a:hover {
                            text-decoration: none
                        }
                
                        /*--------------- Header area start ----------------*/
			.header {
			    background: #000;
			    padding: 10px 10px;
			    height: 55px; 
			}

			.header img {
				max-width: 190px !important;
			    display: block !important;
			    margin: 0 auto !important;
			    margin-top: 12px !important;
			}

                        /*--------------- Header area end ----------------*/
                
                
                
                        /*--------------- Mail area start ----------------*/
                        .mail-area {
                            padding-top: 50px;
                            padding-bottom: 50px;
                            background: #fff;
                        }
                
                        .mail-wrapper {
                            padding: 0 30px;
                        }
                
                        .mail-wrapper h3 {
                            font-weight: 700;
                            font-size: 30px;
                            line-height: 39px;
                            text-align: center;
                            letter-spacing: -0.02em;
                            color: #000000;
                            margin-bottom: 0;
                        }
                
                        .mail-wrapper h3 a { 
                            color: #EBAA24;
                            text-decoration: none;
                            display: inline-block;
                        }
                
                        .email-thumb {
                            max-width: 388px;
                            margin: 0 auto;
                            margin-bottom: 30px;
                        }
                
                        .mail-wrapper p {
                            font-size: 15px;
                            margin-bottom: 23px;
                        }
                
                        .mail-wrapper li {
                            font-size: 15px;
                            margin-bottom: 17px;
                        }
                
                        .mail-btn a {
                            font-weight: 500;
                            font-size: 13px;
                            line-height: 17px;
                            letter-spacing: -0.02em;
                            color: #000000;
                            display: inline-block;
                            text-decoration: none;
                            background: #EBAA24;
                            border-radius: 5px;
                            padding: 10px 30px;
                        }
                
                        .mail-btn {
                            padding-top: 5px;
                        }
                
                        /*--------------- Mail area end ----------------*/
                
                
                        /*--------------- Footer area start ----------------*/
                        .footer p {
                            font-weight: 500;
                            font-size: 9px;
                            line-height: 12px;
                            text-align: center;
                            letter-spacing: -0.0em;
                            color: #FFFFFF;
                            margin-bottom: 5px;
                        }
                
                        .footer {
                            text-align: center;
                            padding: 18px 30px;
                            background: #000000;
                            color: #fff;
                        }
                
                        .footer p b {
                            font-weight: 700;
                            font-size: 10px;
                            line-height: 1.2;
                            padding-top: 8px;
                            display: block;
                        }
                
                        .footer-social a {
                            display: inline-block;
                            max-width: 20px;
                            margin: 0 5px;
                        }
                
                        .footer-social {
                            padding-bottom: 24px;
                        }
                
                        .footer p a {
                            color: #EBAA24;
                            text-decoration: none;
                        }
                
                        /*--------------- Footer area end ----------------*/
                
                
                
                        /*--------------- Responsive area start ----------------*/
                        @media screen and (max-width: 575px) {
                            .mail-wrapper {
                                padding: 0 10px;
                            }
                
                            .mail-wrapper h3 {
                                font-size: 25px;
                                line-height: 29px;
                            }
                
                
                        }
                
                        /*--------------- Responsive area end ----------------*/
                    </style>
                
                
                
                
                
                
                
                
                </head>
                
                <body style="max-width: 590px; margin: 0 auto">
                
                 
                    
		
		    <!--------- Header area start --------->
		    <header class="header" style="text-align: center">
			<div class="header-logo" style="text-align: center">
			     <img src="https://mail.shopmedia.ng/images/png/rsz_12shopmedia_logo_yellow.png" alt=""> 
			</div>
		    </header>
		    <!--------- Header area end --------->
                
                
                
                    <!--------- Main area start --------->
                    <main class="main">
                
                
                        <!--------- Mail area start --------->
                        <section class="mail-area">
                            <div class="container">
                                <div class="mail-wrapper">
                                    <h3>Welcome to <a href=""><strong>ShopMedia.ng</a></h3>
                                    <div class="email-thumb">
                                        <img src="https://tomal.dev/shopMedia/images/email-thumb.png" alt="">
                                    </div>
                                    <p>Hi ${username},</p>
                                    <p>Here's a big hug from all of us at ShopMedia. We want to thank you for signing up on the Shopmedia
                                        platform, we’re delighted to have you on board.</p>
                                    <p>You join thousands of Companies across Africa, using our digital platform and infrastructure to
                                        enable their businesses access seamless advertisement services from all over Africa.</p>
                                    <p>We have built a modern platform that handles all your business advertisement needs on the go,
                                        allowing you to focus on other important aspects of the business.
                                    </p>
                                    <p class="mb-2">With ShopMedia, you can perform an array of activities:</p>
                                    <ul>
                                        <li> You can create Media plans based on your budget using our live data and prices. </li>
                                        <li>Find Advert spaces for Billboards, Radio, Newspaper, Television etc</li>
                                        <li> Negotiate prices of the spaces directly with the media owners, thereby optimizing your
                                            campaign budget</li>
                                        <li> Book the advert spaces you have selected.</li>
                                    </ul>
                                    <p>We care about you and your business, reach out to us via email at hi@shopmedia.ng, or via a
                                        phone call at +234 (90)-231-423-36.</p>
                                    <p>We are taking your business beyond borders.</p>
                                    <p>Warmest Regards, <br>
                
                                        ShopMedia Team</p>
                
                                    <div class="mail-btn text-center"  style="text-align: center">
                                         <a href="https://shopmedia.ng">Get Started</a>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <!--------- Mail area end --------->
                
                
                
                    </main>
                    <!--------- Main area end --------->
                
                
                
                
                    <!--------- Footer area start --------->
                    <footer class="footer">
                        <div class="container">
                            <div class="footer-social flex-center">
                                <a href=""><img src="https://mail.shopmedia.ng/social-icon/facebook.png" alt=""></a>
                                <a href=""><img src="https://mail.shopmedia.ng/social-icon/instagram.png" alt=""></a>
                                <a href=""><img src="https://mail.shopmedia.ng/social-icon/instagram.png" alt=""></a>
                            </div>
                            <p><i>Copyright 2022 Shopmedia , Allright reserved.</i></p>
                            <p class="sm">You are receiving this email because you opted in via our website.</p>
                            <p><b>Our mailling address is</b></p>
                            <p>Shopmedia Limited</p>
                            <p>Plot 856, Oluawotesu Street</p>
            			<p>Jabi, Abuja</p>
            			<p>Nigeria</p>
                            <br>
                            <p>You can <a href="">unsubscribe</a> from this email or change your email notifications.</p>
                        </div>
                    </footer>
                    <!--------- Footer area end --------->
                
                
                
                
                
                
                
                    <script src="assets/js/jquery.min.js"></script>
                    <script src="assets/js/popper.js"></script>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js"
                        integrity="sha384-pprn3073KE6tl6bjs2QrFaJGz5/SUsLqktiwsUTF55Jfv3qYSDhgCecCxMW52nD2"
                        crossorigin="anonymous"></script>
                
                </body>
                
                </html>`
              );

              return res.status(201).json({
                res: "ok",
                message:
                  "Please click on the link sent to your email to complete your registration",
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
// @Route: /api/users/verify/:user_id/:token
// @Acess: public
exports.activateUser = asyncHandler(async (req, res) => {
  try {
    const user = await userSchema.findOne({ user_id: req.params.user_id });

    if (!user) {
      res.status(401);
      throw new Error("Invalid link");
    }
    if (user.status) {
      res.status(201);
      throw new Error("Email already verified");
    }

    const token = await tokenSchema.findOne({
      userId: req.params.user_id,
      token: req.params.token,
    });
    if (!token) {
      res.status(401);
      throw new Error("Invalid link");
    }

    let userFound = await userSchema.findOneAndUpdate(
      { user_id: req.params.user_id },
      { $set: { verified: true, token: "" } },
      { new: true }
    );

    if (userFound.verify === true) {
      token.remove();
      res.status(201).json({
        message: "Email verified successfully",
      });

      //@desc:notify admin of new user
      await userSchema.updateMany({
        $and: [

          { roles: "admin" },
          { roles: "super admin" },
        ]
      },

        { $push: { notification: { message: `${req.user.fullname} just  joined shopmedia`, notifiedAt: Date.now() } } }, { new: true }).sort("asc")

    }
  } catch (error) {
    res.status(501);
    throw new Error(error.message);
  }
});

// @desc: login account
// @Route: /api/users/login
// @Acess: public

exports.loginUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    res.status(401);
    throw new Error("All fields are required");
  }

  // check if user enter valid email
  validateEmail(res, email);

  const user = await userSchema.findOne({ email });
  const userInfo = await userSchema
    .findOne({ email })
    .select("-password -__v -token -notification");
  if (!user) {
    res.status(401);
    throw new Error("Incorrect email or password");
  }

  try {
    //desc:match password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(401).json({
          res: "failed",
          message: "Incorrect email or password",
        });
      }
      if (isMatch) {
        if (user.verified === false) {
          return res.status(200).json({
            res: "failed",
            message:
              "Account not verifed.\n Please check your email(promotions folder) for verification link.",
          });
        }
        const token = jwt.sign({ user }, process.env.JWT_SECRETE, {
          expiresIn: "24h",
        });
        return res.status(200).json({
          message: "Login successful",
          userInfo,
          token,
        });
      } else {
        return res.status(401).json({
          message: "Incorrect email or password",
        });
      }
    });
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
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
        message: "You've successfully logged out",
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
    throw new Error("This field is required");
  }

  // check if user enter valid email
  validateEmail(res, email);

  const user = await userSchema.findOne({ email: email });
  if (user.verified === false) {
    return res.status(200).json({
      res: "failed",
      message:
        "Account not verified. \n Please check your email (promotions folder) for verification link.",
    });
  }
  if (user) {
    crypto.randomBytes(48, async (err, buffer) => {
      let token = buffer.toString("hex");
      if (err) console.log(err);

      let userFound = await userSchema.findOneAndUpdate(
        { email: email },
        { $set: { token: token } },
        { new: true }
      );

      if (userFound) {
        sendEmail(
          email,
          "Reset your password",

          `
    
                
        <!doctype html>
        <html lang="en">
        
        <head>
            <!-- Required meta tags -->
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
        
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
                integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymous">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500&display=swap"
                rel="stylesheet">
        
        
            <title>ShopMedia - Email</title>
        
        
            <style>
                a:focus {
                    outline: 0 solid
                }
        
                img {
                    max-width: 100%;
                    height: auto;
                }
        
                h1,
                h2,
                h3,
                h4,
                h5,
                h6 {
                    margin: 0 0 15px;
                    color: #1B1B21;
                }
        
        
                body {
                    color: #1E1F20;
                    font-weight: 400;
                    font-family: 'DM Sans', sans-serif;
                    max-width: 599px;
                    margin: 0 auto;
                }
        
        
                .selector-for-some-widget {
                    box-sizing: content-box;
                }
        
                a:hover {
                    text-decoration: none
                }
        
                /*--------------- Header area start ----------------*/
                .header {
                    background: #000;
                    padding: 10px 10px;
                    height: 55px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
        
                /*--------------- Header area end ----------------*/
        
        
        
                /*--------------- Mail area start ----------------*/
                .mail-area {
                    padding-top: 50px;
                    padding-bottom: 50px;
                    background: #fff;
                }
        
                .mail-wrapper {
                    padding: 0 30px;
                }
        
                .mail-wrapper h3 {
                    font-weight: 700;
                    font-size: 30px;
                    line-height: 39px;
                    text-align: center;
                    letter-spacing: -0.02em;
                    color: #000000;
                    margin-bottom: 0;
                }
        
                .mail-wrapper h3 a {
                    color: #EBAA24;
                    text-decoration: none;
                    display: inline-block;
                }
        
                .email-thumb {
                    max-width: 388px;
                    margin: 0 auto;
                    margin-bottom: 30px;
                }
        
                .mail-wrapper p {
                    font-size: 15px;
                    margin-bottom: 23px;
                }
        
                .mail-wrapper li {
                    font-size: 15px;
                    margin-bottom: 17px;
                }
        
                .mail-btn a {
                    font-weight: 500;
                    font-size: 13px;
                    line-height: 17px;
                    letter-spacing: -0.02em;
                    color: #000000;
                    display: inline-block;
                    text-decoration: none;
                    background: #EBAA24;
                    border-radius: 5px;
                    padding: 10px 30px;
                }
        
                .mail-btn {
                    padding-top: 5px;
                }
        
                /*--------------- Mail area end ----------------*/
        
        
                /*--------------- Footer area start ----------------*/
                .footer p {
                    font-weight: 500;
                    font-size: 9px;
                    line-height: 12px;
                    text-align: center;
                    letter-spacing: -0.0em;
                    color: #FFFFFF;
                    margin-bottom: 5px;
                }
        
                .footer {
                    text-align: center;
                    padding: 18px 30px;
                    background: #000000;
                    color: #fff;
                }
        
                .footer p b {
                    font-weight: 700;
                    font-size: 10px;
                    line-height: 1.2;
                    padding-top: 8px;
                    display: block;
                }
        
                .footer-social a {
                    display: inline-block;
                    max-width: 20px;
                    margin: 0 5px;
                }
        
                .footer-social {
                    padding-bottom: 24px;
                }
        
                .footer p a {
                    color: #EBAA24;
                    text-decoration: none;
                }
        
                /*--------------- Footer area end ----------------*/
        
        
        
                /*--------------- Responsive area start ----------------*/
                @media screen and (max-width: 575px) {
                    .mail-wrapper {
                        padding: 0 10px;
                    }
        
                    .mail-wrapper h3 {
                        font-size: 25px;
                        line-height: 29px;
                    }
        
        
                }
        
                /*--------------- Responsive area end ----------------*/
            </style>
        
        
        
        
        
        
        
        
        </head>
        
        <body>
        
        
        
        
            <!--------- Header area start --------->
            <header class="header" style="display:flex; align-items: center; justify-content: center">
			<div class="header-logo flex-center" style="display:flex; align-items: center; justify-content: center">
			    <a href="" class="flex-center" style="display:flex; align-items: center; justify-content: center"><img src="https://mail.shopmedia.ng/images/png/rsz_12shopmedia_logo_yellow.png" alt=""></a>
			</div>
		    </header>
            <!--------- Header area end --------->
        
        
        
            <!--------- Main area start --------->
            <main class="main">
        
        
                <!--------- Mail area start --------->
                <section class="mail-area">
                    <div class="container">
                        <div class="mail-wrapper">
                            <h4><Strong>Reset your Password</Strong> </h4>
                            <p>Hi ${user.username},</p>
                            <p>Someone (hopefully you) has requested a password reset for your ShopMedia account. Follow
                            the link below to set a new password:
                            </p>
        
                            <p>Follow this link to reset your shopmedia.ng password for your ${email} account.</p>


                            <div class="mail-btn text-center pb-4">
                            <a href="https://shop-media-master-danny-flames.vercel.app/api/users/reset-password/${user.user_id}/${token}">

                            <div class="mail-btn text-center flex-center"  style="display: flex; align-items: center; justify-content: center">
                            <a href="https://shopmedia-api.herokuapp.com/api/users/reset-password/${user.user_id}/${token}">

                          Reset password</a>
                                
                            </div>
        
                           <p>If you do not wish to reset your password, kindly disregard this email and no action will be taken.</p>
        
                            <p>Regards, <br>
                                ShopMedia Team</p>
                            <p><a href="https://shopmedia.ng" class="text-dark text-decoration-none">https://shopmedia.ng/</a></p>
                        </div>
                    </div>
                </section>
                <!--------- Mail area end --------->
        
        
        
            </main>
            <!--------- Main area end --------->
        
        
        
        
             <!--------- Footer area start --------->
                    <footer class="footer">
                        <div class="container">
                            <div class="footer-social flex-center">
                                <a href=""><img src="https://mail.shopmedia.ng/social-icon/facebook.png" alt=""></a>
                                <a href=""><img src="https://mail.shopmedia.ng/social-icon/instagram.png" alt=""></a>
                                <a href=""><img src="https://mail.shopmedia.ng/social-icon/instagram.png" alt=""></a>
                            </div>
                            <p><i>Copyright 2022 Shopmedia , Allright reserved.</i></p>
                            <p class="sm">You are receiving this email because you opted in via our website.</p>
                            <p><b>Our mailling address is</b></p>
                            <p>Shopmedia Limited</p>
                            <p>Plot 856, Oluawotesu Street</p>
            			<p>Jabi, Abuja</p>
            			<p>Nigeria</p>
                            <br>
                            <p>You can <a href="">unsubscribe</a> from this email or change your email notifications.</p>
                        </div>
                    </footer>
                    <!--------- Footer area end --------->
        
        
        
        
        
        
            <script src="assets/js/jquery.min.js"></script>
            <script src="assets/js/popper.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js"
                integrity="sha384-pprn3073KE6tl6bjs2QrFaJGz5/SUsLqktiwsUTF55Jfv3qYSDhgCecCxMW52nD2"
                crossorigin="anonymous"></script>
        
        </body>
        
        </html>
                        `
        );
        res.status(201).json({
          message:
            " Please follow the instructions sent to your email to complete reseting your password.",
        });
      }
    });
  } else {
    res.status(401);
    throw new Error(
      "There is no user record corresponding to the information submitted. Please double-check that all information submitted are accurate"
    );
  }
});

// @desc: reset password
// @Route: /api/users/reset-password
// @Acess: public
exports.resetPassword = asyncHandler(async (req, res) => {
  let { password } = req.body;

  if (!password) {
    res.status(401);
    throw new Error("Enter your password");
  }

  try {
    const user = await userSchema.find({
      $and: [
        {
          user_id: req.params.user_id,
          token: req.params.token,
        },
      ],
    });

    if (user.length > 0) {
      console.log(user);
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async (err, hash) => {
          let resetPassword = await userSchema.findOneAndUpdate(
            { user_id: req.params.user_id },
            { $set: { password: hash, token: "" } },
            { new: true }
          );
          if (resetPassword) {
            res.status(201).json({
              message:
                " Password changed successfully \n You can now sign in with your new password.",
            });
          }
        });
      });
    } else {
      res.status(401);
      throw new Error(
        "Try resetting your password again \n Your request to reset your password has expired or the link has already been used"
      );
    }
  } catch (error) {
    res.status(501);
    throw new Error(error.message);
  }
});

//@desc: change password
//@access: private
//@method: put
//@route: /api/users/change-password/user_id
exports.ChangePassword = asyncHandler(async (req, res) => {
  let { oldpassword, new_password, confirm_pass } = req.body;

  if (!oldpassword || !new_password || !confirm_pass) {
    return res.status(401).json({
      res: "failed",
      message: "All fields are required",
    });
  }
  if (new_password !== confirm_pass) {
    return res.status(401).json({
      res: "failed",
      message: "Password does not match",
    });
  }
  try {

    const { password } = await userSchema
      .findOne({ user_id: req.params.user_id })
      .select("password");
    // if (user) {
    if (password) {
      bcrypt.compare(oldpassword, password, (err, isMatch) => {
        if (err) {
          return res.status(401).json({
            res: "failed",
            message: "Old password does not match",
          });
        }
        if (isMatch) {
          bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(new_password, salt, async (err, hash) => {
              let update = await userSchema.findOneAndUpdate(
                { user_id: req.params.user_id },
                { $set: { password: hash || password } },
                { new: true }
              );
              if (!update) {
                res.send("unable to update pass");
                res.status(401).json({
                  message: "Unable to update password ",
                });
              } else {
                res.status(201).json({
                  res: "ok",
                  message: "Password changed successfully",
                });
              }
            });
          });
        } else {
          return res.status(401).json({
            res: "failed",
            message: "Old password does not match",
          });
        }
      });
    }
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }

});

//@desc: update user profile img
//@access: private
//@method: put
//@route: /api/users/upload-profile-img
exports.uploadProfilePic = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(401);
    throw new Error("Please select a file");
  }

  console.log(req.file);
  const users = await userSchema.findOne({ user_id: req.params.user_id });
  //  if(users.pic.length > 0){
  //  }

  try {
    compressImg(req.file.path, 100, 100);

    let uploadImg = await cloudinary.uploader.upload(req.file.path, {
      eager: [{ width: 100, height: 100 }],
    });

    fs.unlinkSync(req.file.path);
    if (uploadImg) {
      let profileImg = {
        img_id: uploadImg.public_id,
        img: uploadImg.eager[0].secure_url,
      };
      console.log(profileImg);
      let updateProfile = await userSchema
        .findOneAndUpdate(
          { user_id: req.params.user_id },
          { $set: { pic: [profileImg] } },
          { new: true }
        )
        .select("-_id, -__v");

      if (updateProfile) {
        await cloudinary.uploader.destroy(users.pic[0]?.img_id);
        res.status(201).json({
          message: "Profile img updated successfully",
        });
      } else {
        fs.unlinkSync(req.file.path);
        res.status(401);
        throw new Error("Unable to update profile");
      }
    } else {
      fs.unlinkSync(req.file.path);
    }
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

//@desc: update user profile
//@access: private
//@method: put
//@route: /api/users/profile/update

exports.updateProfile = asyncHandler(async (req, res) => {
  let user = await userSchema
    .findOne({ user_id: req.params.user_id })
    .select("-password -__v -token -notification");
  let { firstname, lastname, fullname, phone_no } = req.body;

  try {
    if (user) {
      let updateUser = await userSchema.findOneAndUpdate(
        { user_id: req.params.user_id },
        {
          $set: {
            firstname: firstname || user.firstname,
            lastname: lastname || user.lastname,
            fullname: fullname || user.fullname,
            phone_no: phone_no || user.phone_no,
          },
        },
        { new: true }
      );
      if (updateUser) {
        res.status(201).json({
          res: "ok",
          message: "Profile updated successfully",
          data: updateUser,
        });
      } else {
        res.status(201).json({
          res: "failed",
          message: "Something went wrong, try agan later.",
        });
      }
    } else {
      res.status(201).json({
        res: "failed",
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// @desc: list users account
// @Route: /api/users
// @Acess: private(admin, super admin)

exports.listUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.pageNumber) || 1;
  const pageSize = 20; // total number of entries on a single page
  const count = await userSchema.countDocuments({});

  try {
    let users = await userSchema.find({ verified: true }, { __v: 0, notification: 0 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort("-createdAt");

    // @desc check if username already exist
    if (users.length > 0) {
      return res.status(201).json({
        res: "ok",
        total: count,
        pages: Math.ceil(count / pageSize),
        data: users,
      });
    } else {
      res.status(401);
      throw new Error("No registerd user in Database");
    }
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// @desc: remove users account
// @Route: /api/users/remove/user_id
// @Acess: private(admin, super admin)

exports.removeUsers = asyncHandler(async (req, res) => {
  try {

    const remove = await userSchema.findOneAndDelete({
      user_id: req.params.user_id,
    });
    if (remove) {
      return res.status(201).json({
        res: "ok",
        message: "User deleted successfully",
        data: remove,
      });
    } else {
      res.status(401);
      throw new Error("Unable to delete user");
    }
  } catch (error) {
    res.status(401);
    throw new Error(error.message);

  }
});

// @desc: create admin account
// @Route: /api/users/remove/user_id
// @Acess: private(super admin)

exports.createAdmin = asyncHandler(async (req, res) => {
  let users = await userSchema.findOne({ user_id: req.params.user_id });
  try {


    if (users) {
      if (users?.roles === "super admin") {
        return res.status(404).json({
          res: "failed",
          message: "Unable to create admin",
        });
      }

      let addAdmin = await userSchema
        .findOneAndUpdate(
          { user_id: req.params.user_id },
          { $set: { roles: req.body.roles } },
          { new: true }
        )
        .select("-password -__v -notification");
      if (addAdmin) {
        return res.status(201).json({
          res: "ok",
          message: "Admin created successfully",
          data: addAdmin,
        });
      } else {
        res.status(401);
        throw new Error("Unable to add admin");
      }
    } else {
      res.status(401);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// @desc: remove multiple users
// @Route: /api/users/remove/user_id
// @Acess: private(super admin, admin)

exports.removeMultipleUsers = asyncHandler(async (req, res) => {
  try {
    const multipleUsers = await userSchema.deleteMany({ username: { $in: [req.body.username] } })



    if (multipleUsers) {
      return res.status(201).json({
        res: "ok",
        message: "users deleted successfully",
        data: multipleUsers,
      });
    } else {
      res.status(401);
      throw new Error("Unable to delete users");
    }

  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});





// @desc: search for users
// @Route: /api/users//search
// @Acess: private(super admin, admin)

exports.searchAllUser = asyncHandler(async (req, res) => {

  try {
    searchUser(userSchema, req, res)

  } catch (error) {
    res.status(401);
    throw new Error(error.message);

  }
});



// @desc: search for users
// @Route: /api/users/notication
// @Acess: public

exports.listNotification = asyncHandler(async (req, res) => {
  const page = Number(req.query.pageNumber) || 1;
  const pageSize = 20;
  const { notification } = await userSchema.findOne({ _id: req.user._id })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort("-createdAt");

  try {

    res.status(201).json({
      res: "ok",
      total: notification.length,
      pages: Math.ceil(notification.length / pageSize),
      data: notification
    })
  } catch (error) {
    res.status(401);
    throw new Error(error.message);

  }
});


// @desc: remove notification when users clicked 
exports.removeNotification = asyncHandler(async (req, res) => {
  try {
    removeNotification = await userSchema.findByIdAndUpdate({ _id: req.user._id }, { $pull: { notification: { _id: req.params.id } } }, { new: true }).select("notification")
    if (removeNotification) {
      res.status(201).json({
        res: "ok",
        message: "notification removed successfully",
        data: removeNotification
      })
    }

  } catch (error) {
    res.status(401);
    throw new Error(error.message);

  }
})
