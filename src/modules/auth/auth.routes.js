import { Router } from "express";
import validate from "../../common/middlewares/validate.middleware.js";
import * as authController from "./auth.controller.js";
import RegisterDto from "./dto/register.dto.js";
import LoginDto from "./dto/login.dto.js";

const router = Router();

router.post("/register", validate(RegisterDto), authController.register);
router.post("/login", validate(LoginDto), authController.login);

export default router;
