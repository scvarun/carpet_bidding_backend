import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { MaxLength } from "class-validator";
import { v4 as uuidv4 } from "uuid";
import { Inventory } from "./inventory.entity";

@Entity({
  name: "catalogues",
})
@ObjectType()
export class Catalogue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  @Field(() => ID)
  @MaxLength(255)
  uuid: string = uuidv4();

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  name: string;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  size: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  @MaxLength(255)
  rate: string;

  @Field(() => Date)
  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;

  @OneToMany(() => Inventory, (inventory) => inventory.catalogue)
  inventories: Promise<Inventory[] | null>;
}
