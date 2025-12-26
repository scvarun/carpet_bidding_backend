import "reflect-metadata";
import {
  Resolver,
  Query,
  Ctx,
  ObjectType,
  Field,
  registerEnumType,
  ResolverInterface,
  FieldResolver,
  Root,
} from "type-graphql";
import { Context } from "../context";
import { Order, OrderStatus, OrderStatusHistory } from "../entity/internal";

@Resolver((of) => OrderStatusHistory)
export class OrderStatusHistoryResolver
  implements ResolverInterface<OrderStatusHistory>
{
  @FieldResolver(() => Order)
  async order(@Root() order: OrderStatusHistory): Promise<Order | null> {
    return await order.order;
  }

  @FieldResolver(() => OrderStatus)
  async status(
    @Root() orderStatusHistory: OrderStatusHistory
  ): Promise<OrderStatus | null> {
    return await orderStatusHistory.status;
  }
}
