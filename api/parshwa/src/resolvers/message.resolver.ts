import { ApolloError } from "apollo-server-express";
import "reflect-metadata";
import {
  Resolver,
  Query,
  Ctx,
  ResolverInterface,
  FieldResolver,
  Root,
  UseMiddleware,
  Arg,
  Mutation,
} from "type-graphql";
import { Context } from "../context";
import { Message, MessageRoom, MessageTypes } from "../entity/internal";
import { Order } from "../entity/internal";
import { User } from "../entity/internal";
import { UserType, UserTypes } from "../entity/internal";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { filter } from "p-iteration";

@Resolver((of) => MessageRoom)
export class MessageRoomResolver implements ResolverInterface<MessageRoom> {
  @FieldResolver(() => Order)
  async order(@Root() messageRoom: MessageRoom): Promise<Order> {
    return await messageRoom.order;
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => [Message])
  async getMessages(
    @Ctx() ctx: Context,
    @Arg("uuid") uuid: string
  ): Promise<Message[]> {
    if (!ctx.auth?.userType) {
      throw new ApolloError("Invalid user type");
    }
    let authUserType = await ctx.auth.userType;
    let messageRoom = await ctx.connection.getRepository(MessageRoom).findOne({
      where: { uuid },
      relations: [
        "messages",
        "messages.forUserType",
        "messages.user",
        "messages.user.userType",
      ],
    });
    if (!messageRoom) throw new ApolloError("Message room not found");
    var messages = await messageRoom.messages;
    if (authUserType.slug === UserTypes.dealer) {
      messages = await filter(messages, async (e) => {
        return (await e.forUserType).slug === authUserType.slug;
      });
    } else if (authUserType.slug === UserTypes.backoffice) {
      let adminUserType = await ctx.connection.getRepository(UserType).findOne({
        where: {
          slug: UserTypes.admin,
        },
      });
      if (!adminUserType) throw new ApolloError("Invalid user type");
      messages = await filter(messages, async (e) => {
        return (
          (await e.forUserType).slug === authUserType.slug ||
          (await e.forUserType).slug === adminUserType?.slug
        );
      });
    }
    return messages;
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => Message)
  async postMessage(
    @Ctx() ctx: Context,
    @Arg("roomUUID") roomUUID: string,
    @Arg("message") message: string
  ): Promise<Message> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if (!ctx.auth?.userType) {
        throw new ApolloError("Invalid user type");
      }
      let messageRoom = await querun.manager
        .getRepository(MessageRoom)
        .findOne({
          where: {
            uuid: roomUUID,
          },
        });
      if (!messageRoom) throw new ApolloError("Message room not found");
      let m = new Message();
      m.message = message;
      m.type = MessageTypes.text;
      m.userId = ctx.auth.id;
      m.forUserTypeId = ctx.auth.userTypeId;
      m.messageRoomId = messageRoom.id;
      m = await querun.manager.getRepository(Message).save(m);
      await querun.commitTransaction();
      return m;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }
}

@Resolver((of) => Message)
export class MessageResolver implements ResolverInterface<Message> {
  @FieldResolver(() => MessageRoom)
  async messageRoom(@Root() message: Message): Promise<MessageRoom> {
    return await message.messageRoom;
  }

  @FieldResolver(() => User)
  async user(@Root() message: Message): Promise<User> {
    return await message.user;
  }

  @FieldResolver(() => UserType)
  async forUserType(@Root() message: Message): Promise<UserType> {
    return await message.forUserType;
  }
}
