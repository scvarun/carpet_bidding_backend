import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { MaxLength } from "class-validator";
import { User } from "./internal";
import {
  UserType as UserTypeOutput,
  UserTypes as UserTypesOutput,
} from "../v1/models";

export enum UserTypes {
  admin = "admin",
  backoffice = "backoffice",
  dealer = "dealer",
}

registerEnumType(UserTypes, { name: "UserTypes" });

@Entity({
  name: "userTypes",
})
@ObjectType()
export class UserType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  title: string;

  @Column({ unique: true })
  @Field(() => ID)
  @MaxLength(255)
  slug: UserTypes;

  @Column({ nullable: false })
  @Field(() => String)
  @MaxLength(255)
  description: string;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date | null;

  @OneToMany(() => User, (user) => user.userType, { nullable: false })
  user: Promise<User>;

  async toGRPC(): Promise<UserTypeOutput> {
    const {title, description} = this;
    return {
      title, 
      description,
      slug: this.slugToGRPC(),
    }
  }

  slugToGRPC(): UserTypesOutput {
    switch (this.slug) {
      case UserTypes.admin:
        return UserTypesOutput.USER_TYPES_ADMIN;
      case UserTypes.dealer:
        return UserTypesOutput.USER_TYPES_DEALER;
      case UserTypes.backoffice:
        return UserTypesOutput.USER_TYPES_BACKOFFICE;
    }
  }
}

