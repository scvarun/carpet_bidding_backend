import { MigrationInterface, QueryRunner } from "typeorm";

export class createCustomOrdersTable1645809796393
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE customOrders(
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            uuid VARCHAR(36) NOT NULL UNIQUE,
            title VARCHAR(255) NOT NULL, 
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(255) NOT NULL,
            width VARCHAR(255) NOT NULL,
            height VARCHAR(255) NOT NULL,
            remarks VARCHAR(2000) NOT NULL,
            imageId INT UNSIGNED,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deletedAt DATETIME,
            PRIMARY KEY ( id ),
            CONSTRAINT FK_custom_orders_image FOREIGN KEY ( imageId ) REFERENCES medias(id)
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE customOrders
      `);
  }
}
