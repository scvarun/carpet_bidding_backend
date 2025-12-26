import { MigrationInterface, QueryRunner } from "typeorm";

export class createDeliveriesTable1650497557298 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE deliveries(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        delivered INT NOT NULL,
        notes VARCHAR(8000),
        paymentType VARCHAR(36),
        orderId INT UNSIGNED NOT NULL,
        addedById INT UNSIGNED NOT NULL,
        readByAccounting TINYINT(1) NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY ( id ),
        CONSTRAINT FK_deliveries_orders FOREIGN KEY ( orderId ) REFERENCES orders(id),
        CONSTRAINT FK_deliveries_addBy FOREIGN KEY ( addedById ) REFERENCES users(id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE deliveries
    `);
  }
}
