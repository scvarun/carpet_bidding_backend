import { MigrationInterface, QueryRunner } from "typeorm";

export class createCataloguesTable1645837903414 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE catalogues(
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            uuid VARCHAR(36) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            size VARCHAR(255) NOT NULL,
            rate VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deletedAt DATETIME,
            PRIMARY KEY ( id )
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE catalogues
      `);
  }
}
