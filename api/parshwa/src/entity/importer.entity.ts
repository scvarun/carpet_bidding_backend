import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinTable,
  ManyToMany,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { v4 as uuidv4 } from "uuid";
import { Inventory } from "./internal";

@Entity({
  name: "importers",
})
@ObjectType()
export class Importer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  @Field(() => ID)
  uuid: string = uuidv4();

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255, {
    message: "Name field should not be greater than 255 characters in length",
  })
  @MinLength(2, {
    message: "Name field should not be less than 2 characters in length",
  })
  @IsNotEmpty({
    message: "Name should not be empty",
  })
  name: string;

  @Column({ unique: true })
  @Field(() => String)
  @MaxLength(255)
  @IsEmail()
  @MinLength(2)
  email: string;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  phone: string;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  @IsNotEmpty()
  city: string;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(2000)
  @MinLength(4)
  @IsNotEmpty()
  address: string;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;

  @ManyToMany(() => Inventory, (inventory) => inventory.importers, {
    orphanedRowAction: "delete",
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
  inventories: Promise<Inventory[]> | null;
}
