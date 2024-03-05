const jwt = require("jsonwebtoken");

const clientAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const verify = jwt.verify(token, "randomsecret");

    // console.log(verify);
    next();
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: "Invalid token" });
  }
};

module.exports = { clientAuth };
