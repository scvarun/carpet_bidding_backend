import { Factory, Seeder } from "typeorm-seeding";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Catalogue } from "../entity/internal";

export default class CreateCatalogues implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Catalogue)
      .values([
        {
          id: 1,
          uuid: uuidv4(),
          name: "Fresco",
          size: "10",
          rate: "10",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          uuid: uuidv4(),
          name: "AsianPaints",
          size: "10",
          rate: "10",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .execute();
  }
}
