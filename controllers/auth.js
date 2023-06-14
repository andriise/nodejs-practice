const bcrypt = require("bcrypt");
const User = require("../models/users/users");
const jwt = require("jsonwebtoken");
const { HttpError, sendEmail } = require("../helpers");
const { SECRET_KEY, PROJECT_URL } = process.env;
const path = require("path");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const Jimp = require("jimp");
const ctrlWrapper = require("../utils/ctrlWrapper");
const { nanoid } = require("nanoid");

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
    const verificationToken = nanoid();
    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${PROJECT_URL}/api/users/verify/${verificationToken}">Click to verify email</a>`,
    };

    await sendEmail(verifyEmail);

    return res.status(201).json({
      email: newUser.email,
      subscription: newUser.subscription,
    });
  } catch (error) {
    return next(error);
  }
}

async function verify(req, res) {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) throw HttpError(404, "User with verification code not found");
  await User.findByIdAndUpdate(user.id, {
    verify: true,
    verificationToken: "",
  });

  res.json({ message: "Verify success" });
}

async function resendVerifyEmail(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw HttpError(404);
  if (user.verify) throw HttpError(400, "Email already verified");

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${PROJECT_URL}/api/users/verify/${user.verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);
  res.json({ message: "Verify email send" });
}

async function login(req, res, next) {
  const { email, password } = req.body;
  try {
    const newUser = await User.findOne({ email: email });
    if (!newUser || !newUser.verify) {
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
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
