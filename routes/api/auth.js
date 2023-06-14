const express = require("express");
const authController = require("../../controllers/auth");
const authenticate = require("../../middlewars/authenticate");
const router = express.Router();
const upload = require("../../middlewars/upload");
const validateBody = require("../../middlewars/validateBody");


const schemas = require("../../schemas/usersSchema");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/current", authenticate, authController.getCurrent);

router.post("/logout", authenticate, authController.logout);

router.patch(
  "/avatars",
  upload.single("avatar"),
  authenticate,
  authController.updateAvatar
);

router.get("/verify/:verificationToken", authController.verify);

router.post("/verify", validateBody(schemas.userEmailSchema), authController.resendVerifyEmail)

module.exports = router;
