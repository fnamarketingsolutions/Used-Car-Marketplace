import jwt from "jsonwebtoken";
import User from "../models/User.js";

const isProduction = () => process.env.NODE_ENV === "production";

const cookieBaseOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: "lax",
});

export const signAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m",
  });
};

export const signRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const base = cookieBaseOptions();

  res.cookie("accessToken", accessToken, {
    ...base,
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...base,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res) => {
  const base = cookieBaseOptions();

  res.clearCookie("accessToken", { ...base, path: "/" });
  res.clearCookie("refreshToken", { ...base, path: "/" });
};

export const issueTokensForUser = async (user) => {
  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  // Update only refreshToken — avoid user.save() so the password pre-save
  // hook cannot accidentally re-hash an already-hashed password.
  await User.findByIdAndUpdate(user._id, { refreshToken });
  user.refreshToken = refreshToken;
  return { accessToken, refreshToken };
};
