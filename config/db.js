const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const DB = asyncHandler(async () => {
  const database = await mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  if (database) {
    console.log(`database connected ${database.connection.host}`.blue.bold);
  } else {
    console.log("database error");
    process.exist(1);
  }
});

module.exports = DB;
