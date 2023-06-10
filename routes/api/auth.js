const express = require("express");
const authController = require("../../controllers/auth");
const authenticate = require("../../middlewars/authenticate");
const router = express.Router();
const upload = require("../../middlewars/upload");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/current", authenticate, authController.getCurrent);

router.post("/logout", authenticate, authController.logout);

router.patch(
  "avatars",
  upload.single("avatar"),
  authenticate,
  authController.updateAvatar
);

module.exports = router;
