import { ApolloError } from "apollo-server-errors";
import { MiddlewareFn } from "type-graphql";
import { Context, ServiceContext } from "../context";
import * as jwt from "jsonwebtoken";
import config from "../config";
import { User } from "../entity/internal";
import { Connection } from "typeorm";

export const AuthMiddleware: MiddlewareFn<Context> = async (action, next) => {
  let { info, context } = action;
  try {
    let token =
      // @ts-ignore
      context.req.headers["x-access-token"] ||
      // @ts-ignore
      context.req.headers?.authorization ||
      // @ts-ignore
      context.req.query?.token ||
      // @ts-ignore
      context.req.session?.token;
    if (!token)
      throw new Error("Access Denied. No token provided. Please login again.");
    token = token.replace("Bearer ", "");
    let decoded = jwt.verify(token, config.privateKey);
    if (!decoded || typeof decoded === "string")
      throw new ApolloError("Invalid token", "TokenInvalid");
    let user = await context.connection.getRepository(User).findOne({
      where: {
        email: decoded.data.email,
      },
      relations: ["userType"],
    });
    if (user === null) throw new ApolloError("User not found", "UserNotFound");
    context.auth = user;
    return await next();
  } catch (e) {
    console.error(`${e.fileName}: ${e.lineNumber}`, e);
    throw e;
  }
};

export const authMiddlewareApi = async (req: any, res, next) => {
  try {
    let token =
      req.headers["x-access-token"] ||
      req.headers.authorization ||
      req.query.token ||
      req.session.token;
    if (!token)
      throw new Error("Access Denied. No token provided. Please login again.");
    token = token.replace("Bearer ", "");
    /** @type {object} */
    let decoded = jwt.verify(token, config.privateKey);
    console.log("decoded", decoded);
    let dbConnection: Connection = req.dbConnection;
    let user = await dbConnection.getRepository(User).findOne({
      where: {
        // @ts-ignore
        email: decoded.data.email,
      },
      relations: ["userType"],
    });
    if (user === null) throw new Error("User not found");
    req.auth = user;
    console.log("user", user);
    next();
  } catch (e) {
    console.error(`${e.fileName}: ${e.lineNumber}`, e);
    if (e.name === "TokenExpiredError")
      e.message = "Token expired. Please login again";
    return res.status(401).send(e.message);
  }
};

export const authMiddlewareService = async (
  context: ServiceContext,
  token: string
) => {
  if (!token)
    throw new Error("Access Denied. No token provided. Please login again.");
  token = token.replace("Bearer ", "");
  let decoded = jwt.verify(token, config.privateKey);
  if (typeof decoded === "string") throw new Error("Malformed token");
  let user = await context.connection.getRepository(User).findOne({
    where: {
      email: decoded.data.email,
    },
    relations: ["userType"],
  });
  if (user === null) throw new Error("User not found");
  return { auth: user, error: null };
};
