import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
  AfterInsert,
} from "typeorm";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { MaxLength } from "class-validator";
import { User, Order, UserType } from "./internal";
import { v4 as uuidv4 } from "uuid";
import { Message as MessageOutput, MessageTypes as MessageTypesOutput } from '../v1/models';
import { formatISO } from "date-fns";
import { MessageService } from "../services/messages.service";

export enum MessageTypes {
  text = "text",
  new_enquiry = "new_enquiry",
  enquired = "enquired",
  available = "available",
  placed_order = "placed_order",
  received_stock = "received_stock",
  dispatched = "dispatched",
  completed = "completed",
  cancelled = "cancelled",
  not_available = "not_available",
}
registerEnumType(MessageTypes, { name: "MessageTypes" });

@Entity({
  name: "messageRooms",
})
@ObjectType()
export class MessageRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true, unique: true })
  @Field(() => ID)
  uuid: string = uuidv4();

  @Column()
  orderId: number;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;

  @OneToOne(() => Order, (order) => order.messageRoom, { nullable: false })
  @JoinColumn({
    name: "orderId",
  })
  order: Order;

  @OneToMany(() => Message, (message) => message.messageRoom, {
    nullable: false,
  })
  messages: Message[];
}

@Entity({
  name: "messages",
})
@ObjectType()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true, unique: true })
  @Field(() => ID)
  uuid: string = uuidv4();

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(2000)
  message: string;

  @Column({ nullable: false })
  @Field(() => MessageTypes)
  @MaxLength(255)
  type: MessageTypes;

  @Column()
  messageRoomId: number;

  @Column()
  userId: number;

  @Column()
  forUserTypeId: number;

  @CreateDateColumn({ nullable: false })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;

  @ManyToOne(() => MessageRoom, (messageRoom) => messageRoom.messages, {
    nullable: false,
  })
  @JoinColumn({
    name: "messageRoomId",
  })
  @Field(() => MessageRoom, { nullable: true })
  messageRoom: MessageRoom;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: "userId",
  })
  @Field(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => UserType, { nullable: false })
  @JoinColumn({
    name: "forUserTypeId",
  })
  @Field(() => UserType, { nullable: true })
  forUserType: UserType;

  async toGRPC(): Promise<MessageOutput | null> {
    let user = await this.user;
    if (user === null) return null;
    return {
      message: this.message,
      type: this.typeToGrpc(),
      uuid: this.uuid,
      createdAt: formatISO(this.createdAt),
      updatedAt: this.updatedAt ? formatISO(this.updatedAt) : '',
      user: await user.toGRPC(),
    };
  }

  typeToGrpc(): MessageTypesOutput {
    switch (this.type) {
      case MessageTypes.text:
        return MessageTypesOutput.text;
      case MessageTypes.available:
        return MessageTypesOutput.available;
      case MessageTypes.cancelled:
        return MessageTypesOutput.cancelled;
      case MessageTypes.completed:
        return MessageTypesOutput.completed;
      case MessageTypes.dispatched:
        return MessageTypesOutput.dispatched;
      case MessageTypes.enquired:
        return MessageTypesOutput.enquired;
      case MessageTypes.new_enquiry:
        return MessageTypesOutput.new_enquiry;
      case MessageTypes.placed_order:
        return MessageTypesOutput.placed_order;
      case MessageTypes.received_stock:
        return MessageTypesOutput.received_stock;
      default:
        return MessageTypesOutput.text;
    }
  }

  @AfterInsert()
  async sendNotificationToStream() {
    MessageService.instance().messagesPubSub.publish("messages:messages", this);
  }
}
