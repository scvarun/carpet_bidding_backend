import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { IsNotEmpty, MaxLength } from "class-validator";
import { UserType } from "./internal";
import { UserProfile } from "./internal";
import { v4 as uuidv4 } from "uuid";
import { Notification } from "./internal";
import { User as UserOutput } from "../v1/models";

export interface UserProps {
  firstName?: string;
  lastName?: string;
  email?: string;
}

@Entity({
  name: "users",
})
@ObjectType()
export class User implements UserProps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  @Field(() => ID)
  @MaxLength(255)
  uuid: string = uuidv4();

  @Column()
  @Field(() => String)
  @MaxLength(255)
  firstName?: string;

  @Column({ unique: true })
  @Field(() => String)
  @MaxLength(255)
  lastName: string;

  @Column()
  @Field(() => String)
  @MaxLength(255)
  email: string;

  @Column("boolean")
  @Field(() => Boolean)
  blocked: boolean;

  @CreateDateColumn({ nullable: false })
  @Field(() => Date, { nullable: false })
  createdAt?: Date | null;

  @UpdateDateColumn({ nullable: true })
  @Field(() => Date!, { nullable: true })
  updatedAt?: Date | null;

  @Column({ nullable: false })
  userTypeId: number;

  @ManyToOne(() => UserType, { nullable: false })
  @JoinColumn({ name: "userTypeId" })
  userType: Promise<UserType>;

  @OneToOne(() => LocalAuth, (localAuth) => localAuth.user, { nullable: false })
  localAuth: Promise<LocalAuth>;

  @OneToOne(() => UserProfile, (userProfile) => userProfile.user, {
    nullable: false,
  })
  userProfile: Promise<UserProfile>;

  @OneToMany(() => Notification, (notification) => notification.user, {
    nullable: false,
  })
  notifications: Promise<Notification[]>;

  async toGRPC(): Promise<UserOutput> {
    let userType = await this.userType;
    return {
      email: this.email,
      firstName: this.firstName ?? '',
      lastName: this.lastName,
      uuid: this.uuid,
      userType: await userType.toGRPC(),
    }
  }
}

@Entity({
  name: "localAuths",
})
@ObjectType()
export class LocalAuth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @MaxLength(255, {
    message: "Password cannot be greater than 255 characters in length",
  })
  @IsNotEmpty()
  password: string;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;

  @Column({ nullable: false })
  userId: number;

  @OneToOne(() => User, (user) => user.localAuth, { nullable: true })
  @JoinColumn({ name: "userId" })
  user: Promise<User>;
}
