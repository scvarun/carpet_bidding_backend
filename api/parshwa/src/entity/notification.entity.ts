import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  AfterInsert,
} from "typeorm";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { Length } from "class-validator";
import { User } from "./internal";
import { v4 as uuidv4 } from "uuid";
import { Notification as NotificationOutput } from "../v1/models";
import { formatISO } from "date-fns";
import { NotificationService } from "../services/notifications.service";

export enum NotificationTypes {
  text = "text",
}
registerEnumType(NotificationTypes, { name: "NotificationTypes" });

@Entity({
  name: "notificationTypes",
})
@ObjectType()
export class NotificationType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @Field(() => ID)
  slug: string;

  @Column({ nullable: false })
  @Field()
  title: string;
}

@Entity({
  name: "notifications",
})
@ObjectType()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true, unique: true })
  @Field(() => ID)
  uuid: string = uuidv4();

  @Column({ nullable: false })
  @Length(2, 255)
  @Field()
  title: string;

  @Column({ nullable: false })
  @Length(2, 2000)
  @Field()
  message: string;

  @Column({ nullable: false })
  @Length(2, 255)
  @Field()
  modelType: string;

  @Column({ nullable: false })
  @Length(2, 255)
  @Field()
  modelUUID: string;

  @Column("boolean")
  @Field()
  isRead: boolean;

  @CreateDateColumn({ nullable: false })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  @Field(() => Date)
  updatedAt?: Date | null;

  @Column()
  userId: number;

  @Column()
  notificationTypeId: number;

  @ManyToOne(() => User, (user) => user.notifications, { nullable: false })
  @JoinColumn({
    name: "userId",
  })
  user: User;

  @ManyToOne(() => NotificationType, { nullable: false })
  @JoinColumn({
    name: "notificationTypeId",
  })
  notificationType: NotificationType;

  static async create(
    user: User,
    title: string,
    message: string,
    notificationType: NotificationType
  ): Promise<Notification> {
    let notification = new Notification();
    notification.title = title;
    notification.message = message;
    notification.notificationType = notificationType;
    notification.user = user;
    return notification;
  }

  async toGRPC(): Promise<NotificationOutput> {
    return {
      uuid: this.uuid,
      title: this.title,
      message: this.message,
      isRead: this.isRead,
      modelType: this.modelType,
      modelUUID: this.modelUUID,
      user: await (await this.user).toGRPC(),
      createdAt: formatISO(this.createdAt),
      updatedAt: this.updatedAt ? formatISO(this.updatedAt) : "",
    };
  }

  @AfterInsert()
  async sendNotificationToStream() {
    NotificationService.instance().notificationsPubSub.publish(
      "notifications:notification",
      this
    );
  }
}
