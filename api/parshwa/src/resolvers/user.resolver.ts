import { ApolloError } from "apollo-server-express";
import { add, formatISO } from "date-fns";
import "reflect-metadata";
import {
  Resolver,
  Query,
  Ctx,
  ObjectType,
  Field,
  FieldResolver,
  Root,
  InputType,
  Mutation,
  Arg,
  UseMiddleware,
} from "type-graphql";
import config from "../config";
import { Context } from "../context";
import { LocalAuth, User } from "../entity/internal";
import { UserType, UserTypes } from "../entity/internal";
import * as bcrypt from "bcryptjs";
import * as auth from "./../lib/auth";
import * as jwt from "jsonwebtoken";
import { UserProfile } from "../entity/internal";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../lib/validate";
import { minLength } from "class-validator";
import randomstring from "randomstring";
import sgMail from '../services/mail.service';

@InputType()
class UserRegisterInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  password: string;

  @Field()
  companyName: string;
}

@InputType()
class UserLoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
class UserRefreshTokenInput {
  @Field()
  refreshToken: string;

  @Field()
  token: string;
}

@ObjectType()
class UserLoginOutput {
  @Field()
  user: User;

  @Field()
  token: string;

  @Field()
  refreshToken: string;

  @Field()
  expiresOn: string;

  @Field()
  refreshTokenExpiresIn: number;
}

@InputType()
class UserAddInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  password: string;

  @Field()
  city: string;

  @Field()
  address: string;

  @Field(() => String, { nullable: true })
  companyName?: string | null;

  @Field(() => Boolean)
  insidePune: boolean;

  @Field(() => UserTypes)
  userType: UserTypes;
}

@InputType()
class UserUpdateInput {
  @Field()
  uuid: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  city?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  gst?: string;

  @Field(() => String, { nullable: true })
  companyName?: string;

  @Field(() => Boolean, { nullable: true })
  insidePune?: boolean;
}

@InputType()
class UserQueryInput {
  @Field(() => UserTypes)
  type: UserTypes;
}

@Resolver((of) => User)
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("data") data: UserRegisterInput,
    @Ctx() ctx: Context
  ): Promise<User> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      const { firstName, lastName, email, phone, companyName } = data;
      const checkIfExists = await querun.manager.getRepository(User).count({
        where: { email },
      });
      if (checkIfExists > 0) {
        throw new ApolloError("User already exists", "Forbidden");
      }
      let { password } = data;
      let dealerUserType = await querun.manager
        .getRepository(UserType)
        .findOne({
          where: {
            slug: UserTypes.dealer
          }
        });
      if (!dealerUserType) throw new ApolloError("Invalid user type");
      if (!minLength(password, 8)) {
        throw new ApolloError(
          "Password must be 8 chars in length",
          "ValidationError"
        );
      }
      password = await bcrypt.hash(password, config.hashSalt);
      let user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.blocked = true;
      user.userTypeId = dealerUserType.id;
      const isInvalid = await validate(user);
      if (isInvalid) throw new ApolloError(isInvalid, "ValidationError");
      user = await querun.manager.getRepository(User).save(user);
      let localAuth = new LocalAuth();
      localAuth.password = password;
      localAuth.userId = user.id;
      localAuth = await querun.manager.getRepository(LocalAuth).save(localAuth);
      let userProfile = new UserProfile();
      userProfile.phone = phone;
      userProfile.userId = user.id;
      userProfile.companyName = companyName ?? '';
      userProfile = await querun.manager
        .getRepository(UserProfile)
        .save(userProfile);
      const msg = {
        from: config.sendgridFromEmail,
        to: config.sendgridFromEmail,
        subject: 'New User - Carpet Bidding',
        text: 'A new user has just registered',
        html: 'User details<br />Email: ' + user.email + '<br />Name: ' + user.firstName + " " + + user.lastName + "<br />CompanyName: " + userProfile.companyName,
      };
      await sgMail.send(msg);
      await querun.commitTransaction();
      return user;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @Mutation(() => UserLoginOutput!, { nullable: true })
  async login(
    @Arg("data") data: UserLoginInput,
    @Ctx() ctx: Context
  ): Promise<UserLoginOutput | null> {
    let { email, password } = data;
    let user = await ctx.connection.getRepository(User).findOne({
      where: { email },
      relations: ["userType", "localAuth"],
    });
    if (!user) {
      throw new ApolloError(
        "No user found for these credentials",
        "UserNotFound"
      );
    }
    let localAuth = await user.localAuth;
    let validPassword = await bcrypt.compare(password, localAuth.password);
    if (!validPassword) {
      throw new ApolloError(
        "You entered wrong password, please try again",
        "UserInvalidCredentials"
      );
    }
    if (user.blocked) {
      throw new ApolloError(
        "User is blocked. Please contact support.",
        "UserNotFound"
      );
    }
    const token = await auth.generateAuthToken(user);
    const refreshToken = await auth.generateRefreshToken(user);
    const decodedToken = jwt.decode(token);
    let tokenDate = add(new Date(), { seconds: config.sessionDuration });
    if (!decodedToken || typeof decodedToken === "string") {
      throw new ApolloError("Invalid token", "UserInvalidToken");
    } else if (decodedToken.exp) {
      tokenDate = new Date(decodedToken.exp * 1000);
    }
    return {
      user,
      token,
      refreshToken,
      expiresOn: formatISO(tokenDate),
      refreshTokenExpiresIn: config.refreshTokenExpiresIn,
    };
  }

  @Mutation(() => UserLoginOutput!, { nullable: true })
  async refreshToken(
    @Arg("data") data: UserRefreshTokenInput,
    @Ctx() ctx: Context
  ): Promise<UserLoginOutput | null> {
    let { token, refreshToken } = data;
    let decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken === "string")
      throw new Error("Error reading access token. Please login again.");
    let decodedRefreshToken = jwt.verify(refreshToken, config.privateKey);
    if (typeof decodedRefreshToken === "string")
      throw new Error(decodedRefreshToken);
    if (decodedRefreshToken.data.email !== decodedToken.data.email)
      throw new Error("Tokens do not match");
    let user = await ctx.connection.getRepository(User).findOne({
      where: { email: decodedToken.data.email },
    });
    if (!user) {
      throw new ApolloError(
        "No user found for these credentials",
        "UserNotFound"
      );
    }
    if (user.blocked) {
      throw new ApolloError(
        "User is blocked. Please contact support.",
        "UserNotFound"
      );
    }
    token = await auth.generateAuthToken(user);
    decodedToken = jwt.decode(token);
    let tokenDate = add(new Date(), { seconds: config.sessionDuration });
    if (!decodedToken || typeof decodedToken === "string") {
      throw new ApolloError("Invalid token", "UserInvalidToken");
    } else if (decodedToken.exp) {
      tokenDate = new Date(decodedToken.exp * 1000);
    }
    return {
      user,
      token,
      refreshToken,
      expiresOn: formatISO(tokenDate),
      refreshTokenExpiresIn: config.refreshTokenExpiresIn,
    };
  }

  @FieldResolver(() => UserType, { nullable: true })
  async userType(@Root() user: User): Promise<UserType> {
    return await user.userType;
  }

  @FieldResolver(() => UserProfile, { nullable: true })
  async userProfile(@Root() user: User): Promise<UserProfile> {
    return await user.userProfile;
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => [User])
  async users(
    @Ctx() ctx: Context,
    @Arg("query") query: UserQueryInput
  ): Promise<User[]> {
    if (!ctx.auth) throw new ApolloError("Invalid user");
    if ((await ctx.auth.userType).slug !== "admin") {
      throw new ApolloError(
        "You are not allowed to use this route",
        "Forbidden"
      );
    }
    let userType = await ctx.connection.manager
      .getRepository(UserType)
      .findOne({
        where: {
          slug: query.type,
        },
      });
    if (!userType) throw new ApolloError("Invalid user type");
    return await ctx.connection.manager.getRepository(User).find({
      where: [{ userTypeId: userType.id }],
      relations: ["userType", "userProfile"],
    });
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => User)
  async user(@Arg("uuid") uuid: string, @Ctx() ctx: Context): Promise<User> {
    if (!ctx.auth) throw new ApolloError("Invalid user");
    const user = await ctx.connection.getRepository(User).findOne({
      where: { uuid },
      relations: ["userType", "userProfile"],
    });
    if (!user) throw new ApolloError("");
    if (ctx.auth.id !== user.id && (await ctx.auth.userType).slug !== "admin") {
      throw new ApolloError(
        "You are not allowed to use this route",
        "Forbidden"
      );
    }
    return user;
  }

  @Mutation((returns) => User)
  async addUser(
    @Arg("data") data: UserAddInput,
    @Ctx() ctx: Context
  ): Promise<User> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        userType,
        insidePune,
        companyName,
      } = data;
      const checkIfExists = await querun.manager.getRepository(User).count({
        where: { email },
      });
      if (checkIfExists > 0) {
        throw new ApolloError("User already exists", "Forbidden");
      }
      let { password } = data;
      let userTypeToSet = await querun.manager.getRepository(UserType).findOne({
        where: {
          slug: userType,
        },
      });
      if (!userTypeToSet) throw new ApolloError("Invalid user type");
      if (!minLength(password, 8)) {
        throw new ApolloError(
          "Password must be 8 chars in length",
          "ValidationError"
        );
      }
      password = await bcrypt.hash(password, config.hashSalt);
      let user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.blocked = false;
      user.userTypeId = userTypeToSet.id;
      user = await querun.manager.getRepository(User).save(user);
      let localAuth = new LocalAuth();
      localAuth.password = password;
      localAuth.userId = user.id;
      localAuth = await querun.manager.getRepository(LocalAuth).save(localAuth);
      let userProfile = new UserProfile();
      userProfile.userId = user.id;
      userProfile.phone = phone;
      userProfile.address = address;
      userProfile.companyName = companyName ?? undefined;
      userProfile.insidePune = insidePune;
      userProfile = await querun.manager
        .getRepository(UserProfile)
        .save(userProfile);
      const msg = {
        from: config.sendgridFromEmail,
        to: config.sendgridFromEmail,
        subject: 'New User - Carpet Bidding',
        text: 'A new user has been added',
        html: 'User details<br />Email: ' + user.email + '<br />Name: ' + user.firstName + "<br />CompanyName: " + userProfile.companyName,
      };
      await sgMail.send(msg);
      await querun.commitTransaction();
      return user;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => User)
  async updateUser(
    @Arg("data") data: UserUpdateInput,
    @Ctx() ctx: Context
  ): Promise<User> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();
      if (!ctx.auth) throw new ApolloError("Invalid user");

      let {
        uuid,
        address,
        city,
        firstName,
        lastName,
        email,
        password,
        gst,
        companyName,
        phone,
        insidePune,
      } = data;

      let user = await querun.manager.getRepository(User).findOne({
        where: { uuid },
        relations: ["userProfile", "userType", "localAuth"],
      });

      if (!user) throw new ApolloError("Invalid user");

      if (password && password.length > 0) {
        if (!minLength(password, 8)) {
          throw new ApolloError(
            "Password must be 8 chars in length",
            "ValidationError"
          );
        }
        password = await bcrypt.hash(password, config.hashSalt);
        const localAuth = await user.localAuth;
        localAuth.password = password;
        await querun.manager.save(localAuth);
      }

      let userProfile = await user.userProfile;
      userProfile.address = address ?? userProfile.address ?? '';
      userProfile.city = city ?? userProfile.city ?? '';
      userProfile.gst = gst ?? userProfile.gst ?? '';
      userProfile.phone = phone ?? userProfile.phone ?? '';
      userProfile.companyName = companyName ?? userProfile.companyName ?? '';
      userProfile.insidePune = insidePune ?? userProfile.insidePune;
      userProfile = await querun.manager.save(userProfile);

      user.firstName = firstName ?? user.firstName;
      user.lastName = lastName ?? user.lastName;
      user = await querun.manager.save(user);

      await querun.commitTransaction();
      return user;
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => String)
  async blockUser(
    @Arg("uuid") uuid: string,
    @Ctx() ctx: Context
  ): Promise<string> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();

      let user = await querun.manager.getRepository(User).findOne({
        where: { uuid },
      });

      if (!user) throw new ApolloError("User not found");
      user.blocked = true;
      user = await querun.manager.save(user);

      const msg = {
        from: config.sendgridFromEmail,
        to: user.email,
        subject: 'Account Blocked - Carpet Bidding',
        html: 'Your account has been blocked. If you have any query please contact us via emali or phone',
      };
      await sgMail.send(msg);

      await querun.commitTransaction();
      return "User blocked successfully";
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => String)
  async unblockUser(
    @Arg("uuid") uuid: string,
    @Ctx() ctx: Context
  ): Promise<string> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();

      let user = await querun.manager.getRepository(User).findOne({
        where: { uuid },
      });

      if (!user) throw new ApolloError("User not found");
      user.blocked = false;
      user = await querun.manager.save(user);

      const msg = {
        from: config.sendgridFromEmail,
        to: user.email,
        subject: 'Account Unblocked - Carpet Bidding',
        html: 'Your account has been unblocked. Welcome aboard',
      };
      await sgMail.send(msg);

      await querun.commitTransaction();
      return "User unblocked successfully";
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }

  @Mutation(() => String)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() ctx: Context
  ): Promise<string> {
    const querun = ctx.connection.createQueryRunner();
    try {
      await querun.connect();
      await querun.startTransaction();

      let user = await querun.manager.getRepository(User).findOne({
        where: { email },
      });

      if (!user) throw new ApolloError("User not found");
      let newPassword = randomstring.generate(8);
      let hashPassword = await bcrypt.hash(newPassword, config.hashSalt);
      let localAuth = await user.localAuth;
      localAuth.password = hashPassword;
      const msg = {
        from: config.sendgridFromEmail,
        to: user.email,
        subject: 'Reset Password - Carpet Bidding',
        text: 'Here is your new password.',
        html: 'Your new password is: ' + newPassword,
      };
      await sgMail.send(msg);
      localAuth = await querun.manager.getRepository(LocalAuth).save(localAuth);

      await querun.commitTransaction();
      return "Reset password has been sent on your email. Please check.";
    } catch (e) {
      await querun.rollbackTransaction();
      throw e;
    } finally {
      await querun.release();
    }
  }
}
