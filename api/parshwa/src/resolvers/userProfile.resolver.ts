import { ApolloError } from "apollo-server-express";
import "reflect-metadata";
import { Resolver, Ctx, Field, Mutation, Arg, InputType } from "type-graphql";
import { Context } from "../context";
import { UserProfile, User } from "../entity/internal";

@InputType()
class UpdateUserProfileInput {
  @Field(() => String, { nullable: true })
  city?: string | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  companyName?: string | null;

  @Field(() => String, { nullable: true })
  gst?: string | null;

  @Field(() => String, { nullable: true })
  address?: string | null;

  @Field(() => Boolean)
  insidePune?: boolean | null;
}

@Resolver((of) => UserProfile)
export class UserProfileResolver {
  @Mutation(() => User)
  async updateUserProfile(
    @Arg("uuid") uuid: string,
    @Arg("data") data: UpdateUserProfileInput,
    @Ctx() ctx: Context
  ): Promise<User> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if (!ctx.auth) throw new ApolloError("Invalid user");
      let user = await ctx.connection.getRepository(User).findOne({
        where: { uuid },
        relations: ["userType", "userProfile"],
      });
      if (!user) {
        throw new ApolloError("User not found", "UserNotFound");
      } else if ((await ctx.auth.userType).slug === "admin") {
        let { city, address, companyName, gst, phone, insidePune } = data;
        let userProfile = await user.userProfile;
        userProfile.city = city ?? userProfile.city;
        userProfile.address = address ?? userProfile.address;
        userProfile.companyName = companyName ?? userProfile.companyName;
        userProfile.phone = phone ?? userProfile.phone;
        userProfile.gst = gst ?? userProfile.gst;
        userProfile.insidePune = insidePune ?? userProfile.insidePune;
        userProfile = await querun.manager
          .getRepository(UserProfile)
          .save(userProfile);
        await querun.commitTransaction();
        return user;
      }
      throw new ApolloError(
        "You are not allowed to use this route",
        "ValidationError"
      );
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }
}
