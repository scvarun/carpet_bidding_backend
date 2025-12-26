import { Factory, Seeder } from "typeorm-seeding";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { OrderStatus, OrderStatusTypes } from "../entity/internal";

export default class CreateOrderStatus implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(OrderStatus)
      .values([
        {
          id: 1,
          uuid: uuidv4(),
          status: "New",
          slug: OrderStatusTypes.new_enquiry,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          uuid: uuidv4(),
          status: "Enquired",
          slug: OrderStatusTypes.enquired,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          uuid: uuidv4(),
          status: "Available",
          slug: OrderStatusTypes.available,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          uuid: uuidv4(),
          status: "Placed Order",
          slug: OrderStatusTypes.placed_order,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          uuid: uuidv4(),
          status: "Order Confirmed",
          slug: OrderStatusTypes.order_confirmed,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          uuid: uuidv4(),
          status: "Received Stock",
          slug: OrderStatusTypes.received_stock,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          uuid: uuidv4(),
          status: "Dispatched",
          slug: OrderStatusTypes.dispatched,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 8,
          uuid: uuidv4(),
          status: "Completed",
          slug: OrderStatusTypes.completed,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 9,
          uuid: uuidv4(),
          status: "Cancelled",
          slug: OrderStatusTypes.cancelled,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 10,
          uuid: uuidv4(),
          status: "Not Available",
          slug: OrderStatusTypes.not_available,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 11,
          uuid: uuidv4(),
          status: "Pending",
          slug: OrderStatusTypes.pending,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .execute();
  }
}
