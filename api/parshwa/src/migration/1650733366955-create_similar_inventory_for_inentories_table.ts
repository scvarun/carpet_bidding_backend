import { MigrationInterface, QueryRunner } from "typeorm";

export class createSimilarInventoryForInentoriesTable1650733366955
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE similarInventoryForInventories(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        similarInventoryId INT UNSIGNED NOT NULL,
        inventoryId INT UNSIGNED NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY ( id ),
        CONSTRAINT FK_similarInventories_similar FOREIGN KEY ( similarInventoryId ) REFERENCES inventories(id),
        CONSTRAINT FK_similarInventories_inventory FOREIGN KEY ( inventoryId ) REFERENCES inventories(id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE similarInventoryForInventories
    `);
  }
}
