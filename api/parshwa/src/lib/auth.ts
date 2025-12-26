import { connect } from "http2";
import * as jwt from "jsonwebtoken";
import { Connection, createConnection } from "typeorm";
import config from "../config";
import { User } from "../entity/internal";

export const generateAuthToken = async (user: User) => {
  let u = {
    email: user.email,
  };

  const token = jwt.sign({ data: u }, config.privateKey, {
    expiresIn: config.sessionDuration,
  });
  return token;
};

export const generateRefreshToken = async (user: User) => {
  let u = {
    email: user.email,
  };

  const token = jwt.sign({ data: u }, config.privateKey, {
    expiresIn: config.refreshTokenLife,
  });

  return token;
};

const authMiddlewareService = async (connection: Connection, token: string) => {
  if (!token)
    throw new Error("Access Denied. No token provided. Please login again.");
  token = token.replace("Bearer ", "");
  let decoded = jwt.verify(token, config.privateKey);
  if (typeof decoded === "string") throw new Error("Malformed token");
  let user = await connection.getRepository(User).findOne({
    where: {
      email: decoded.data.email,
    },
    relations: ["userType", "userProfile"],
  });
  if (user === null) throw new Error("User not found");
  return { auth: user, error: null };
};

export default authMiddlewareService;
