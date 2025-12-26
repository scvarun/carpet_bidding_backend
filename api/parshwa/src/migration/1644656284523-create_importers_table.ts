import { MigrationInterface, QueryRunner } from "typeorm";

export class createImportersTable1644656284523 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE importers(
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            uuid VARCHAR(36) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL, 
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(255) NOT NULL,
            address VARCHAR(2000) NOT NULL,
            city VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deletedAt DATETIME,
            PRIMARY KEY ( id )
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE importers
      `);
  }
}
