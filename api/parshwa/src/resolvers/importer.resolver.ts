import { ApolloError } from "apollo-server-express";
import { validate } from "./../lib/validate";
import "reflect-metadata";
import {
  Resolver,
  Query,
  Ctx,
  Field,
  Mutation,
  Arg,
  UseMiddleware,
  InputType,
} from "type-graphql";
import { Context } from "../context";
import { Importer } from "../entity/internal";
import { AuthMiddleware } from "../middlewares/authMiddleware";

@InputType()
class ImporterAddIput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  city: string;

  @Field()
  address: string;
}

@InputType()
class ImporterUpdateInput {
  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  city?: string | null;

  @Field(() => String, { nullable: true })
  address?: string | null;
}

@Resolver((of) => Importer)
export class ImporterResolver {
  @UseMiddleware(AuthMiddleware)
  @Mutation(() => Importer)
  async addImporter(
    @Arg("data") data: ImporterAddIput,
    @Ctx() ctx: Context
  ): Promise<Importer> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if ((await ctx.auth?.userType)?.slug !== "admin") {
        throw new ApolloError(
          "You are not allowed to use this route",
          "Forbidden"
        );
      }
      const { name, email, phone, city, address } = data;
      const checkIfExists = await querun.manager.getRepository(Importer).count({
        where: { email },
      });
      if (checkIfExists > 0) {
        throw new ApolloError("Importer already exists", "Forbidden");
      }
      let importer = new Importer();
      importer.name = name;
      importer.email = email;
      importer.phone = phone;
      importer.city = city;
      importer.address = address;
      const isInvalid = await validate(importer);
      if (isInvalid) throw new ApolloError(isInvalid, "ValidationError");
      importer = await querun.manager.getRepository(Importer).save(importer);
      await querun.commitTransaction();
      return importer;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => Importer)
  async updateImporter(
    @Arg("uuid") uuid: string,
    @Arg("data") data: ImporterUpdateInput,
    @Ctx() ctx: Context
  ): Promise<Importer> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if ((await ctx.auth?.userType)?.slug !== "admin") {
        throw new ApolloError(
          "You are not allowed to use this route",
          "Forbidden"
        );
      }
      const { name, email, phone, city, address } = data;
      let importer = await querun.manager.getRepository(Importer).findOne({
        where: { uuid },
      });
      if (!importer) {
        throw new ApolloError("No importer found", "ImporterNotFound");
      }
      importer.name = name ?? importer.name;
      importer.email = email ?? importer.email;
      importer.phone = phone ?? importer.phone;
      importer.city = city ?? importer.city;
      importer.address = address ?? importer.address;
      const isInvalid = await validate(importer);
      if (isInvalid) throw new ApolloError(isInvalid, "ValidationError");
      importer = await querun.manager.getRepository(Importer).save(importer);
      await querun.commitTransaction();
      return importer;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => Importer)
  async removeImporter(
    @Arg("uuid") uuid: string,
    @Ctx() ctx: Context
  ): Promise<Importer> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if ((await ctx.auth?.userType)?.slug !== "admin") {
        throw new ApolloError(
          "You are not allowed to use this route",
          "Forbidden"
        );
      }
      let importer = await querun.manager.getRepository(Importer).findOne({
        where: { uuid },
      });
      if (!importer) {
        throw new ApolloError("No importer found", "ImporterNotFound");
      }
      importer = await querun.manager
        .getRepository(Importer)
        .softRemove(importer);
      await querun.commitTransaction();
      return importer;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => [Importer])
  async importers(@Ctx() ctx: Context): Promise<Importer[]> {
    if ((await ctx.auth?.userType)?.slug !== "admin") {
      throw new ApolloError(
        "You are not allowed to use this route",
        "Forbidden"
      );
    }
    const importers = await ctx.connection.getRepository(Importer).find({
      withDeleted: false,
      order: { createdAt: "DESC" },
    });
    return importers;
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => Importer)
  async importer(
    @Arg("uuid") uuid: string,
    @Ctx() ctx: Context
  ): Promise<Importer> {
    if ((await ctx.auth?.userType)?.slug !== "admin") {
      throw new ApolloError(
        "You are not allowed to use this route",
        "Forbidden"
      );
    }
    const importer = await ctx.connection.getRepository(Importer).findOne({
      where: { uuid },
      withDeleted: false,
    });
    if (!importer) {
      throw new ApolloError("No importer found", "ImporterNotFound");
    }
    return importer;
  }
}
