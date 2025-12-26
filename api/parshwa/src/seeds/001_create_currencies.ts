import { Factory, Seeder } from "typeorm-seeding";
import { Connection } from "typeorm";
import { Currency } from "./../entity/internal";

export default class CreateCurrencies implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Currency)
      .values([
        {
          name: "Indian Rupees",
          symbol: "₹",
          slug: "inr",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .execute();
  }
}
