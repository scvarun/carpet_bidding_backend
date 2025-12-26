import { ApolloError } from "apollo-server-express";
import { parseISO, startOfMonth, endOfDay } from "date-fns";
import "reflect-metadata";
import {
  Resolver,
  ResolverInterface,
  Root,
  FieldResolver,
  Arg,
  Ctx,
  Query,
  UseMiddleware,
  Field,
  InputType,
  Mutation,
} from "type-graphql";
import { Between, FindOptionsWhere } from "typeorm";
import { Context } from "../context";
import { Delivery, Order, UserTypes } from "../entity/internal";
import { AuthMiddleware } from "../middlewares/authMiddleware";

@InputType()
class DeliveryQueryInput {
  @Field(() => String, { nullable: true })
  startDate?: string;

  @Field(() => String, { nullable: true })
  endDate?: string;
}

@Resolver(() => Delivery)
export class DeliveryResolver implements ResolverInterface<Delivery> {
  @UseMiddleware(AuthMiddleware)
  @Query(() => [Delivery])
  async deliveries(
    @Ctx() ctx: Context,
    @Arg("query") query: DeliveryQueryInput
  ): Promise<Delivery[]> {
    const authUserType = await ctx.auth?.userType;
    let whereOptions : FindOptionsWhere<Delivery>[] = [];
    let startDate = query.startDate
      ? parseISO(query.startDate)
      : startOfMonth(Date.now());
    let endDate = query.endDate
      ? parseISO(query.endDate)
      : endOfDay(Date.now());
    if (authUserType?.slug !== UserTypes.admin) {
      throw new ApolloError(
        "Forbidden",
        "You are not allowed to use this route."
      );
    }
    whereOptions.push({
      createdAt: Between(startDate, endDate),
    });
    return await ctx.connection.getRepository(Delivery).find({
      where: [...whereOptions],
      relations: ["order", "order.user", "order.user.userProfile"],
      order: { createdAt: "DESC" },
    });
  }

  @FieldResolver(() => Order)
  async order(@Root() root: Delivery): Promise<Order> {
    return await root.order;
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => String)
  async setReadByAccounting(
    @Arg("uuid") uuid: string,
    @Arg("isRead") isRead: boolean,
    @Ctx() ctx: Context
  ): Promise<string> {
    const querun = ctx.connection.createQueryRunner();
    try {
      if ((await ctx.auth?.userType)?.slug !== UserTypes.admin) {
        throw new ApolloError(
          "You are not allowed to use this route",
          "Forbidden"
        );
      }
      await querun.connect();
      await querun.startTransaction();
      let delivery = await querun.manager.getRepository(Delivery).findOne({
        where: { uuid },
      });

      if (!delivery) throw new ApolloError("Delivery not found");

      await querun.manager
        .createQueryBuilder()
        .update(Delivery)
        .set({
          readByAccounting: isRead,
        })
        .where({ id: delivery.id })
        .execute();

      await querun.commitTransaction();
      return "Delivery updated successfully";
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }
}
