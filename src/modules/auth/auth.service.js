import bcrypt from "bcryptjs";
import ApiError from "../../common/utils/apiError.js";
import { generateAccessToken } from "../../common/utils/jwt.utils.js";
import { createUser, getUserByEmail } from "./auth.models.js";

export const register = async (name, email, password) => {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw ApiError.conflict("User with this email already exists");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await createUser(name, email, hashedPassword);
  const token = generateAccessToken({
    user_id: user.id,
    email: user.email,
    name: user.name,
  });

  return { user, token };
};

export const login = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = generateAccessToken({
    user_id: user.id,
    email: user.email,
    name: user.name,
  });

  const { password_hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};
