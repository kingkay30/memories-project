import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import {
  BadRequestError,
  UnauthenticatedError,
} from "../errors/errorsControls.js";
import User from "../models/user.js";

export const signin = async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (!existingUser) throw new BadRequestError("No User by that email");
  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password
  );
  if (!isPasswordCorrect) throw new BadRequestError("Password is incorrect");
  const token = jwt.sign(
    { email: existingUser.email, id: existingUser._id },
    process.env.JWT_SECRET,
    { expiresIn: "5h" }
  );
  res.status(StatusCodes.OK).json({ result: existingUser, token });
};

export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new BadRequestError("Email already in use");
  if (password !== confirmPassword)
    throw new UnauthenticatedError("Passwords dont match, try again");
  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await User.create({
    email,
    password: hashedPassword,
    name: `${firstName} ${lastName}`,
  });
  const token = jwt.sign(
    { email: result.email, id: result._id },
    process.env.JWT_SECRET,
    { expiresIn: "5h" }
  );
  res.status(StatusCodes.OK).json({ result, token });
};
