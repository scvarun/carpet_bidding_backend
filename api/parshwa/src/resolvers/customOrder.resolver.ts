import { ApolloError } from "apollo-server";
import "reflect-metadata";
import {
  Resolver,
  Query,
  Ctx,
  Field,
  Arg,
  UseMiddleware,
  InputType,
  Mutation,
  FieldResolver,
  Root,
} from "type-graphql";
import { Context } from "../context";
import { CustomOrder, Media } from "../entity/internal";
import { validate } from "../lib/validate";
import { AuthMiddleware } from "../middlewares/authMiddleware";

@InputType()
class CustomOrderAddInput {
  @Field() title: string;
  @Field() name: string;
  @Field() width: string;
  @Field() height: string;
  @Field() phone: string;
  @Field() remarks: string;
  @Field({ nullable: true }) image_uuid: string;
}

@InputType()
class CustomOrderUpdateInput {
  @Field() title: string;
  @Field() name: string;
  @Field() width: string;
  @Field() height: string;
  @Field() phone: string;
  @Field() remarks: string;
  @Field({ nullable: true }) image_uuid: string;
}

@Resolver((of) => CustomOrder)
export class CustomOrderResolver {
  @UseMiddleware(AuthMiddleware)
  @Query(() => CustomOrder, { nullable: true })
  async customOrder(
    @Arg("uuid") uuid: string,
    @Ctx() ctx: Context
  ): Promise<CustomOrder | null> {
    if ((await ctx.auth?.userType)?.slug !== "admin") {
      throw new ApolloError(
        "You are not allowed to use this route",
        "Forbidden"
      );
    }
    return (
      (await ctx.connection.getRepository(CustomOrder).findOne({
        where: { uuid },
        relations: ["image"],
      })) ?? null
    );
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => [CustomOrder])
  async customOrders(@Ctx() ctx: Context): Promise<CustomOrder[]> {
    if ((await ctx.auth?.userType)?.slug !== "admin") {
      throw new ApolloError(
        "You are not allowed to use this route",
        "Forbidden"
      );
    }
    return await ctx.connection.getRepository(CustomOrder).find({
      order: { createdAt: "DESC" },
    });
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => CustomOrder)
  async updateCustomOrder(
    @Arg("uuid") uuid: string,
    @Arg("data") data: CustomOrderUpdateInput,
    @Ctx() ctx: Context
  ): Promise<CustomOrder> {
    const querun = ctx.connection.createQueryRunner();
    try {
      if ((await ctx.auth?.userType)?.slug !== "admin") {
        throw new ApolloError(
          "You are not allowed to use this route",
          "Forbidden"
        );
      }
      await querun.connect();
      await querun.startTransaction();
      let customOrder = await querun.manager
        .getRepository(CustomOrder)
        .findOne({
          where: { uuid },
          relations: ["image"],
        });
      if (!customOrder) throw new ApolloError("Custom order not found");
      customOrder.name = data.name;
      customOrder.title = data.title;
      customOrder.width = data.width;
      customOrder.height = data.height;
      customOrder.remarks = data.remarks;
      customOrder.phone = data.phone;
      customOrder.image = null;

      if (data.image_uuid) {
        let image = await querun.manager.getRepository(Media).findOne({
          where: {
            uuid: data.image_uuid,
          },
        });
        if (!image)
          throw new ApolloError("File not found, please upload again");
        customOrder.image = image;
      }

      const isInvalid = await validate(customOrder);
      if (isInvalid) throw new ApolloError("ValidationError", isInvalid);
      customOrder = await querun.manager
        .getRepository(CustomOrder)
        .save(customOrder);
      await querun.commitTransaction();
      return customOrder;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => CustomOrder)
  async addCustomOrder(
    @Arg("data") data: CustomOrderAddInput,
    @Ctx() ctx: Context
  ): Promise<CustomOrder> {
    const querun = ctx.connection.createQueryRunner();
    try {
      if ((await ctx.auth?.userType)?.slug !== "admin") {
        throw new ApolloError(
          "You are not allowed to use this route",
          "Forbidden"
        );
      }
      await querun.connect();
      await querun.startTransaction();
      let customOrder = new CustomOrder();
      customOrder.name = data.name;
      customOrder.title = data.title;
      customOrder.width = data.width;
      customOrder.height = data.height;
      customOrder.remarks = data.remarks;
      customOrder.phone = data.phone;
      customOrder.image = null;

      if (data.image_uuid) {
        let image = await querun.manager.getRepository(Media).findOne({
          where: {
            uuid: data.image_uuid,
          },
        });
        if (!image)
          throw new ApolloError("File not found, please upload again");
        customOrder.image = image;
      }

      const isInvalid = await validate(customOrder);
      if (isInvalid) throw new ApolloError("ValidationError", isInvalid);
      customOrder = await querun.manager
        .getRepository(CustomOrder)
        .save(customOrder);
      await querun.commitTransaction();
      return customOrder;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @FieldResolver(() => Media, { nullable: true })
  async image(@Root() customOrder: CustomOrder): Promise<Media | null> {
    return await customOrder.image;
  }
}
