import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class RegisterDto extends BaseDto {
  static schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required().messages({
      "string.min": "Password must be a minimum of 8 characters",
      "string.empty": "Password is required",
    }),
  });
}

export default RegisterDto;
