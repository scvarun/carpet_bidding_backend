import { Factory, Seeder } from "typeorm-seeding";
import { Connection } from "typeorm";
import { NotificationType } from "../entity/internal";

export default class CreateNotificationTypes implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(NotificationType)
      .values([
        {
          id: 1,
          title: "Text",
          slug: "text",
        },
      ])
      .execute();
  }
}
