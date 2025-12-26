import "reflect-metadata";
import {
  Resolver,
  Query,
  Ctx,
  ObjectType,
  Field,
} from "type-graphql";
import { Context } from "../context";
import { UserType, User } from "../entity/internal";

@ObjectType()
export class HelloWorld {
  @Field()
  hello: string;
}

@Resolver((of) => UserType)
export class UserTypeResolver {
  @Query(() => HelloWorld)
  async hello(@Ctx() ctx: Context): Promise<HelloWorld> {
    let user = await ctx.connection.getRepository(User).findOne({
      where: { email: 'admin@test.com' },
      relations: ["userType", "localAuth"],
    });

    return {
      hello: "world",
    };
  }
}
