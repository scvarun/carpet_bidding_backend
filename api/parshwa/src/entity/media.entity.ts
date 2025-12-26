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
import { User } from "./internal";
import { v4 as uuidv4 } from "uuid";

@Entity({
  name: "medias",
})
@ObjectType()
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true, unique: true })
  @Field(() => ID)
  uuid: string = uuidv4();

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  name: string;

  @Column()
  @Field(() => String)
  @MaxLength(255)
  mimeType: string;

  @Column()
  @Field(() => String)
  @MaxLength(255)
  awsKey: string;

  @Column()
  @Field(() => String)
  @MaxLength(255)
  url: string;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "userId" })
  user: User;
}
