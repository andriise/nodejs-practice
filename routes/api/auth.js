const express = require("express");
const User = require("../../models/users/users");
const router = express.Router();

router.post("/register", async (req, res, next) => {
  const newUser = req.body;
  try {
    const currentUser = await User.findOne({ email: newUser.email });
    if (currentUser !== null) {
      return res.status(409).json("message: Email in use");
    }
    await User.create(newUser);
    return res.status(201).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
