import { CallContext, createServer, ServerError, Status } from "nice-grpc";
import config from "../config";
import { ServiceContext } from "../context";
import { RedisPubSub } from "graphql-redis-subscriptions";
import {
  FetchMessagesRequest,
  ListenMessagesRequest,
  ListenOrderRequest,
  MessageServiceDefinition,
  MessageServiceServiceImplementation,
  Message as MessageOutput,
  PingResponse,
  PingRequest,
  FetchMessagesResponse,
  ListenMessagesResponse,
  ListenOrdersResponse,
  DeepPartial,
} from "../v1/models";
import { authMiddlewareService } from "../middlewares/authMiddleware";
import { Message, MessageRoom, Order, UserTypes } from "../entity/internal";
import { reduce } from "p-iteration";
import { Channel } from "queueable";

export class MessageService {
  private static _instance: MessageService;

  context: ServiceContext;
  messagesPubSub: RedisPubSub;

  static instance(context?: ServiceContext) {
    if (MessageService._instance) return MessageService._instance;
    if (!context) throw new Error("Database connection not established");
    const server = createServer();
    server.add(MessageServiceDefinition, new MessageHandler());
    server.listen("0.0.0.0:" + config.messagePort);
    console.log(`Message service started at : 0.0.0.0:${config.messagePort}`);
    const messagesPubSub = new RedisPubSub({
      connection: {
        host: config.redisHost,
        port: Number(config.redisPort) ?? 6379,
      },
    });
    MessageService._instance = { context, messagesPubSub };
    return MessageService._instance;
  }
}

class MessageHandler implements MessageServiceServiceImplementation {
  async fetchMessages(
    request: FetchMessagesRequest,
    context: CallContext
  ): Promise<DeepPartial<FetchMessagesResponse>> {
    try {
      let context = MessageService.instance().context;
      let connection = context.connection;
      let token = request.userToken?.token;
      if (!token) throw new Error("Token not provided");
      let { auth, error } = await authMiddlewareService(context, token);
      if (error) throw error;
      let messageRoomUUID = request.roomUUID;
      let messageRoom = await connection.getRepository(MessageRoom).findOne({
        where: { uuid: messageRoomUUID },
      });
      if (!messageRoom) throw new Error("Message room not found");
      let messages = await messageRoom.messages;
      let res: ListenMessagesResponse = {
        messages: [],
      };
      let messagesOutput = await reduce(
        messages,
        async (a: MessageOutput[], c) => {
          const output = await c.toGRPC();
          if (output) a.push(output);
          return a;
        },
        []
      );
      if (!auth) throw new Error("User not found");
      if (messagesOutput) {
        res.messages = messagesOutput;
      }
      return res;
    } catch (e) {
      console.error(e);
      let error = new Error("Unknown error");
      if (e instanceof Error) error = e;
      throw new ServerError(Status.CANCELLED, error.message);
    }
  }

  async *lisenMessages(
    request: ListenMessagesRequest,
    context: CallContext
  ): AsyncIterable<DeepPartial<ListenMessagesResponse>> {
    try {
      const context = MessageService.instance().context;
      const connection = context.connection;
      let token = request.userToken?.token;
      if (!token) throw new Error("Token not provided");
      let { auth, error } = await authMiddlewareService(context, token);
      if (error) throw error;
      if (!auth) throw new Error("User not found");
      let messageRoomUUID = request.roomUUID;
      let messageRoom = await connection.getRepository(MessageRoom).findOne({
        where: { uuid: messageRoomUUID },
      });
      if (!messageRoom) throw new Error("Message room not found");
      console.log(auth.uuid + ": is now listening to Messages");
      let res: ListenMessagesResponse = {
        messages: [],
      };

      const subscriber =
        MessageService.instance().messagesPubSub.getSubscriber();
      subscriber.subscribe("messenger:messages");
      const channel = new Channel<string>();
      subscriber.on("message", (c, v) => channel.push(v));

      for await (const v of channel) {
        const obj = JSON.parse(v);
        const message = await connection.getRepository(Message).findOne({
          where: { uuid: obj.uuid },
          relations: ["messageRoom", "user"],
        });
        if ((await message?.messageRoom)?.id === messageRoom?.id) {
          const output = await message?.toGRPC();
          if (output) {
            res.messages.push(output);
            yield res;
          }
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

  async *listenOrders(
    request: ListenOrderRequest,
    context: CallContext
  ): AsyncIterable<DeepPartial<ListenOrdersResponse>> {
    try {
      let context = MessageService.instance().context;
      let connection = context.connection;
      let token = request.userToken?.token;
      if (!token) throw new Error("Token not provided");
      let { auth, error } = await authMiddlewareService(context, token);
      if (!auth) throw new Error("User not found");
      const userType = await auth.userType;
      if (error) throw error;
      if (!auth) throw new Error("User not found");

      const subscriber =
        MessageService.instance().messagesPubSub.getSubscriber();
      subscriber.subscribe("messenger:orders");
      const channel = new Channel<string>();
      subscriber.on("message", (c, v) => channel.push(v));

      for await (const v of channel) {
        const obj = JSON.parse(v);
        const order = await connection.getRepository(Order).findOne({
          where: { uuid: obj.uuid },
          relations: ["messageRoom"],
        });
        if (!auth) throw new Error("User not found");
        if (!order) continue;
        let res: ListenOrdersResponse = {
          order: {
            uuid: order.uuid,
          },
        };
        console.group([userType.slug, userType.slug === UserTypes.admin]);
        if (
          userType.slug === UserTypes.admin ||
          userType.slug === UserTypes.backoffice
        ) {
          yield res;
        } else if (
          (await auth.userType).slug === UserTypes.dealer &&
          order.userId === auth.id
        ) {
          yield res;
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
