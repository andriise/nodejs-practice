const bcrypt = require("bcrypt");
const User = require("../models/users/users");

async function register(req, res, next) {
  const newUser = req.body;
  try {
    const currentUser = await User.findOne({ email: newUser.email });
    if (currentUser !== null) {
      return res.status(409).json("message: Email in use");
    }
    newUser.password = await bcrypt.hash(newUser.password, 10);
    await User.create(newUser);
    return res.status(201).end();
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  try {
    const newUser = await User.findOne({ email: email });
    if (newUser === null) {
      return res.status(401).json("Email or password is wrong");
    }
    const isMatch = await bcrypt.compare(password, newUser.password);
    if (isMatch === false) {
      return res.status(401).json("Email or password is wrong");
    }
    res.json({token: "TOKEN"});
  } catch (error) {}
}

module.exports = { register, login };
