import { MigrationInterface, QueryRunner } from "typeorm";

export class createOrdersTable1645892470415 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE orderStatus(
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            uuid VARCHAR(36) NOT NULL UNIQUE,
            status VARCHAR(36) NOT NULL UNIQUE,
            slug VARCHAR(36) NOT NULL UNIQUE,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY ( id )
        )
    `);

    await queryRunner.query(`
        CREATE TABLE orders(
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            uuid VARCHAR(36) NOT NULL UNIQUE,
            reference VARCHAR(255) NOT NULL,
            notes VARCHAR(4000),
            type VARCHAR(255) NOT NULL,
            patternNo VARCHAR(255),
            quantity INT UNSIGNED NOT NULL DEFAULT(0),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            orderStatusId INT UNSIGNED NOT NULL,
            userId INT UNSIGNED NOT NULL,
            inventoryId INT UNSIGNED,
            catalogueId INT UNSIGNED,
            PRIMARY KEY ( id ),
            CONSTRAINT FK_orders_inventory FOREIGN KEY ( inventoryId ) REFERENCES inventories(id),
            CONSTRAINT FK_orders_catalogues FOREIGN KEY ( catalogueId ) REFERENCES catalogues(id),
            CONSTRAINT FK_orders_orderStatus FOREIGN KEY ( orderStatusId ) REFERENCES orderStatus(id),
            CONSTRAINT FK_orders_users FOREIGN KEY ( userId ) REFERENCES users(id)
        )
    `);

    await queryRunner.query(`
        CREATE TABLE orderStatusHistories(
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            orderStatusId INT UNSIGNED NOT NULL,
            orderId INT UNSIGNED NOT NULL,
            PRIMARY KEY ( id ),
            CONSTRAINT FK_orderStatusHistories_orders FOREIGN KEY ( orderId ) REFERENCES orders(id),
            CONSTRAINT FK_orderStatusHistories_orderStatus FOREIGN KEY ( orderStatusId ) REFERENCES orderStatus(id)
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orderStatusHistories DROP FOREIGN KEY FK_orderStatusHistories_orderStatus
    `);
    await queryRunner.query(`
      ALTER TABLE orderStatusHistories DROP FOREIGN KEY FK_orderStatusHistories_orders
    `);
    await queryRunner.query(`
        DROP TABLE orderStatusHistories
      `);
    await queryRunner.query(`
      ALTER TABLE orders DROP FOREIGN KEY FK_orders_users
    `);
    await queryRunner.query(`
      ALTER TABLE orders DROP FOREIGN KEY FK_orders_orderStatus
    `);
    await queryRunner.query(`
      ALTER TABLE orders DROP FOREIGN KEY FK_orders_catalogues
    `);
    await queryRunner.query(`
        DROP TABLE orders
      `);
    await queryRunner.query(`
        DROP TABLE orderStatus
      `);
  }
}
