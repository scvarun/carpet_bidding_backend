import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcryptjs";
import config from "./../config";

export class createUsersTable1644585104014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await bcrypt.hash("password", config.hashSalt);
    await queryRunner.query(`
            CREATE TABLE users(
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                uuid VARCHAR(36) NOT NULL UNIQUE,
                firstName VARCHAR(255) NOT NULL,
                lastName VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                blocked TINYINT(1) NOT NULL DEFAULT 0,
                userTypeId INT UNSIGNED NOT NULL,
                PRIMARY KEY ( id ),
                CONSTRAINT FK_users_userTypes FOREIGN KEY ( userTypeId ) REFERENCES userTypes(id)
            )
        `);
    await queryRunner.query(`
            CREATE TABLE localAuths(
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                password VARCHAR(255) NOT NULL DEFAULT "${password}",
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                userId INT UNSIGNED NOT NULL,
                PRIMARY KEY ( id ),
                CONSTRAINT FK_localAuths_users FOREIGN KEY ( userId ) REFERENCES users(id)
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE localAuths DROP FOREIGN KEY FK_localAuths_users
    `);
    await queryRunner.query(`
      DROP TABLE localAuths;
    `);
    await queryRunner.query(`
      ALTER TABLE users DROP FOREIGN KEY FK_users_userTypes
    `);
    await queryRunner.query(`
      DROP TABLE users;
    `);
  }
}
