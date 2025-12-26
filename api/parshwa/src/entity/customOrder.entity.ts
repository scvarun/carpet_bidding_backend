import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { MaxLength } from "class-validator";
import { v4 as uuidv4 } from "uuid";
import { Media } from "./internal";

@Entity({
  name: "customOrders",
})
@ObjectType()
export class CustomOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true, unique: true })
  @Field(() => ID)
  uuid: string = uuidv4();

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  title: string;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  name: string;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  phone: string;

  @Column({ nullable: true })
  @Field(() => String)
  @MaxLength(255)
  height: string;

  @Column({ nullable: true })
  @Field(() => String)
  @MaxLength(255)
  width: string;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  remarks: string;

  @CreateDateColumn({ nullable: false })
  @Field(() => Date, { nullable: false })
  createdAt: Date | null;

  @UpdateDateColumn({ nullable: true })
  @Field(() => Date!, { nullable: true })
  updatedAt?: Date | null;

  @OneToOne(() => Media, { nullable: true })
  @JoinColumn({ name: "imageId" })
  image: Media | null;

  @Column({ nullable: true })
  imageId: number;
}
