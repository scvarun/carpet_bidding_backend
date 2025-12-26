import { Connection } from "typeorm";
import { User } from "./entity/internal";

export interface Context {
  req: Express.Request;
  connection: Connection;
  auth?: User;
}

export interface ServiceContext {
  connection: Connection;
}
