import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { MaxLength } from "class-validator";
import { User, Order } from "./internal";
import { v4 as uuidv4 } from "uuid";

@Entity({
  name: "deliveries",
})
@ObjectType()
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true, unique: true })
  @Field(() => ID)
  uuid: string = uuidv4();

  @Column({ nullable: false })
  @Field(() => Number)
  delivered: number;

  @Column()
  @Field(() => String)
  @MaxLength(8000)
  notes: string;

  @Column()
  @Field(() => String)
  @MaxLength(36)
  paymentType: string;

  @Column("boolean")
  @Field(() => Boolean)
  readByAccounting: boolean;

  @CreateDateColumn({ nullable: false })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;

  @Column()
  orderId: number;

  @ManyToOne(() => Order, (order) => order.deliveries, { nullable: false })
  @JoinColumn({ name: "orderId" })
  @Field(() => Order, { nullable: true })
  order: Order;

  @Column()
  addedById: number;

  @ManyToOne(() => User, {
    nullable: false,
  })
  @JoinColumn({ name: "addedById" })
  addedBy: User;
}
