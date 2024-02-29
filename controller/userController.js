const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const registerUser = async (req, res) => {
  try {
    const { username, email, password, cnf_password } = req.body;

    if (password !== cnf_password) {
      return res.status(500).json({ error: "passwords don't matched" });
    }

    // const user = await User.findOne({ email: email });
    const user = await User.findOne({ email: email });

    // console.log("user", user);
    if (!user) {
      const salt = await bcrypt.genSalt(10);

      const hashPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        username: username,
        email: email,
        password: hashPassword,
        userId: uuidv4(),
      });

      const savedUser = await newUser.save();

      const token = jwt.sign({ id: savedUser._id }, "randomsecret");

      return res.status(200).json({
        user: savedUser,
        token: token,
      });
    } else {
      return res.status(500).json({ error: "email already exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (user) {
      const isPasswordMatchedFromDb = await bcrypt.compare(
        password,
        user.password
      );

      if (isPasswordMatchedFromDb) {
        const token = jwt.sign({ id: user._id }, "randomsecret");

        return res.status(200).json({
          user: user,
          token: token,
        });
      } else {
        return res.status(401).json({ message: "Invalid login credintials" });
      }
    } else {
      return res.status(400).json({ error: "Email doesn't exist " });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ eror: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser };
