import { ApolloError } from "apollo-server-express";
import { add, endOfDay, format, parseISO, startOfMonth } from "date-fns";
import { filter, map } from "p-iteration";
import "reflect-metadata";
import {
  Resolver,
  Query,
  Ctx,
  ResolverInterface,
  Arg,
  FieldResolver,
  Mutation,
  Root,
  UseMiddleware,
  Field,
  InputType,
  ObjectType,
  Publisher,
  PubSub,
  registerEnumType,
} from "type-graphql";
import { Between, FindOptionsWhere } from "typeorm";
import { Context } from "../context";
import { Catalogue } from "../entity/internal";
import { Delivery } from "../entity/internal";
import { Inventory, InventoryTypes } from "../entity/internal";
import { Message, MessageRoom, MessageTypes } from "../entity/internal";
import {
  Notification,
  NotificationType,
  NotificationTypes,
} from "../entity/internal";
import {
  Order,
  OrderContact,
  OrderStatus,
  OrderStatusHistory,
  OrderStatusTypes,
} from "../entity/internal";
import { User } from "../entity/internal";
import { UserType, UserTypes } from "../entity/internal";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import * as xlsx from "node-xlsx";
import RedisClient from "../services/redis.service";
import config from "./../config";
import { v4 as uuidv4 } from "uuid";
import { CustomOrder } from "../entity/internal";

@InputType()
class OrderQueryInput {
  @Field(() => [OrderStatusTypes], { nullable: true })
  status?: OrderStatusTypes[];

  @Field(() => String, { nullable: true })
  startDate?: string;

  @Field(() => String, { nullable: true })
  endDate?: string;
}

export enum OrderCreateStatusTypes {
  new_enquiry = "new_enquiry",
  placed_order = "placed_order",
}
registerEnumType(OrderCreateStatusTypes, { name: "OrderCreateStatusTypes" });

@InputType()
class OrderContactUpdateDataContact {
  @Field(() => String)
  name: string;

  @Field(() => String)
  phone: string;
}

@InputType()
class OrderContactUpdateData {
  @Field(() => [OrderContactUpdateDataContact])
  contacts: OrderContactUpdateDataContact[];
}

@InputType()
class OrderCreateInput {
  @Field(() => String, { nullable: true })
  userUUID?: string;

  @Field(() => String, { nullable: true })
  inventoryUUID?: string;

  @Field(() => String, { nullable: true })
  catalogueUUID?: string;

  @Field(() => Number)
  quantity: number;

  @Field(() => String)
  patternNo: string;

  @Field(() => String)
  reference: string;

  @Field(() => InventoryTypes)
  type: InventoryTypes;

  @Field(() => OrderCreateStatusTypes)
  status: OrderCreateStatusTypes;
}

@ObjectType()
class OrderUpdateOutput {
  @Field(() => String)
  message: string;
}

@InputType()
class ReportsInput {
  @Field(() => String, { nullable: true })
  dealerName?: string;

  @Field(() => String, { nullable: true })
  patternNo?: string;

  @Field(() => String, { nullable: true })
  catalagueUuid?: string;

  @Field(() => [OrderStatusTypes], { nullable: true })
  status?: OrderStatusTypes[];

  @Field(() => String, { nullable: true })
  startDate?: string;

  @Field(() => String, { nullable: true })
  endDate?: string;
}

@ObjectType()
class ReportsOutput {
  @Field(() => String)
  reportsUrl?: string;

  @Field(() => [Order])
  orders: Order[];

  @Field(() => [CustomOrder])
  customOrders: CustomOrder[];

  @Field(() => [Delivery])
  deliveries: Delivery[];
}

@Resolver((of) => Order)
export class OrderResolver implements ResolverInterface<Order> {
  @UseMiddleware(AuthMiddleware)
  @Query(() => [Order])
  async orders(
    @Ctx() ctx: Context,
    @Arg("query") query: OrderQueryInput
  ): Promise<Order[]> {
    if (!ctx.auth?.userType) {
      throw new ApolloError("Invalid user type");
    }
    const authUserType = await ctx.auth.userType;
    let whereOptions: FindOptionsWhere<Order>[] = [];
    let startDate = query.startDate
      ? parseISO(query.startDate)
      : startOfMonth(Date.now());
    let endDate = query.endDate
      ? parseISO(query.endDate)
      : endOfDay(Date.now());
    if (query.status) {
      let queryStatus = await ctx.connection.getRepository(OrderStatus).find({
        where: query.status.map((e) => ({ slug: e })),
      });
      if (queryStatus) {
        for (let i = 0; i < queryStatus.length; i++) {
          whereOptions.push({
            orderStatusId: queryStatus[i].id,
          });
        }
      }
    }
    if (authUserType.slug === UserTypes.admin) {
      whereOptions = whereOptions.map((e) => {
        e.createdAt = Between(startDate, endDate);
        return e;
      });
      const orders = await ctx.connection.getRepository(Order).find({
        where: [...whereOptions],
        relations: ["user", "user.userProfile", "catalogue", "status"],
        order: { orderStatusId: "ASC" },
      });
      return this.sortOrders(orders);
    } else if (authUserType.slug === UserTypes.dealer) {
      whereOptions = whereOptions.map((e) => {
        e.createdAt = Between(startDate, endDate);
        e.userId = ctx.auth?.id;
        return e;
      });
      const orders = await ctx.connection.getRepository(Order).find({
        where: [...whereOptions],
        relations: ["user", "user.userProfile", "catalogue", "status"],
        order: { orderStatusId: "ASC" },
      });
      return this.sortOrders(orders);
    } else if (authUserType.slug === UserTypes.backoffice) {
      whereOptions = whereOptions.map((e) => {
        e.createdAt = Between(startDate, endDate);
        return e;
      });
      const orders = await ctx.connection.getRepository(Order).find({
        where: [...whereOptions, { userId: ctx.auth.id }],
        relations: ["user", "user.userProfile", "catalogue", "status"],
        order: { orderStatusId: "ASC" },
      });
      return this.sortOrders(orders);
    }
    return [];
  }

  sortOrders(orders: Order[]): Order[] {
    const importantOrders = orders.filter(
      (e) => e.orderStatusId === 1 || e.orderStatusId === 4
    );
    const otherOrders = orders.filter(
      (e) => e.orderStatusId !== 1 && e.orderStatusId !== 4
    );
    return [...importantOrders, ...otherOrders];
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => Order)
  async order(@Ctx() ctx: Context, @Arg("uuid") uuid: string): Promise<Order> {
    const order = await ctx.connection.getRepository(Order).findOne({
      where: { uuid },
      relations: [
        "user",
        "catalogue",
        "inventory",
        "inventory.importers",
        "inventory.similarInventories",
        "status",
        "messageRoom",
        "deliveries",
        "orderContacts",
      ],
    });
    if (!order) throw new ApolloError("Order not found");
    return order;
  }

  @FieldResolver(() => User)
  async user(@Root() order: Order): Promise<User> {
    return await order.user;
  }

  @FieldResolver(() => [OrderStatusHistory])
  async statusHistory(@Root() order: Order): Promise<OrderStatusHistory[]> {
    return await order.statusHistory;
  }

  @FieldResolver(() => [Delivery])
  async deliveries(@Root() order: Order): Promise<Delivery[]> {
    return await order.deliveries;
  }

  @FieldResolver(() => [OrderContact])
  async orderContacts(@Root() order: Order): Promise<OrderContact[]> {
    return await order.orderContacts;
  }

  @FieldResolver(() => OrderStatus)
  async status(@Root() order: Order): Promise<OrderStatus> {
    return await order.status;
  }

  @FieldResolver(() => Catalogue, { nullable: true })
  async catalogue(@Root() order: Order): Promise<Catalogue | null> {
    return (await order.catalogue) ?? null;
  }

  @FieldResolver(() => Inventory, { nullable: true })
  async inventory(@Root() order: Order): Promise<Inventory | null> {
    return (await order.inventory) ?? null;
  }

  @FieldResolver(() => String)
  sid(@Root() order: Order): String {
    return `OR-${(order.id + Math.pow(10, 9)).toString().substring(1)}`;
  }

  @FieldResolver(() => MessageRoom)
  async messageRoom(@Root() order: Order): Promise<MessageRoom> {
    return await order.messageRoom;
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => Order)
  async addOrder(
    @Arg("data") data: OrderCreateInput,
    @Ctx() ctx: Context
  ): Promise<Order> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if (!ctx.auth) throw new ApolloError("Invalid user type");
      if (
        (await ctx.auth.userType).slug !== UserTypes.dealer &&
        (await ctx.auth.userType).slug !== UserTypes.admin
      ) {
        throw new ApolloError(
          "Forbidden",
          "You are not allowed to use this route."
        );
      }

      var catalogue: Catalogue | undefined | null;
      if (data.catalogueUUID) {
        catalogue = await ctx.connection.getRepository(Catalogue).findOne({
          where: { uuid: data.catalogueUUID },
          relations: ["inventories", "inventories.roll"],
          withDeleted: false,
        });
        if (!catalogue) {
          throw new ApolloError("CatalogueNotFound", "Catalogue not found");
        }
      }

      let inventory: Inventory | undefined | null;

      if (data.inventoryUUID) {
        inventory = await querun.manager.getRepository(Inventory).findOne({
          where: { uuid: data.inventoryUUID },
        });
        if (!inventory) {
          throw new ApolloError("inventoryNotFound", "Inventory not found");
        }
      }

      let user: User | undefined | null = ctx.auth;

      if (data.userUUID) {
        user = await querun.manager.getRepository(User).findOne({
          where: { uuid: data.userUUID },
        });
        if (!user) {
          throw new ApolloError("UserNotFound", "User not found");
        }
      }

      let order = new Order();
      order.quantity = data.quantity;
      order.reference = data.reference;
      order.type = data.type;
      order.patternNo = data.patternNo;
      if (inventory) order.inventory = inventory;

      if (inventory) {
        await map((await inventory.importers) ?? [], async (e) => {
          let orderContact = new OrderContact();
          orderContact.name = e.name;
          orderContact.phone = e.phone;
          orderContact.order = order;
          await querun.manager.save(e);
        });
      }

      let message = new Message();
      message.userId = 1;
      let notification = new Notification();
      let orderStatus: OrderStatus | undefined | null;

      if (inventory && order.quantity <= inventory.quantity) {
        inventory.quantity -= order.quantity;
        await querun.manager.getRepository(Inventory).save(inventory);
      }

      if (data.status === OrderCreateStatusTypes.placed_order) {
        orderStatus = await querun.manager.getRepository(OrderStatus).findOne({
          where: { slug: OrderStatusTypes.placed_order },
        });
        message.message = "Your order has been placed";
        notification.title = "Order Placed";
        notification.message = "Your order has been placed";
        message.type = MessageTypes.placed_order;
      } else {
        orderStatus = await querun.manager.getRepository(OrderStatus).findOne({
          where: { slug: OrderStatusTypes.new_enquiry },
        });
        notification.title = "Enquiry Placed";
        notification.message =
          "Your enquiry has been placed. We've received your enquiry request and will revert back within 24 hours.";
        message.message = notification.message =
          "We've received your enquiry request and will revert back within 24 hours.";
        message.type = MessageTypes.new_enquiry;
      }

      if (orderStatus) order.status = orderStatus;
      order.user = user;
      if (catalogue) {
        order.catalogue = catalogue;
      }
      order = await querun.manager.save(order);

      let messageRoom = new MessageRoom();
      messageRoom.order = order;
      messageRoom = await querun.manager
        .getRepository(MessageRoom)
        .save(messageRoom);
      message.messageRoom = messageRoom;
      message.userId = 1;
      message.forUserTypeId = ctx.auth.userTypeId;
      message = await querun.manager.save(message);

      let notificationType = await querun.manager
        .getRepository(NotificationType)
        .findOne({
          where: {
            slug: NotificationTypes.text,
          },
        });
      if (!notificationType) throw new ApolloError("Invalid notification type");

      notification.user = ctx.auth;
      if (notificationType) notification.notificationType = notificationType;
      notification = await querun.manager.save(notification);

      let orderStatusHistory = new OrderStatusHistory();
      if (orderStatus) orderStatusHistory.status = orderStatus;
      orderStatusHistory.order = order;
      orderStatusHistory = await querun.manager
        .getRepository(OrderStatusHistory)
        .save(orderStatusHistory);

      const importers = await inventory?.importers;
      await map(importers || [], async (e) => {
        let orderContact = new OrderContact();
        orderContact.name = e.name;
        orderContact.phone = e.phone;
        orderContact.order = order;
        await querun.manager.save(orderContact);
      });

      await querun.commitTransaction();
      return order;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => OrderUpdateOutput)
  async cancelOrder(
    @Arg("order_uuid") uuid: string,
    @Ctx() ctx: Context,
    @Arg("messageForDealer", { nullable: true }) messageForDealer?: string
  ): Promise<OrderUpdateOutput> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if (!ctx.auth) throw new ApolloError("Invalid user type");
      let order = await querun.manager.getRepository(Order).findOne({
        where: { uuid },
        relations: [
          "user",
          "user.userType",
          "status",
          "statusHistory",
          "messageRoom",
        ],
      });
      if (!order) {
        throw new ApolloError("Order not found");
      }

      if (
        ctx.auth.id !== order.userId &&
        (await ctx.auth.userType).slug !== UserTypes.admin
      ) {
        throw new ApolloError("You are not allowed to use this route.");
      }

      switch ((await order.status).slug) {
        case OrderStatusTypes.dispatched:
        case OrderStatusTypes.completed:
        case OrderStatusTypes.cancelled:
        case OrderStatusTypes.received_stock:
          throw new ApolloError("Invalid Order status");
      }

      let cancelStatus = await querun.manager
        .getRepository(OrderStatus)
        .findOne({
          where: { slug: OrderStatusTypes.cancelled },
        });

      if (!cancelStatus) throw new ApolloError("Invalid status");

      let orderStatusHistory = new OrderStatusHistory();
      orderStatusHistory.order = order;
      orderStatusHistory.status = cancelStatus;
      orderStatusHistory = await querun.manager.save(orderStatusHistory);

      let notificationType = await querun.manager
        .getRepository(NotificationType)
        .findOne({
          where: {
            slug: NotificationTypes.text,
          },
        });
      if (!notificationType) throw new ApolloError("Invalid notfiication type");
      let notification = await Notification.create(
        ctx.auth,
        "Order cancelled",
        "Your order has been cancelled",
        notificationType
      );
      notification = await querun.manager.save(notification);

      let messageRoom = await order.messageRoom;
      let message = new Message();
      message.userId = 1;
      message.message = "Your order has been cancelled";
      message.type = MessageTypes.cancelled;
      message.forUserTypeId = (await order.user).userTypeId;
      message.messageRoom = messageRoom;
      message = await querun.manager.save(message);

      if (messageForDealer) {
        let message = new Message();
        message.userId = 1;
        message.message = messageForDealer;
        message.type = MessageTypes.cancelled;
        message.messageRoomId = messageRoom.id;
        message.forUserTypeId = (await order.user).userTypeId;
        message = await querun.manager.save(message);
      }

      await querun.manager
        .createQueryBuilder()
        .update(Order)
        .set({
          orderStatusId: cancelStatus.id,
          notes: order.notes + "\nMessage for Dealer: " + messageForDealer,
        })
        .where("orders.id = :id", { id: order.id })
        .execute();

      await querun.commitTransaction();
      return { message: "Order cancelled successfully" };
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => OrderUpdateOutput)
  async pendingOrder(
    @Arg("order_uuid") uuid: string,
    @Ctx() ctx: Context
  ): Promise<OrderUpdateOutput> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if (!ctx.auth) throw new ApolloError("Invalid user type");

      let order = await querun.manager.getRepository(Order).findOne({
        where: { uuid },
        relations: [
          "user",
          "user.userType",
          "status",
          "statusHistory",
          "messageRoom",
        ],
      });
      if (!order) {
        throw new ApolloError("Order not found");
      }

      if (ctx.auth.id !== order.userId) {
        throw new ApolloError("You are not allowed to use this route.");
      }

      if (order.status.slug !== OrderStatusTypes.not_available) {
        throw new ApolloError("Invalid Order status");
      }

      let pendingStatus = await querun.manager
        .getRepository(OrderStatus)
        .findOne({
          where: { slug: OrderStatusTypes.pending },
        });

      if (!pendingStatus) throw new ApolloError("Invalid status");

      await querun.manager
        .createQueryBuilder()
        .update(Order)
        .set({
          orderStatusId: pendingStatus.id,
        })
        .where({ id: order.id })
        .execute();

      let orderStatusHistory = new OrderStatusHistory();
      orderStatusHistory.order = order;
      orderStatusHistory.status = pendingStatus;
      orderStatusHistory = await querun.manager.save(orderStatusHistory);

      await querun.commitTransaction();
      return { message: "Order set to pending" };
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => OrderUpdateOutput)
  async reorder(
    @Arg("order_uuid") uuid: string,
    @Ctx() ctx: Context
  ): Promise<OrderUpdateOutput> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if (!ctx.auth) throw new ApolloError("Invalid user type");

      let order = await querun.manager.getRepository(Order).findOne({
        where: { uuid },
        relations: [
          "user",
          "user.userType",
          "status",
          "statusHistory",
          "messageRoom",
        ],
      });
      if (!order) {
        throw new ApolloError("Order not found");
      }

      if (ctx.auth.id !== order.userId) {
        throw new ApolloError("You are not allowed to use this route.");
      }

      if ((await order.status).slug !== OrderStatusTypes.pending) {
        throw new ApolloError("Invalid Order status");
      }

      let newEnquiryStatus = await querun.manager
        .getRepository(OrderStatus)
        .findOne({
          where: { slug: OrderStatusTypes.new_enquiry },
        });

      if (!newEnquiryStatus) throw new ApolloError("Invalid status");

      await querun.manager
        .createQueryBuilder()
        .update(Order)
        .set({
          orderStatusId: newEnquiryStatus.id,
        })
        .where({ id: order.id })
        .execute();

      let orderStatusHistory = new OrderStatusHistory();
      orderStatusHistory.order = order;
      orderStatusHistory.status = newEnquiryStatus;
      orderStatusHistory = await querun.manager.save(orderStatusHistory);

      await querun.commitTransaction();
      return { message: "Order sent again" };
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => OrderUpdateOutput)
  async editOrder(
    @Arg("order_uuid") uuid: string,
    @Arg("quantity") quantity: number,
    @Ctx() ctx: Context
  ): Promise<OrderUpdateOutput> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if (!ctx.auth) throw new ApolloError("Invalid user type");

      let order = await querun.manager.getRepository(Order).findOne({
        where: { uuid },
        relations: ["user", "status", "statusHistory", "messageRoom"],
      });
      if (!order) {
        throw new ApolloError("Order not found");
      }

      if (ctx.auth.id !== order.userId) {
        throw new ApolloError("You are not allowed to use this route.");
      }

      order.quantity = quantity;
      order = await querun.manager.save(order);

      await querun.commitTransaction();
      return { message: "Order edited successfully" };
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => OrderUpdateOutput)
  async placeOrder(
    @Arg("order_uuid") uuid: string,
    @Ctx() ctx: Context
  ): Promise<OrderUpdateOutput> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if (!ctx.auth) throw new ApolloError("Invalid user type");
      let order = await querun.manager.getRepository(Order).findOne({
        where: { uuid },
        relations: ["user", "status", "statusHistory", "messageRoom"],
      });
      if (!order) {
        throw new ApolloError("Order not found");
      }

      if (ctx.auth.id !== order.userId) {
        throw new ApolloError("You are not allowed to use this route.");
      }

      if ((await order.status).slug !== OrderStatusTypes.available) {
        throw new ApolloError("Invalid order status");
      }

      let placeOrder = await querun.manager.getRepository(OrderStatus).findOne({
        where: { slug: OrderStatusTypes.placed_order },
      });

      if (!placeOrder) throw new ApolloError("Invalid order");

      await querun.manager
        .createQueryBuilder()
        .update(Order)
        .set({
          orderStatusId: placeOrder.id,
        })
        .where({ id: order.id })
        .execute();

      let orderStatusHistory = new OrderStatusHistory();
      orderStatusHistory.order = order;
      orderStatusHistory.status = placeOrder;
      orderStatusHistory = await querun.manager.save(orderStatusHistory);

      let messageRoom = await order.messageRoom;
      let message = new Message();
      message.userId = 1;
      message.message = "Your order has been placed successfully";
      message.type = MessageTypes.placed_order;
      message.messageRoom = messageRoom;
      message.forUserTypeId = ctx.auth.userTypeId;
      message = await querun.manager.save(message);

      await querun.commitTransaction();
      return { message: "Order placed successfully" };
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => OrderUpdateOutput)
  async changeStatusAdmin(
    @Arg("status")
    status: OrderStatusTypes,

    @Arg("orderUUID")
    uuid: string,

    @Ctx() ctx: Context,

    @Arg("messageForDealer", { nullable: true })
    messageForDealer?: string,

    @Arg("messageForBackoffice", { nullable: true })
    messageForBackoffice?: string,

    @Arg("delivered", { nullable: true })
    delivered?: number,

    @Arg("notes", { nullable: true })
    notes?: string,

    @Arg("deliveryPaymentType", { nullable: true })
    deliveryPaymentType?: string
  ): Promise<OrderUpdateOutput> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if (!ctx.auth) throw new ApolloError("Invalid user type");

      if ((await ctx.auth.userType).slug !== UserTypes.admin) {
        throw new ApolloError("You are not allowed to use this route.");
      }

      let dealerUserType = await querun.manager
        .getRepository(UserType)
        .findOne({
          where: {
            slug: UserTypes.dealer,
          },
        });

      let backofficeUserType = await querun.manager
        .getRepository(UserType)
        .findOne({
          where: {
            slug: UserTypes.backoffice,
          },
        });

      let order = await querun.manager.getRepository(Order).findOne({
        where: { uuid },
        relations: ["user", "status", "statusHistory", "messageRoom"],
      });
      if (!order) {
        throw new ApolloError("Order not found");
      }

      let newStatus = await querun.manager.getRepository(OrderStatus).findOne({
        where: { slug: status },
      });

      if (!newStatus) throw new ApolloError("Invalid new status");

      let oldStatus = await order.status;

      if (
        (oldStatus.slug === OrderStatusTypes.enquired ||
          oldStatus.slug === OrderStatusTypes.not_available ||
          oldStatus.slug === OrderStatusTypes.pending) &&
        newStatus.slug !== OrderStatusTypes.available
      ) {
        throw new ApolloError("Invalid status change");
      } else if (
        oldStatus.slug === OrderStatusTypes.available &&
        newStatus.slug !== OrderStatusTypes.placed_order
      ) {
        throw new ApolloError("Invalid status change");
      } else if (
        oldStatus.slug === OrderStatusTypes.placed_order &&
        newStatus.slug !== OrderStatusTypes.order_confirmed
      ) {
        throw new ApolloError("Invalid status change");
      } else if (
        oldStatus.slug === OrderStatusTypes.order_confirmed &&
        newStatus.slug !== OrderStatusTypes.dispatched
      ) {
        throw new ApolloError("Invalid status change");
      }

      await querun.manager
        .createQueryBuilder()
        .update(Order)
        .set({
          orderStatusId: newStatus.id,
        })
        .where({ id: order.id })
        .execute();

      let orderStatusHistory = new OrderStatusHistory();
      orderStatusHistory.order = order;
      orderStatusHistory.status = newStatus;
      orderStatusHistory = await querun.manager.save(orderStatusHistory);

      if (newStatus.slug === OrderStatusTypes.dispatched) {
        let delivery = new Delivery();
        delivery.delivered = order.quantity;
        if (!deliveryPaymentType) {
          throw new ApolloError("Delivery payment type not provided");
        }
        delivery.paymentType = deliveryPaymentType;
        delivery.notes = notes ?? "";
        delivery.order = order;
        delivery.addedBy = ctx.auth;
        delivery = await querun.manager.save(delivery);
      }

      let messageToSave: string | undefined;
      let messageType = MessageTypes.text;
      let notificationType = await querun.manager
        .getRepository(NotificationType)
        .findOne({
          where: {
            slug: NotificationTypes.text,
          },
        });
      if (!notificationType) throw new ApolloError("Invalid notification type");
      let notify = false;

      switch (newStatus.slug) {
        case OrderStatusTypes.not_available:
          messageToSave = "The quantity you requested is not available";
          messageType = MessageTypes.not_available;
          notify = true;
          break;
        case OrderStatusTypes.available:
          messageToSave = "The quantity you requested is available";
          messageType = MessageTypes.available;
          notify = true;
          break;
        case OrderStatusTypes.dispatched:
          messageToSave = "Order dispatched";
          messageType = MessageTypes.dispatched;
          break;
        case OrderStatusTypes.completed:
          messageToSave = "Order completed";
          messageType = MessageTypes.completed;
          notify = true;
          break;
      }

      let messageRoom = await order.messageRoom;

      if (messageToSave) {
        let message = new Message();
        message.userId = 1;
        message.message = messageToSave;
        message.type = messageType;
        message.messageRoomId = messageRoom.id;
        if (dealerUserType) message.forUserTypeId = dealerUserType.id;
        message = await querun.manager.save(message);

        if (notify) {
          let notification = new Notification();
          notification.title =
            "Order: " + this.sid(order) + " - " + messageToSave;
          notification.message =
            "Order: " + this.sid(order) + " - " + messageToSave;
          notification.notificationType = notificationType;
          notification.user = order.user;
          await querun.manager.save(notification);
        }
      }

      if (messageForDealer) {
        let message = new Message();
        message.userId = 1;
        message.message = messageForDealer;
        message.type = messageType;
        message.messageRoomId = messageRoom.id;
        if (dealerUserType) message.forUserTypeId = dealerUserType.id;
        message = await querun.manager.save(message);
        await querun.manager
          .createQueryBuilder()
          .update(Order)
          .set({
            notes: order.notes + "\nMessage for Dealer: " + messageForDealer,
          })
          .where("orders.id = :id", { id: order.id })
          .execute();
      }

      if (messageForBackoffice) {
        let message = new Message();
        message.userId = 1;
        message.message = messageForBackoffice;
        message.type = messageType;
        message.messageRoomId = messageRoom.id;
        if (backofficeUserType) message.forUserTypeId = backofficeUserType.id;
        message = await querun.manager.save(message);
        await querun.manager
          .createQueryBuilder()
          .update(Order)
          .set({
            notes:
              order.notes + "\nMessage for Backoffice: " + messageForBackoffice,
          })
          .where("orders.id = :id", { id: order.id })
          .execute();
      }

      await querun.commitTransaction();
      return { message: "Order updated successfully" };
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => OrderUpdateOutput)
  async changeStatusBackoffice(
    @Arg("status") status: OrderStatusTypes,
    @Arg("orderUUID") uuid: string,
    @Ctx() ctx: Context
  ): Promise<OrderUpdateOutput> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if (!ctx.auth) throw new ApolloError("Invalid user type");

      let order = await querun.manager.getRepository(Order).findOne({
        where: { uuid },
        relations: [
          "user",
          "user.userType",
          "status",
          "statusHistory",
          "messageRoom",
        ],
      });
      if (!order) {
        throw new ApolloError("Order not found");
      }

      if ((await ctx.auth.userType).slug !== UserTypes.backoffice) {
        throw new ApolloError("You are not allowed to use this route.");
      }

      let newStatus = await querun.manager.getRepository(OrderStatus).findOne({
        where: {
          slug: status,
        },
      });

      if (!newStatus) throw new ApolloError("Invalid new status");

      let oldStatus = await order.status;

      if (
        oldStatus.slug === OrderStatusTypes.available &&
        newStatus.slug !== OrderStatusTypes.enquired
      ) {
        throw new ApolloError("Invalid status change");
      } else if (
        oldStatus.slug === OrderStatusTypes.enquired &&
        newStatus.slug !== OrderStatusTypes.available
      ) {
        throw new ApolloError("Invalid status change");
      } else if (
        oldStatus.slug === OrderStatusTypes.available &&
        newStatus.slug !== OrderStatusTypes.placed_order
      ) {
        throw new ApolloError("Invalid status change");
      } else if (
        oldStatus.slug === OrderStatusTypes.placed_order &&
        newStatus.slug !== OrderStatusTypes.dispatched
      ) {
        throw new ApolloError("Invalid status change");
      } else if (
        oldStatus.slug === OrderStatusTypes.dispatched &&
        newStatus.slug !== OrderStatusTypes.completed &&
        newStatus.slug !== OrderStatusTypes.dispatched
      ) {
        throw new ApolloError("Invalid status change");
      }

      await querun.manager
        .createQueryBuilder()
        .update(Order)
        .set({
          orderStatusId: newStatus.id,
        })
        .where({ id: order.id })
        .execute();

      let orderStatusHistory = new OrderStatusHistory();
      orderStatusHistory.order = order;
      orderStatusHistory.status = newStatus;
      orderStatusHistory = await querun.manager.save(orderStatusHistory);

      let messageToSave: string | undefined;
      let messageType = MessageTypes.text;

      if (newStatus.slug === OrderStatusTypes.received_stock) {
        messageToSave = "Order stock has been received";
        messageType = MessageTypes.available;
      } else if (newStatus.slug === OrderStatusTypes.completed) {
        messageToSave = `Order Completed`;
        messageType = MessageTypes.completed;
      }

      if (messageToSave) {
        let messageRoom = await order.messageRoom;
        let message = new Message();
        message.userId = ctx.auth.id;
        message.message = messageToSave;
        message.type = messageType;
        message.messageRoomId = messageRoom.id;
        message.forUserTypeId = (await order.user).userTypeId;
        message = await querun.manager.save(message);
      }

      await querun.commitTransaction();
      return { message: "Order updated successfully" };
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => OrderUpdateOutput)
  async updateOrderContacts(
    @Arg("order_uuid") uuid: string,
    @Arg("data") data: OrderContactUpdateData,
    @Ctx() ctx: Context
  ): Promise<OrderUpdateOutput> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if (!ctx.auth) throw new ApolloError("Invalid user type");

      let order = await querun.manager.getRepository(Order).findOne({
        where: { uuid },
        relations: ["user", "user.userType", "orderContacts"],
      });
      if (!order) throw new ApolloError("Order not found");

      if ((await ctx.auth.userType).slug !== UserTypes.admin) {
        throw new ApolloError("You are not allowed to use this route.");
      }

      await map(await order.orderContacts, async (e) => {
        await querun.manager.remove(e);
      });

      await map(data.contacts, async (e) => {
        if (!order) throw new ApolloError("Order not found");
        let orderContact = new OrderContact();
        orderContact.name = e.name;
        orderContact.phone = e.phone;
        orderContact.order = order;
        await querun.manager.save(orderContact);
      });

      await querun.commitTransaction();
      return { message: "Order updated successfully" };
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => Inventory, { nullable: true })
  async inventoryOfOrder(
    @Ctx() ctx: Context,
    @Arg("uuid") uuid: string
  ): Promise<Inventory | null> {
    let order = await ctx.connection.getRepository(Order).findOne({
      where: { uuid },
    });
    if (!order) throw new ApolloError("Order not found");
    let inventory = await ctx.connection.getRepository(Inventory).findOne({
      where: {},
      relations: ["importers"],
    });
    return inventory ?? null;
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => ReportsOutput)
  async reports(
    @Ctx() ctx: Context,
    @Arg("query") query: ReportsInput
  ): Promise<ReportsOutput> {
    if (!ctx.auth) throw new ApolloError("Invalid user type");
    const authUserType = await ctx.auth.userType;
    if (authUserType.slug !== UserTypes.admin) {
      throw new ApolloError("You are not allowed to use this route.");
    }
    let whereOptions: FindOptionsWhere<Order>[] = [];
    let startDate = query.startDate
      ? parseISO(query.startDate)
      : startOfMonth(Date.now());
    let endDate = query.endDate
      ? parseISO(query.endDate)
      : endOfDay(Date.now());
    if (query.status) {
      let queryStatus = await ctx.connection.getRepository(OrderStatus).find({
        where: query.status.map((e) => ({ slug: e })),
      });
      if (queryStatus) {
        for (var i = 0; i < queryStatus.length; i++) {
          whereOptions.push({
            orderStatusId: queryStatus[i].id,
          });
        }
      }
    }
    whereOptions = whereOptions.map((e) => {
      e.createdAt = Between(startDate, endDate);
      return e;
    });
    // for (var i = 0; i < whereOptions.length; i++) {
    //   whereOptions[i] = {
    //     createdAt: Between(startDate, endDate),
    //     ...whereOptions[i],
    //   };
    // }

    let orders = await ctx.connection.getRepository(Order).find({
      where: [...whereOptions],
      relations: ["user", "user.userProfile", "catalogue", "status"],
      order: { createdAt: "DESC" },
    });

    let customOrders = await ctx.connection.getRepository(CustomOrder).find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: "DESC" },
    });

    let deliveries = await ctx.connection.getRepository(Delivery).find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: "DESC" },
      relations: [
        "order",
        "order.catalogue",
        "order.user",
        "order.user.userProfile",
      ],
    });

    orders = await filter(orders, async (o) => {
      if (query.catalagueUuid) {
        if ((await o.catalogue)?.uuid === query.catalagueUuid) return true;
        else return false;
      }
      return true;
    });

    deliveries = await filter(deliveries, async (d) => {
      if (query.catalagueUuid) {
        if (d.order.catalogue?.uuid === query.catalagueUuid) return true;
        else return false;
      }
      return true;
    });

    orders = await filter(orders, async (o) => {
      if (query.patternNo) {
        if (o.patternNo === query.patternNo) return true;
        else return false;
      }
      return true;
    });

    deliveries = await filter(deliveries, async (d) => {
      if (query.patternNo) {
        if (d.order.patternNo === query.patternNo) return true;
        else return false;
      }
      return true;
    });

    orders = await filter(orders, async (o) => {
      if (query.dealerName) {
        const name = (o.user.firstName || "") + " " + (o.user.lastName || "");
        if (name.search(query.dealerName) >= 0) return true;
        else if (
          ((await o.user.userProfile)?.phone ?? "").search(query.dealerName) >=
          0
        )
          return true;
        else if (
          ((await o.user.userProfile)?.city ?? "").search(query.dealerName) >= 0
        )
          return true;
        else if (o.user.email.search(query.dealerName) >= 0) return true;
        else if (o.user.email.search(query.dealerName) >= 0) return true;
        else return false;
      }
      return true;
    });

    deliveries = await filter(deliveries, async (d) => {
      if (query.dealerName) {
        const user = d.order.user;
        const name = (user.firstName || "") + " " + (user.lastName || "");
        if (name.search(query.dealerName) >= 0) return true;
        else if (
          ((await user.userProfile)?.phone ?? "").search(query.dealerName) >= 0
        )
          return true;
        else if (
          ((await user.userProfile)?.city ?? "").search(query.dealerName) >= 0
        )
          return true;
        else if (user.email.search(query.dealerName) >= 0) return true;
        else if (user.email.search(query.dealerName) >= 0) return true;
        else return false;
      }
      return true;
    });

    // Data for order list
    const orderColumns = [
      "SID",
      "Pattern No.",
      "Catalog",
      "Type",
      "Quantity",
      "Reference",
      "Status",
      "Dealer Name",
      "Date",
    ];

    const customOrderColumns = [
      "Title",
      "Name",
      "Phone",
      "Width",
      "Height",
      "Remarks",
      "Date",
    ];

    const deliveryColumns = [
      "Delivery Units",
      "Payment Type",
      "Notes",
      "Date",
      "SID",
      "Pattern No.",
      "Catalog",
      "Type",
    ];

    const orderData = await map(orders, async (o) => {
      return [
        this.sid(o),
        o.patternNo,
        `${o.catalogue?.name || ""}`,
        o.type,
        o.quantity,
        o.reference,
        `${o.status.status || ""}`,
        `${o.user.firstName || ""} ${o.user.lastName || ""}`,
        `${format(o.createdAt, "PPpp")}`,
      ];
    });

    const customOrderData = await map(customOrders, async (o) => {
      return [
        o.title,
        o.name,
        o.phone,
        o.width,
        o.height,
        o.remarks,
        `${o.createdAt ? format(o.createdAt, "PPpp") : "NULL"}`,
      ];
    });

    const deliveryData = await map(deliveries, async (d) => {
      return [
        d.delivered,
        d.paymentType,
        d.notes,
        `${format(d.createdAt, "PPpp")}`,
        this.sid(d.order),
        d.order.patternNo,
        `${d.order.catalogue?.name || ""}`,
        d.order.type,
      ];
    });

    var buffer = xlsx.build([
      {
        name: "Orders",
        data: [orderColumns, ...orderData],
        options: {},
      },
      {
        name: "CustomOrders",
        data: [customOrderColumns, ...customOrderData],
        options: {},
      },
      {
        name: "Deliveries",
        data: [deliveryColumns, ...deliveryData],
        options: {},
      },
    ]);
    let filename = uuidv4() + ".xlsx";

    await RedisClient.instance().client.set(
      filename,
      buffer.toString("base64")
    );

    await RedisClient.instance().client.expireAt(
      filename,
      add(new Date(), {
        minutes: 5,
      })
    );

    return {
      reportsUrl: `${config.hostUrl}/download?filename=${filename}`,
      orders,
      customOrders,
      deliveries,
    };
  }
}
