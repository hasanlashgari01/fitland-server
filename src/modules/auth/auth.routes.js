const router = require("express").Router();

const authController = require("./auth.controller");
const Authorization = require("../../common/guard/authorization.guard");
const Public = require("../../common/guard/public.guard");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/check-otp", authController.checkOtp);
router.get("/me", Public, authController.getMe);

module.exports = { AuthRouter: router };
