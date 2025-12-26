import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { MaxLength } from "class-validator";
import { User } from "./internal";

@Entity({
  name: "userProfiles",
})
@ObjectType()
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: "Pune" })
  @Field(() => String, { nullable: true })
  @MaxLength(255)
  city?: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  @MaxLength(255)
  phone?: string;

  @Column({ nullable: true })
  @Field(() => String!, { nullable: true })
  @MaxLength(255)
  companyName?: string;

  @Column({ nullable: true })
  @Field(() => String!, { nullable: true })
  @MaxLength(255)
  gst?: string;

  @Column({ nullable: true })
  @Field(() => String!, { nullable: true })
  @MaxLength(2000)
  address?: string;

  @Column({ nullable: true, default: true })
  @Field(() => Boolean, { nullable: true })
  insidePune: boolean;

  @CreateDateColumn({ nullable: false })
  @Field(() => Date, { nullable: false })
  createdAt?: Date | null;

  @UpdateDateColumn({ nullable: true })
  @Field(() => Date!, { nullable: true })
  updatedAt?: Date | null;

  @Column({ nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.userProfile, { nullable: false })
  @JoinColumn({ name: "userId" })
  user: Promise<User>;
}
