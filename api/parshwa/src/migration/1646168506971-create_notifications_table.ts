import { MigrationInterface, QueryRunner } from "typeorm";

export class createNotificationsTable1646168506971
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE notificationTypes(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        slug VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        PRIMARY KEY ( id )
      )
    `);
    await queryRunner.query(`
      CREATE TABLE notifications(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        userId INT UNSIGNED NOT NULL,
        notificationTypeId INT UNSIGNED NOT NULL,
        title VARCHAR(255) NOT NULL,
        message VARCHAR(2000) NOT NULL,
        isRead TINYINT(1) NOT NULL DEFAULT(0),
        modelUUID VARCHAR(255),
        modelType VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY ( id ),
        CONSTRAINT FK_notifications_notificationTypes FOREIGN KEY ( notificationTypeId ) REFERENCES notificationTypes(id),
        CONSTRAINT FK_notifications_users FOREIGN KEY ( userId ) REFERENCES users(id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE notifications DROP FOREIGN KEY FK_notifications_users
    `);
    await queryRunner.query(`
      ALTER TABLE notifications DROP FOREIGN KEY FK_notifications_notificationTypes
    `);
    await queryRunner.query(`
      DROP TABLE notifications
    `);
    await queryRunner.query(`
      DROP TABLE notificationTypes
    `);
  }
}
