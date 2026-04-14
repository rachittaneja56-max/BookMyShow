import ApiResponse from "../../common/utils/apiResponse.js";
import * as authService from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(
      req.body.name,
      req.body.email,
      req.body.password
    );
    ApiResponse.created(res, "Registration success", { user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body.email, req.body.password);
    ApiResponse.ok(res, "Login success", { user, token });
  } catch (error) {
    next(error);
  }
};
