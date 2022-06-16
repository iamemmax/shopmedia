const jwt =  require("jsonwebtoken");

 function ensureLogin(req, res, next) {
  const { authorization } = req.headers;
  const rawToken = authorization?.split(" ");
  try {
    jwt.verify(rawToken[1], process.env.JWT_SECRETE, (error, data) => {
      if (error) {
        return res.status(400).json({
          message: "Invalid token",
        });
      }
      req.user = data.user;
      return next();
    });
  } catch (error) {
    if (error) {
      return res.status(400).json({
        message: "Invalid token",
      });
    }
  }
}

module.exports = ensureLogin