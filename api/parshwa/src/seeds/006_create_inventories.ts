import { Factory, Seeder } from "typeorm-seeding";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Inventory, InventoryTypes, Roll } from "../entity/internal";

export default class CreateOrderStatus implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Inventory)
      .values([
        {
          id: 1,
          catalogueId: 1,
          quantity: 200,
          type: InventoryTypes.rolls,
          uuid: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          catalogueId: 1,
          quantity: 200,
          type: InventoryTypes.catalog,
          uuid: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .execute();

    await connection
      .createQueryBuilder()
      .insert()
      .into(Roll)
      .values([
        {
          id: 1,
          inventoryId: 1,
          patternNo: "Test123",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .execute();
  }
}
