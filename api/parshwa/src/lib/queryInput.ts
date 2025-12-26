import { Max, Min } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class QueryInput {
  @Min(1)
  @Field(() => Number, { nullable: true })
  limit = 25;

  @Min(1)
  @Field(() => Number, { nullable: true })
  page = 1;

  @Field(() => String, { nullable: true })
  search?: string;
}
