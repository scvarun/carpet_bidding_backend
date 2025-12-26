import { Max, Min } from "class-validator";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class PaginatedOutput {
  @Field()
  page: number;

  @Field()
  total: number;

  @Field()
  perPage: number;

  @Field()
  lastPage: number;
}
