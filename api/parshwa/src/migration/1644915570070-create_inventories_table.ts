import { MigrationInterface, QueryRunner } from "typeorm";

export class createInventoriesTable1645838061354 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE inventories(
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            uuid VARCHAR(36) NOT NULL UNIQUE,
            type VARCHAR(255) NOT NULL,
            quantity INT UNSIGNED NOT NULL DEFAULT(0),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deletedAt DATETIME,
            catalogueId INT UNSIGNED NOT NULL,
            PRIMARY KEY ( id ),
            CONSTRAINT FK_inventories_catalogues FOREIGN KEY ( catalogueId ) REFERENCES catalogues(id)
        )
    `);

    await queryRunner.query(`
        CREATE TABLE rolls(
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            patternNo VARCHAR(255) NOT NULL,
            size VARCHAR(255),
            rate VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            inventoryId INT UNSIGNED NOT NULL,
            PRIMARY KEY ( id ),
            CONSTRAINT FK_rolls_inventories FOREIGN KEY ( inventoryId ) REFERENCES inventories(id)
        )
    `);

    await queryRunner.query(`
        CREATE TABLE importerForInventories(
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            inventoryId INT UNSIGNED NOT NULL,
            importerId INT UNSIGNED NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY ( id ),
            CONSTRAINT FK_importers_inventories FOREIGN KEY ( inventoryId ) REFERENCES inventories(id),
            CONSTRAINT FK_inventories_importers FOREIGN KEY ( importerId ) REFERENCES importers(id)
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE importerForInventories DROP FOREIGN KEY FK_inventories_importers
    `);
    await queryRunner.query(`
      ALTER TABLE importerForInventories DROP FOREIGN KEY FK_importers_inventories
    `);
    await queryRunner.query(`
        DROP TABLE importerForInventories
      `);
    await queryRunner.query(`
      ALTER TABLE rolls DROP FOREIGN KEY FK_rolls_inventories
    `);
    await queryRunner.query(`
        DROP TABLE rolls
      `);
    await queryRunner.query(`
      ALTER TABLE inventories DROP FOREIGN KEY FK_inventories_catalogues
    `);
    await queryRunner.query(`
        DROP TABLE inventories
      `);
  }
}
