import { ApolloError } from "apollo-server-express";
import "reflect-metadata";
import { Resolver, Query, Ctx, Arg, UseMiddleware } from "type-graphql";
import { Context } from "../context";
import { Media } from "../entity/internal";
import { AuthMiddleware } from "../middlewares/authMiddleware";

@Resolver((of) => Media)
export class MediaResolver {
  @UseMiddleware(AuthMiddleware)
  @Query(() => Media)
  async media(@Arg("uuid") uuid: string, @Ctx() ctx: Context): Promise<Media> {
    let media = await ctx.connection.getRepository(Media).findOne({
      where: { uuid },
    });
    if (!media) {
      throw new ApolloError("Media not found");
    }
    return media;
  }
}
