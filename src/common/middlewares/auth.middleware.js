import ApiError from "../../common/utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";


 const authMiddleware  = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Authentication token is missing");
    }

    const token = authHeader.split(" ")[1];
    const decodedPayload = verifyAccessToken(token);

    req.user = decodedPayload;
    next();
  } catch (error) {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
};
export default authMiddleware;