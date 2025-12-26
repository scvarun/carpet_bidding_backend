import { MigrationInterface, QueryRunner } from "typeorm";

export class createMediaTable1644601669806 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
         CREATE TABLE medias(
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            uuid VARCHAR(36) NOT NULL UNIQUE,
            mimeType VARCHAR(255) NOT NULL, 
            name VARCHAR(255) NOT NULL,
            title VARCHAR(255),
            description VARCHAR(255),
            awsKey VARCHAR(2000),
            url VARCHAR(2000),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            userId INT UNSIGNED NOT NULL,
            PRIMARY KEY ( id ),
            CONSTRAINT FK_medias_users FOREIGN KEY ( userId ) REFERENCES users(id)
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE medias;
    `);
  }
}
