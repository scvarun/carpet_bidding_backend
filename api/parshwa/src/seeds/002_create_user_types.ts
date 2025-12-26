import { Factory, Seeder } from "typeorm-seeding";
import { Connection } from "typeorm";
import { UserType, UserTypes } from "./../entity/internal";

export default class CreateUserTypes implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(UserType)
      .values([
        {
          slug: UserTypes.admin,
          title: "Admin",
          description: "Admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          slug: UserTypes.backoffice,
          title: "BackOffice",
          description: "BackOffice staff",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          slug: UserTypes.dealer,
          title: "Dealer",
          description: "Dealer",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .execute();
  }
}
