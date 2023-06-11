const bcrypt = require("bcrypt");
const User = require("../models/users/users");
const jwt = require("jsonwebtoken");
const { HttpError } = require("../helpers");
const { SECRET_KEY } = process.env;
const path = require("path");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const Jimp = require("jimp");
const ctrlWrapper = require("../utils/ctrlWrapper");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

async function register(req, res, next) {
  const { email, password } = req.body;
  try {
    const currentUser = await User.findOne({ email });
    if (currentUser !== null) {
      return res.status(409).json("message: Email in use");
    }
    const avatarURL = gravatar.url(email);
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
    });
    return res.status(201).json({
      email: newUser.email,
      subscription: newUser.subscription,
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  try {
    const newUser = await User.findOne({ email: email });
    if (!newUser) {
      throw HttpError(401, "Email or password is wrong");
    }
    const isMatch = await bcrypt.compare(password, newUser.password);
    if (!isMatch) {
      throw HttpError(401, "Email or password is wrong");
    }

    const payload = {
      id: newUser._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(newUser._id, { token });
    res.json({
      token,
      email: newUser.email,
      subscription: newUser.subscription,
    });
  } catch (error) {
    next(error);
  }
}

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).end();
};

const updateAvatar = async (req, res) => {
  try {
    const { _id } = req.user;

    const { path: oldPath, originalname } = req.file;

    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);

    const avatarURL = path.join("avatars", filename);

    await Jimp.read(oldPath)
      .then((avatar) => {
        return avatar.cover(250, 250).write(oldPath);
      })
      .catch((err) => {
        throw err;
      });

    await fs.rename(oldPath, resultUpload);
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.status(200).json({
      avatarURL,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Upload avatar error" });
  }
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
};
