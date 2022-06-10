const express = require("express");
require("dotenv").config();
require("colors");
const DB = require("./config/db");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const { errorHandler } = require("./config/errorMiddleWares");
const cors = require("cors");
const app = express();

//@ desc: middlewares
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//@desc: custom error middlewares
app.use(errorHandler);
// @desc:DATABASE INITIALIZATION
DB();

//@desc: Routes
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server started on PORT ${PORT}`.red.bold));
