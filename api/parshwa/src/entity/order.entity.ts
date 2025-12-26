import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  AfterInsert,
} from "typeorm";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { v4 as uuidv4 } from "uuid";
import { Inventory, InventoryTypes } from "./internal";
import { User } from "./internal";
import { Catalogue } from "./internal";
import { MessageRoom } from "./internal";
import { Delivery } from "./internal";
import { MessageService } from "../services/messages.service";

export enum OrderStatusTypes {
  new_enquiry = "new_enquiry",
  enquired = "enquired",
  available = "available",
  placed_order = "placed_order",
  order_confirmed = "order_confirmed",
  received_stock = "received_stock",
  dispatched = "dispatched",
  completed = "completed",
  cancelled = "cancelled",
  not_available = "not_available",
  pending = "pending",
}

registerEnumType(OrderStatusTypes, { name: "OrderStatusTypes" });

@Entity({
  name: "orderStatus",
})
@ObjectType()
export class OrderStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true, unique: true })
  @Field(() => ID)
  uuid: string = uuidv4();

  @Column({ nullable: false, unique: true })
  @Field(() => String)
  @MaxLength(255)
  status: string;

  @Column({ nullable: false, unique: true })
  @Field(() => OrderStatusTypes)
  @MaxLength(255)
  slug: OrderStatusTypes;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;
}

@Entity({
  name: "orders",
})
@ObjectType()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true, unique: true })
  @Field(() => ID)
  uuid: string = uuidv4();

  @Column({ nullable: false })
  @Field(() => Number)
  quantity: number;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  reference: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  @MaxLength(4000)
  notes: string;

  @Column({ type: "varchar", nullable: false })
  @Field(() => InventoryTypes)
  @MaxLength(255)
  type: InventoryTypes;

  @Column({ nullable: true })
  @Field(() => String)
  @MaxLength(255)
  patternNo: string;

  @CreateDateColumn({ nullable: false })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToOne(() => OrderStatus, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  @JoinColumn({ name: "orderStatusId" })
  @Field(() => OrderStatus, { nullable: true })
  status: OrderStatus;

  @ManyToOne(() => Catalogue, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "catalogueId" })
  catalogue?: Catalogue | null;

  @ManyToOne(() => Inventory, {
    nullable: true,
  })
  @JoinColumn({ name: "inventoryId" })
  inventory?: Inventory | null;

  @Column()
  orderStatusId: number;

  @OneToMany(() => OrderStatusHistory, (statusHistory) => statusHistory.order, {
    nullable: false,
  })
  @Field(() => [OrderStatusHistory], { nullable: true })
  statusHistory: Promise<OrderStatusHistory[]>;

  @OneToOne(() => MessageRoom, (messageRoom) => messageRoom.order, {
    nullable: false,
  })
  @Field(() => MessageRoom, { nullable: true })
  messageRoom: Promise<MessageRoom>;

  @OneToMany(() => Delivery, (delivery) => delivery.order, {
    nullable: false,
  })
  @Field(() => [Delivery], { nullable: true })
  deliveries: Promise<Delivery[]>;

  @OneToMany(() => OrderContact, (orderContact) => orderContact.order, {
    nullable: false,
  })
  @Field(() => [OrderContact], { nullable: true })
  orderContacts: Promise<OrderContact[]>;

  @AfterInsert()
  async sendNotificationToStream() {
    MessageService.instance().messagesPubSub.publish('messages:order', this);
  }
}

@Entity({
  name: "orderStatusHistories",
})
@ObjectType()
export class OrderStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ nullable: false })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;

  @ManyToOne(() => Order, (order) => order.statusHistory)
  @JoinColumn({ name: "orderId" })
  @Field(() => Order, { nullable: true })
  order: Order | null;

  @Column()
  orderId: number;

  @ManyToOne(() => OrderStatus)
  @JoinColumn({ name: "orderStatusId" })
  @Field(() => OrderStatus, { nullable: true })
  status: OrderStatus | null;

  @Column()
  orderStatusId: number;
}

@Entity({
  name: "orderContacts",
})
@ObjectType()
export class OrderContact {
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

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  phone: string;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;

  @ManyToOne(() => Order, (order) => order.orderContacts)
  @JoinColumn({ name: "orderId" })
  @Field(() => Order, { nullable: true })
  order: Order;
}
