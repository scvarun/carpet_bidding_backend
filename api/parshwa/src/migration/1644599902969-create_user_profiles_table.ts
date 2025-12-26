import { MigrationInterface, QueryRunner } from "typeorm";

export class createUserProfilesTable1644599902969
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
         CREATE TABLE userProfiles(
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            city VARCHAR(255), 
            phone VARCHAR(255),
            companyName VARCHAR(255),
            gst VARCHAR(255),
            insidePune TINYINT(1) DEFAULT(1),
            address VARCHAR(2000), 
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            userId INT UNSIGNED NOT NULL,
            PRIMARY KEY ( id ),
            CONSTRAINT FK_userProfiles_users FOREIGN KEY ( userId ) REFERENCES users(id)
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE userProfiles DROP FOREIGN KEY FK_userProfiles_users
    `);
    await queryRunner.query(`
      DROP TABLE userProfiles;
    `);
  }
}
