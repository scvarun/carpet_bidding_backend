import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { MaxLength } from "class-validator";
import { v4 as uuidv4 } from "uuid";
import { Importer, Catalogue } from "./internal";

export enum InventoryTypes {
  rolls = "rolls",
  catalog = "catalog",
}

registerEnumType(InventoryTypes, { name: "InventoryTypes" });

@Entity({
  name: "inventories",
})
@ObjectType()
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true, unique: true })
  @Field(() => ID)
  uuid: string = uuidv4();

  @Column({ type: "varchar", nullable: false })
  @Field(() => String)
  @MaxLength(255)
  type: InventoryTypes;

  @Column({ nullable: false })
  @Field(() => Number)
  @MaxLength(255)
  quantity: number;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;

  @OneToOne(() => Roll, (roll) => roll.inventory)
  roll: Roll | null;

  @ManyToMany(() => Importer, (importer) => importer.inventories, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinTable({
    name: "importerForInventories",
    joinColumn: {
      name: "inventoryId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "importerId",
      referencedColumnName: "id",
    },
  })
  @Field(() => [Importer], { nullable: true })
  importers: Importer[] | null;

  @Column({ nullable: false })
  catalogueId: number;

  @ManyToOne(() => Catalogue, (catalogue) => catalogue.inventories)
  @JoinColumn({ name: "catalogueId" })
  @Field(() => Catalogue, { nullable: true })
  catalogue: Catalogue | null;

  @ManyToMany(() => Inventory, (inventory) => inventory.similarInventories, {
    cascade: false,
  })
  @JoinTable({
    name: "similarInventoryForInventories",
    joinColumn: {
      name: "inventoryId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "similarInventoryId",
      referencedColumnName: "id",
    },
  })
  @Field(() => [Inventory], { nullable: true })
  similarInventories: Inventory[] | null;
}

@Entity({
  name: "rolls",
})
@ObjectType()
export class Roll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  patternNo: string;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;

  @Column({ nullable: false })
  inventoryId: Number;

  @OneToOne(() => Inventory, (inventory) => inventory.roll)
  @JoinColumn({ name: "inventoryId" })
  @Field(() => Inventory, { nullable: true })
  inventory: Inventory | null;
}
