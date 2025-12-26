import { ApolloError } from "apollo-server";
import "reflect-metadata";
import {
  Resolver,
  FieldResolver,
  Root,
  ResolverInterface,
  UseMiddleware,
  Query,
  Ctx,
  Arg,
  Subscription,
} from "type-graphql";
import { Context } from "../context";
import { Notification, NotificationType } from "../entity/internal";
import { User } from "../entity/internal";
import { AuthMiddleware } from "../middlewares/authMiddleware";

@Resolver(() => Notification)
export class NotificationResolver implements ResolverInterface<Notification> {
  @FieldResolver(() => User, { nullable: true })
  async user(@Root() notification: Notification): Promise<User> {
    return await notification.user;
  }

  @FieldResolver(() => NotificationType, { nullable: true })
  async notificationType(
    @Root() notification: Notification
  ): Promise<NotificationType> {
    return await notification.notificationType;
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => [Notification])
  async notifications(@Ctx() ctx: Context): Promise<Notification[]> {
    if (!ctx.auth?.userType) {
      throw new ApolloError("Invalid user type");
    }
    let notifications = await ctx.connection.getRepository(Notification).find({
      where: {
        userId: ctx.auth.id,
      },
      order: {
        createdAt: "DESC",
      },
      relations: ["notificationType"],
    });
    return notifications;
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => Notification)
  async notification(
    @Arg("uuid") uuid: string,
    @Ctx() ctx: Context
  ): Promise<Notification> {
    if (!ctx.auth?.userType) {
      throw new ApolloError("Invalid user type");
    }
    let notification = await ctx.connection
      .getRepository(Notification)
      .findOne({
        where: { uuid },
      });
    if (!notification) {
      throw new ApolloError(
        "You are not allowed to use this route",
        "Forbidden"
      );
    } else if (notification.userId !== ctx.auth.id) {
      throw new ApolloError(
        "You are not the owner of this notification",
        "Forbidden"
      );
    }
    notification.isRead = true;
    notification = await ctx.connection
      .getRepository(Notification)
      .save(notification);
    return notification;
  }
}
