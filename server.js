const express = require("express");
require("dotenv").config();
require("colors");
const DB = require("./config/db");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const advertRoutes = require("./routes/advertRoutes");
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
app.use(errorHandler);
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
app.use("/api/advert", advertRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server started on PORT ${PORT}`.red.bold));
