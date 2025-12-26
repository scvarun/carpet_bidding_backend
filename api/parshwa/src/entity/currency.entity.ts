import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinTable,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { IsEmail, Length, MaxLength } from "class-validator";

@Entity({
  name: "currencies",
})
@ObjectType()
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  name: string;

  @Column({ nullable: false, unique: true })
  @Field(() => ID)
  @MaxLength(255)
  slug: string;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  symbol: string;

  @CreateDateColumn({ nullable: false })
  @Field(() => Date, { nullable: false })
  createdAt: Date | null;

  @UpdateDateColumn({ nullable: true })
  @Field(() => Date!, { nullable: true })
  updatedAt?: Date | null;
}
