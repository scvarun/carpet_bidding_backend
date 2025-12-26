import { MigrationInterface, QueryRunner } from "typeorm";

export class createUserTypesTable1644576980093 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE userTypes(
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                slug VARCHAR(255) UNIQUE NOT NULL,
                title VARCHAR(255) UNIQUE NOT NULL,
                description VARCHAR(255) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY ( id )
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE userTypes;
      `);
  }
}
