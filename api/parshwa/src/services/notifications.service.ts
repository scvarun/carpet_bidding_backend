import { RedisPubSub } from "graphql-redis-subscriptions";
import { CallContext, createServer, ServerError, Status } from "nice-grpc";
import { map } from "p-iteration";
import { Channel } from "queueable";
import { DeepPartial } from "typeorm";
import config from "../config";
import { ServiceContext } from "../context";
import { Notification } from "../entity/internal";
import { authMiddlewareService } from "../middlewares/authMiddleware";
import {
  FetchNotificationsRequest,
  FetchNotificationsResponse,
  ListenNotificationsRequest,
  ListenNotificationsResponse,
  NotificationServiceDefinition,
  NotificationServiceServiceImplementation,
  PingRequest,
  PingResponse,
} from "../v1/models";

export class NotificationService {
  private static _instance: NotificationService;

  context: ServiceContext;
  notificationsPubSub: RedisPubSub;

  static instance(context?: ServiceContext) {
    if (NotificationService._instance) {
      return NotificationService._instance;
    }
    if (!context) throw new Error("Database connection not established");
    const server = createServer();
    server.add(NotificationServiceDefinition, new NotificationHandler());
    server.listen("0.0.0.0:" + config.notificationPort);
    console.log(
      `Notification service started at : 0.0.0.0:${config.notificationPort}`
    );
    const notificationsPubSub = new RedisPubSub({
      connection: {
        host: config.redisHost,
        port: Number(config.redisPort) ?? 6379,
      },
    });
    NotificationService._instance = { context, notificationsPubSub };
    return NotificationService._instance;
  }
}

class NotificationHandler implements NotificationServiceServiceImplementation {
  async fetchNotifications(
    request: FetchNotificationsRequest,
    context: CallContext
  ): Promise<FetchNotificationsResponse> {
    try {
      let context = NotificationService.instance().context;
      let connection = context.connection;
      let token = request.userToken?.token;
      if (!token) throw new Error("Token not provided");
      let { auth, error } = await authMiddlewareService(context, token);
      if (error) throw error;
      let notifications = await connection.getRepository(Notification).find({
        where: { userId: auth?.id },
        order: { createdAt: "DESC" },
        relations: ["notificationType"],
      });
      let res: FetchNotificationsResponse = {
        notifications: await map(notifications, async (n) => await n.toGRPC()),
      };
      return res;
    } catch (e) {
      console.error(e);
      let error = new Error("Unknown error: " + e.toString());
      if (e instanceof Error) error = e;
      throw new ServerError(Status.CANCELLED, error.message);
    }
  }

  async *listenNotifications(
    request: ListenNotificationsRequest
  ): AsyncIterable<DeepPartial<ListenNotificationsResponse>> {
    try {
      let context = NotificationService.instance().context;
      let connection = context.connection;
      let token = request.userToken?.token;
      if (!token) throw new Error("Token not provided");
      let { auth, error } = await authMiddlewareService(context, token);
      if (error) throw error;
      console.log(auth?.uuid + ": is now listening to notifications");

      const subscriber =
        NotificationService.instance().notificationsPubSub.getSubscriber();
      subscriber.subscribe("notifications:notification");
      const channel = new Channel<string>();
      subscriber.on("message", (c, v) => channel.push(v));

      for await (const v of channel) {
        const obj = JSON.parse(v);
        const notification = await connection
          .getRepository(Notification)
          .findOne({
            where: { uuid: obj.uuid },
            relations: ["user"],
          });
        console.log("notification", notification);
        if (notification) {
          console.log("grpc", await notification.toGRPC());
          yield {
            notification: await notification.toGRPC(),
          };
        }
      }

      channel.return();
      subscriber.unsubscribe();
    } catch (e) {
      console.error(e);
      let error = new Error("Unknown error: " + e.toString());
      if (e instanceof Error) error = e;
      throw new ServerError(Status.CANCELLED, error.message);
    }
  }

  async ping(
    request: PingRequest,
    context: CallContext
  ): Promise<PingResponse> {
    console.log("ping");
    return {
      pong: "pong",
    };
  }
}
