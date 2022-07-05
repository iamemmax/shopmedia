const express = require("express");
require("dotenv").config();
require("colors");
const DB = require("./config/db");
const path = require("path");
const userRoutes = require("./routes/user/userRoutes");
const categoryRoutes = require("./routes/category/categoryRoutes");
const subCategoryRoutes = require("./routes/category/subCategoryRoutes");
const advertRoutes = require("./routes/advert/advertRoutes");
const searchRoutes = require("./routes/search/searchRoutes");
const businessRoutes = require("./routes/Bussiness/businessRoutes");
const paymentRoutes = require("./routes/payment/paymentRoutes")
const orderRoutes = require("./routes/order/order")
const Agency = require("./routes/Agency/pages");
const { errorHandler } = require("./config/errorMiddleWares");
const cors = require("cors");
const session = require("express-session")
const passport = require("passport")
 

const app = express();
//@ desc: middlewares
app.use(cors({credentials:true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//@desc: custom error middlewares
// @desc:DATABASE INITIALIZATION
DB();

app.use(
    session({
      secret: process.env.SECRETE,
      cookie: { maxAge: 3600000, path: "/" },
      resave: true,
      saveUninitialized: true,
    }),
  );
  
  
  //@desc : initializing passport 
  app.use(passport.initialize());
  app.use(passport.session());

//@desc : require passport config
require("./config/passport")(passport)

//@desc: Routes
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/advert", advertRoutes);
app.use("/api/sub-category", subCategoryRoutes);
app.use("/api/adpages", Agency);
app.use("/api/business", businessRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);

app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server started on PORT ${PORT}`.red.bold));
