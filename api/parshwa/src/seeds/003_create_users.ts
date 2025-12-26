import { Factory, Seeder } from "typeorm-seeding";
import { Connection } from "typeorm";
import { UserProps, LocalAuth, User } from "../entity/internal";
import { v4 as uuidv4 } from "uuid";
import { UserProfile } from "../entity/internal";

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          id: 1,
          uuid: uuidv4(),
          firstName: "Admin",
          lastName: "Test",
          email: "admin@test.com",
          userTypeId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          uuid: uuidv4(),
          firstName: "Backoffice",
          lastName: "Test",
          email: "backoffice@test.com",
          userTypeId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          uuid: uuidv4(),
          firstName: "Dealer",
          lastName: "Test",
          email: "dealer@test.com",
          userTypeId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .execute();
    await connection
      .createQueryBuilder()
      .insert()
      .into(LocalAuth)
      .values([
        {
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .execute();
    await connection
      .createQueryBuilder()
      .insert()
      .into(UserProfile)
      .values([
        {
          phone: "9876543210",
          address: "Testing Testing 1234",
          city: "Pune",
          companyName: "Testing Testing",
          gst: "18",
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          phone: "9876543210",
          address: "Testing Testing 1234",
          city: "Pune",
          companyName: "Testing Testing",
          gst: "18",
          userId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          phone: "9876543210",
          address: "Testing Testing 1234",
          city: "Pune",
          companyName: "Testing Testing",
          gst: "18",
          userId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .execute();
  }
}
