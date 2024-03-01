const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const registerUser = async (req, res) => {
  try {
    const { username, email, password, cnf_password } = req.body;

    const data = { username, email, password };

    const { error } = validateRegisterInput(data);

    if (error) {
      let errorMessage = error.details[0].message;
      errorMessage = errorMessage.replace(/"/g, "");
      return res.status(400).json({ error: errorMessage });
    }

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

    const { error } = validateLoginInput(req.body);

    if (error) {
      let errorMessage = error.details[0].message;

      errorMessage = errorMessage.replace(/"/g, "");

      return res.status(400).json({ error: errorMessage });
    }

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

const validateRegisterInput = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().min(3).max(30).messages({
      "string.min": "username should be atleast 3 character long",
      "string.max": "maximum 30 characters only",
    }),
    email: Joi.string()
      .email({ tlds: { allow: ["com", "in", "net", "ac"] } })
      .required()
      .messages({
        "string.email": "enter a valid email address ",
      })
      .required(),
    password: Joi.string().min(3).required().messages({
      "string.min": "password should be atleast 3 character long",
    }),
  });

  return schema.validate(data);
};

const validateLoginInput = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email({
        tlds: { allow: ["com", "in", "net", "ac"] },
      })
      .messages({
        "string.email": "enter a valid email address",
      }),

    password: Joi.string().min(3).required().messages({
      "string.min": "password should be ateast 3 characters",
    }),
  });

  return schema.validate(data);
};

module.exports = { registerUser, loginUser };
