import { MigrationInterface, QueryRunner } from "typeorm";

export class createMessagesTable1646168422496 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE messageRooms(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        orderId INT UNSIGNED NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY ( id ),
        CONSTRAINT FK_messageRooms_orders FOREIGN KEY ( orderId ) REFERENCES orders(id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE messages(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        messageRoomId INT UNSIGNED NOT NULL,
        userId INT UNSIGNED NOT NULL,
        message VARCHAR(2000) NOT NULL,
        type VARCHAR(36) NOT NULL,
        forUserTypeId INT UNSIGNED NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY ( id ),
        CONSTRAINT FK_messages_userTypes FOREIGN KEY ( forUserTypeId ) REFERENCES userTypes(id),
        CONSTRAINT FK_messages_messageRooms FOREIGN KEY ( messageRoomId ) REFERENCES messageRooms(id),
        CONSTRAINT FK_messages_users FOREIGN KEY ( userId ) REFERENCES users(id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE messages DROP FOREIGN KEY FK_messages_users
    `);
    await queryRunner.query(`
      ALTER TABLE messages DROP FOREIGN KEY FK_messages_messageRooms
    `);
    await queryRunner.query(`
      DROP TABLE messages
    `);
    await queryRunner.query(`
      ALTER TABLE messageRooms DROP FOREIGN KEY FK_messageRooms_orders
    `);
    await queryRunner.query(`
      DROP TABLE messageRooms
    `);
  }
}
