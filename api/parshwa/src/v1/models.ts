/* eslint-disable */
import { CallContext, CallOptions } from "nice-grpc-common";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "carpet.src.v1";

/**
 * //////////////////////////
 * MODELS
 * //////////////////////////
 */
export enum UserTypes {
  USER_TYPES_UNSPECIFIED = 0,
  USER_TYPES_ADMIN = 1,
  USER_TYPES_DEALER = 2,
  USER_TYPES_BACKOFFICE = 3,
  UNRECOGNIZED = -1,
}

export function userTypesFromJSON(object: any): UserTypes {
  switch (object) {
    case 0:
    case "USER_TYPES_UNSPECIFIED":
      return UserTypes.USER_TYPES_UNSPECIFIED;
    case 1:
    case "USER_TYPES_ADMIN":
      return UserTypes.USER_TYPES_ADMIN;
    case 2:
    case "USER_TYPES_DEALER":
      return UserTypes.USER_TYPES_DEALER;
    case 3:
    case "USER_TYPES_BACKOFFICE":
      return UserTypes.USER_TYPES_BACKOFFICE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return UserTypes.UNRECOGNIZED;
  }
}

export function userTypesToJSON(object: UserTypes): string {
  switch (object) {
    case UserTypes.USER_TYPES_UNSPECIFIED:
      return "USER_TYPES_UNSPECIFIED";
    case UserTypes.USER_TYPES_ADMIN:
      return "USER_TYPES_ADMIN";
    case UserTypes.USER_TYPES_DEALER:
      return "USER_TYPES_DEALER";
    case UserTypes.USER_TYPES_BACKOFFICE:
      return "USER_TYPES_BACKOFFICE";
    case UserTypes.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum MessageTypes {
  text = 0,
  new_enquiry = 1,
  enquired = 2,
  available = 3,
  placed_order = 4,
  received_stock = 5,
  dispatched = 6,
  completed = 7,
  cancelled = 8,
  UNRECOGNIZED = -1,
}

export function messageTypesFromJSON(object: any): MessageTypes {
  switch (object) {
    case 0:
    case "text":
      return MessageTypes.text;
    case 1:
    case "new_enquiry":
      return MessageTypes.new_enquiry;
    case 2:
    case "enquired":
      return MessageTypes.enquired;
    case 3:
    case "available":
      return MessageTypes.available;
    case 4:
    case "placed_order":
      return MessageTypes.placed_order;
    case 5:
    case "received_stock":
      return MessageTypes.received_stock;
    case 6:
    case "dispatched":
      return MessageTypes.dispatched;
    case 7:
    case "completed":
      return MessageTypes.completed;
    case 8:
    case "cancelled":
      return MessageTypes.cancelled;
    case -1:
    case "UNRECOGNIZED":
    default:
      return MessageTypes.UNRECOGNIZED;
  }
}

export function messageTypesToJSON(object: MessageTypes): string {
  switch (object) {
    case MessageTypes.text:
      return "text";
    case MessageTypes.new_enquiry:
      return "new_enquiry";
    case MessageTypes.enquired:
      return "enquired";
    case MessageTypes.available:
      return "available";
    case MessageTypes.placed_order:
      return "placed_order";
    case MessageTypes.received_stock:
      return "received_stock";
    case MessageTypes.dispatched:
      return "dispatched";
    case MessageTypes.completed:
      return "completed";
    case MessageTypes.cancelled:
      return "cancelled";
    case MessageTypes.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Empty {}

export interface UserToken {
  token: string;
}

export interface Error {
  name: string;
  message: string;
  statusCode: number;
  type: string;
}

export interface UserType {
  slug: UserTypes;
  title: string;
  description: string;
}

export interface User {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: UserType | undefined;
}

export interface Media {
  uuid: string;
  mimeType: string;
  name: string;
  title: string;
  description: string;
  url: string;
  blocked: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  uuid: string;
  title: string;
  message: string;
  isRead: boolean;
  modelType: string;
  modelUUID: string;
  createdAt: string;
  updatedAt: string;
  user: User | undefined;
}

export interface Message {
  uuid: string;
  message: string;
  type: MessageTypes;
  createdAt: string;
  updatedAt: string;
  user: User | undefined;
}

export interface Order {
  uuid: string;
}

/**
 * //////////////////////////
 * RESPONSES
 * //////////////////////////
 */
export interface FetchNotificationsRequest {
  userToken: UserToken | undefined;
}

export interface FetchNotificationsResponse {
  notifications: Notification[];
}

export interface ListenNotificationsRequest {
  userToken: UserToken | undefined;
}

export interface ListenNotificationsResponse {
  notification: Notification | undefined;
}

export interface FetchMessagesRequest {
  userToken: UserToken | undefined;
  roomUUID: string;
}

export interface FetchMessagesResponse {
  messages: Message[];
}

export interface ListenMessagesRequest {
  userToken: UserToken | undefined;
  roomUUID: string;
}

export interface ListenOrderRequest {
  userToken: UserToken | undefined;
}

export interface ListenMessagesResponse {
  messages: Message[];
}

export interface ListenOrdersResponse {
  order: Order | undefined;
}

export interface PingResponse {
  pong: string;
}

export interface PingRequest {}

function createBaseEmpty(): Empty {
  return {};
}

export const Empty = {
  encode(_: Empty, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Empty {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEmpty();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): Empty {
    return {};
  },

  toJSON(_: Empty): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<Empty>): Empty {
    const message = createBaseEmpty();
    return message;
  },
};

function createBaseUserToken(): UserToken {
  return { token: "" };
}

export const UserToken = {
  encode(
    message: UserToken,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserToken {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserToken();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.token = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UserToken {
    return {
      token: isSet(object.token) ? String(object.token) : "",
    };
  },

  toJSON(message: UserToken): unknown {
    const obj: any = {};
    message.token !== undefined && (obj.token = message.token);
    return obj;
  },

  fromPartial(object: DeepPartial<UserToken>): UserToken {
    const message = createBaseUserToken();
    message.token = object.token ?? "";
    return message;
  },
};

function createBaseError(): Error {
  return { name: "", message: "", statusCode: 0, type: "" };
}

export const Error = {
  encode(message: Error, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.message !== "") {
      writer.uint32(18).string(message.message);
    }
    if (message.statusCode !== 0) {
      writer.uint32(24).int32(message.statusCode);
    }
    if (message.type !== "") {
      writer.uint32(34).string(message.type);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Error {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseError();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.message = reader.string();
          break;
        case 3:
          message.statusCode = reader.int32();
          break;
        case 4:
          message.type = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Error {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      message: isSet(object.message) ? String(object.message) : "",
      statusCode: isSet(object.statusCode) ? Number(object.statusCode) : 0,
      type: isSet(object.type) ? String(object.type) : "",
    };
  },

  toJSON(message: Error): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.message !== undefined && (obj.message = message.message);
    message.statusCode !== undefined &&
      (obj.statusCode = Math.round(message.statusCode));
    message.type !== undefined && (obj.type = message.type);
    return obj;
  },

  fromPartial(object: DeepPartial<Error>): Error {
    const message = createBaseError();
    message.name = object.name ?? "";
    message.message = object.message ?? "";
    message.statusCode = object.statusCode ?? 0;
    message.type = object.type ?? "";
    return message;
  },
};

function createBaseUserType(): UserType {
  return { slug: 0, title: "", description: "" };
}

export const UserType = {
  encode(
    message: UserType,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.slug !== 0) {
      writer.uint32(8).int32(message.slug);
    }
    if (message.title !== "") {
      writer.uint32(18).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserType {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserType();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.slug = reader.int32() as any;
          break;
        case 2:
          message.title = reader.string();
          break;
        case 3:
          message.description = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UserType {
    return {
      slug: isSet(object.slug) ? userTypesFromJSON(object.slug) : 0,
      title: isSet(object.title) ? String(object.title) : "",
      description: isSet(object.description) ? String(object.description) : "",
    };
  },

  toJSON(message: UserType): unknown {
    const obj: any = {};
    message.slug !== undefined && (obj.slug = userTypesToJSON(message.slug));
    message.title !== undefined && (obj.title = message.title);
    message.description !== undefined &&
      (obj.description = message.description);
    return obj;
  },

  fromPartial(object: DeepPartial<UserType>): UserType {
    const message = createBaseUserType();
    message.slug = object.slug ?? 0;
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    return message;
  },
};

function createBaseUser(): User {
  return {
    uuid: "",
    firstName: "",
    lastName: "",
    email: "",
    userType: undefined,
  };
}

export const User = {
  encode(message: User, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.uuid !== "") {
      writer.uint32(10).string(message.uuid);
    }
    if (message.firstName !== "") {
      writer.uint32(18).string(message.firstName);
    }
    if (message.lastName !== "") {
      writer.uint32(26).string(message.lastName);
    }
    if (message.email !== "") {
      writer.uint32(34).string(message.email);
    }
    if (message.userType !== undefined) {
      UserType.encode(message.userType, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): User {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUser();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.uuid = reader.string();
          break;
        case 2:
          message.firstName = reader.string();
          break;
        case 3:
          message.lastName = reader.string();
          break;
        case 4:
          message.email = reader.string();
          break;
        case 5:
          message.userType = UserType.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): User {
    return {
      uuid: isSet(object.uuid) ? String(object.uuid) : "",
      firstName: isSet(object.firstName) ? String(object.firstName) : "",
      lastName: isSet(object.lastName) ? String(object.lastName) : "",
      email: isSet(object.email) ? String(object.email) : "",
      userType: isSet(object.userType)
        ? UserType.fromJSON(object.userType)
        : undefined,
    };
  },

  toJSON(message: User): unknown {
    const obj: any = {};
    message.uuid !== undefined && (obj.uuid = message.uuid);
    message.firstName !== undefined && (obj.firstName = message.firstName);
    message.lastName !== undefined && (obj.lastName = message.lastName);
    message.email !== undefined && (obj.email = message.email);
    message.userType !== undefined &&
      (obj.userType = message.userType
        ? UserType.toJSON(message.userType)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<User>): User {
    const message = createBaseUser();
    message.uuid = object.uuid ?? "";
    message.firstName = object.firstName ?? "";
    message.lastName = object.lastName ?? "";
    message.email = object.email ?? "";
    message.userType =
      object.userType !== undefined && object.userType !== null
        ? UserType.fromPartial(object.userType)
        : undefined;
    return message;
  },
};

function createBaseMedia(): Media {
  return {
    uuid: "",
    mimeType: "",
    name: "",
    title: "",
    description: "",
    url: "",
    blocked: "",
    createdAt: "",
    updatedAt: "",
  };
}

export const Media = {
  encode(message: Media, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.uuid !== "") {
      writer.uint32(10).string(message.uuid);
    }
    if (message.mimeType !== "") {
      writer.uint32(18).string(message.mimeType);
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.title !== "") {
      writer.uint32(34).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(42).string(message.description);
    }
    if (message.url !== "") {
      writer.uint32(50).string(message.url);
    }
    if (message.blocked !== "") {
      writer.uint32(58).string(message.blocked);
    }
    if (message.createdAt !== "") {
      writer.uint32(66).string(message.createdAt);
    }
    if (message.updatedAt !== "") {
      writer.uint32(74).string(message.updatedAt);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Media {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMedia();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.uuid = reader.string();
          break;
        case 2:
          message.mimeType = reader.string();
          break;
        case 3:
          message.name = reader.string();
          break;
        case 4:
          message.title = reader.string();
          break;
        case 5:
          message.description = reader.string();
          break;
        case 6:
          message.url = reader.string();
          break;
        case 7:
          message.blocked = reader.string();
          break;
        case 8:
          message.createdAt = reader.string();
          break;
        case 9:
          message.updatedAt = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Media {
    return {
      uuid: isSet(object.uuid) ? String(object.uuid) : "",
      mimeType: isSet(object.mimeType) ? String(object.mimeType) : "",
      name: isSet(object.name) ? String(object.name) : "",
      title: isSet(object.title) ? String(object.title) : "",
      description: isSet(object.description) ? String(object.description) : "",
      url: isSet(object.url) ? String(object.url) : "",
      blocked: isSet(object.blocked) ? String(object.blocked) : "",
      createdAt: isSet(object.createdAt) ? String(object.createdAt) : "",
      updatedAt: isSet(object.updatedAt) ? String(object.updatedAt) : "",
    };
  },

  toJSON(message: Media): unknown {
    const obj: any = {};
    message.uuid !== undefined && (obj.uuid = message.uuid);
    message.mimeType !== undefined && (obj.mimeType = message.mimeType);
    message.name !== undefined && (obj.name = message.name);
    message.title !== undefined && (obj.title = message.title);
    message.description !== undefined &&
      (obj.description = message.description);
    message.url !== undefined && (obj.url = message.url);
    message.blocked !== undefined && (obj.blocked = message.blocked);
    message.createdAt !== undefined && (obj.createdAt = message.createdAt);
    message.updatedAt !== undefined && (obj.updatedAt = message.updatedAt);
    return obj;
  },

  fromPartial(object: DeepPartial<Media>): Media {
    const message = createBaseMedia();
    message.uuid = object.uuid ?? "";
    message.mimeType = object.mimeType ?? "";
    message.name = object.name ?? "";
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.url = object.url ?? "";
    message.blocked = object.blocked ?? "";
    message.createdAt = object.createdAt ?? "";
    message.updatedAt = object.updatedAt ?? "";
    return message;
  },
};

function createBaseNotification(): Notification {
  return {
    uuid: "",
    title: "",
    message: "",
    isRead: false,
    modelType: "",
    modelUUID: "",
    createdAt: "",
    updatedAt: "",
    user: undefined,
  };
}

export const Notification = {
  encode(
    message: Notification,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.uuid !== "") {
      writer.uint32(10).string(message.uuid);
    }
    if (message.title !== "") {
      writer.uint32(18).string(message.title);
    }
    if (message.message !== "") {
      writer.uint32(26).string(message.message);
    }
    if (message.isRead === true) {
      writer.uint32(32).bool(message.isRead);
    }
    if (message.modelType !== "") {
      writer.uint32(42).string(message.modelType);
    }
    if (message.modelUUID !== "") {
      writer.uint32(50).string(message.modelUUID);
    }
    if (message.createdAt !== "") {
      writer.uint32(58).string(message.createdAt);
    }
    if (message.updatedAt !== "") {
      writer.uint32(66).string(message.updatedAt);
    }
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(74).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Notification {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNotification();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.uuid = reader.string();
          break;
        case 2:
          message.title = reader.string();
          break;
        case 3:
          message.message = reader.string();
          break;
        case 4:
          message.isRead = reader.bool();
          break;
        case 5:
          message.modelType = reader.string();
          break;
        case 6:
          message.modelUUID = reader.string();
          break;
        case 7:
          message.createdAt = reader.string();
          break;
        case 8:
          message.updatedAt = reader.string();
          break;
        case 9:
          message.user = User.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Notification {
    return {
      uuid: isSet(object.uuid) ? String(object.uuid) : "",
      title: isSet(object.title) ? String(object.title) : "",
      message: isSet(object.message) ? String(object.message) : "",
      isRead: isSet(object.isRead) ? Boolean(object.isRead) : false,
      modelType: isSet(object.modelType) ? String(object.modelType) : "",
      modelUUID: isSet(object.modelUUID) ? String(object.modelUUID) : "",
      createdAt: isSet(object.createdAt) ? String(object.createdAt) : "",
      updatedAt: isSet(object.updatedAt) ? String(object.updatedAt) : "",
      user: isSet(object.user) ? User.fromJSON(object.user) : undefined,
    };
  },

  toJSON(message: Notification): unknown {
    const obj: any = {};
    message.uuid !== undefined && (obj.uuid = message.uuid);
    message.title !== undefined && (obj.title = message.title);
    message.message !== undefined && (obj.message = message.message);
    message.isRead !== undefined && (obj.isRead = message.isRead);
    message.modelType !== undefined && (obj.modelType = message.modelType);
    message.modelUUID !== undefined && (obj.modelUUID = message.modelUUID);
    message.createdAt !== undefined && (obj.createdAt = message.createdAt);
    message.updatedAt !== undefined && (obj.updatedAt = message.updatedAt);
    message.user !== undefined &&
      (obj.user = message.user ? User.toJSON(message.user) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Notification>): Notification {
    const message = createBaseNotification();
    message.uuid = object.uuid ?? "";
    message.title = object.title ?? "";
    message.message = object.message ?? "";
    message.isRead = object.isRead ?? false;
    message.modelType = object.modelType ?? "";
    message.modelUUID = object.modelUUID ?? "";
    message.createdAt = object.createdAt ?? "";
    message.updatedAt = object.updatedAt ?? "";
    message.user =
      object.user !== undefined && object.user !== null
        ? User.fromPartial(object.user)
        : undefined;
    return message;
  },
};

function createBaseMessage(): Message {
  return {
    uuid: "",
    message: "",
    type: 0,
    createdAt: "",
    updatedAt: "",
    user: undefined,
  };
}

export const Message = {
  encode(
    message: Message,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.uuid !== "") {
      writer.uint32(10).string(message.uuid);
    }
    if (message.message !== "") {
      writer.uint32(18).string(message.message);
    }
    if (message.type !== 0) {
      writer.uint32(24).int32(message.type);
    }
    if (message.createdAt !== "") {
      writer.uint32(34).string(message.createdAt);
    }
    if (message.updatedAt !== "") {
      writer.uint32(42).string(message.updatedAt);
    }
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Message {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.uuid = reader.string();
          break;
        case 2:
          message.message = reader.string();
          break;
        case 3:
          message.type = reader.int32() as any;
          break;
        case 4:
          message.createdAt = reader.string();
          break;
        case 5:
          message.updatedAt = reader.string();
          break;
        case 6:
          message.user = User.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Message {
    return {
      uuid: isSet(object.uuid) ? String(object.uuid) : "",
      message: isSet(object.message) ? String(object.message) : "",
      type: isSet(object.type) ? messageTypesFromJSON(object.type) : 0,
      createdAt: isSet(object.createdAt) ? String(object.createdAt) : "",
      updatedAt: isSet(object.updatedAt) ? String(object.updatedAt) : "",
      user: isSet(object.user) ? User.fromJSON(object.user) : undefined,
    };
  },

  toJSON(message: Message): unknown {
    const obj: any = {};
    message.uuid !== undefined && (obj.uuid = message.uuid);
    message.message !== undefined && (obj.message = message.message);
    message.type !== undefined && (obj.type = messageTypesToJSON(message.type));
    message.createdAt !== undefined && (obj.createdAt = message.createdAt);
    message.updatedAt !== undefined && (obj.updatedAt = message.updatedAt);
    message.user !== undefined &&
      (obj.user = message.user ? User.toJSON(message.user) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Message>): Message {
    const message = createBaseMessage();
    message.uuid = object.uuid ?? "";
    message.message = object.message ?? "";
    message.type = object.type ?? 0;
    message.createdAt = object.createdAt ?? "";
    message.updatedAt = object.updatedAt ?? "";
    message.user =
      object.user !== undefined && object.user !== null
        ? User.fromPartial(object.user)
        : undefined;
    return message;
  },
};

function createBaseOrder(): Order {
  return { uuid: "" };
}

export const Order = {
  encode(message: Order, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.uuid !== "") {
      writer.uint32(10).string(message.uuid);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Order {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrder();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.uuid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Order {
    return {
      uuid: isSet(object.uuid) ? String(object.uuid) : "",
    };
  },

  toJSON(message: Order): unknown {
    const obj: any = {};
    message.uuid !== undefined && (obj.uuid = message.uuid);
    return obj;
  },

  fromPartial(object: DeepPartial<Order>): Order {
    const message = createBaseOrder();
    message.uuid = object.uuid ?? "";
    return message;
  },
};

function createBaseFetchNotificationsRequest(): FetchNotificationsRequest {
  return { userToken: undefined };
}

export const FetchNotificationsRequest = {
  encode(
    message: FetchNotificationsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.userToken !== undefined) {
      UserToken.encode(message.userToken, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): FetchNotificationsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFetchNotificationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userToken = UserToken.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FetchNotificationsRequest {
    return {
      userToken: isSet(object.userToken)
        ? UserToken.fromJSON(object.userToken)
        : undefined,
    };
  },

  toJSON(message: FetchNotificationsRequest): unknown {
    const obj: any = {};
    message.userToken !== undefined &&
      (obj.userToken = message.userToken
        ? UserToken.toJSON(message.userToken)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<FetchNotificationsRequest>
  ): FetchNotificationsRequest {
    const message = createBaseFetchNotificationsRequest();
    message.userToken =
      object.userToken !== undefined && object.userToken !== null
        ? UserToken.fromPartial(object.userToken)
        : undefined;
    return message;
  },
};

function createBaseFetchNotificationsResponse(): FetchNotificationsResponse {
  return { notifications: [] };
}

export const FetchNotificationsResponse = {
  encode(
    message: FetchNotificationsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.notifications) {
      Notification.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): FetchNotificationsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFetchNotificationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.notifications.push(
            Notification.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FetchNotificationsResponse {
    return {
      notifications: Array.isArray(object?.notifications)
        ? object.notifications.map((e: any) => Notification.fromJSON(e))
        : [],
    };
  },

  toJSON(message: FetchNotificationsResponse): unknown {
    const obj: any = {};
    if (message.notifications) {
      obj.notifications = message.notifications.map((e) =>
        e ? Notification.toJSON(e) : undefined
      );
    } else {
      obj.notifications = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<FetchNotificationsResponse>
  ): FetchNotificationsResponse {
    const message = createBaseFetchNotificationsResponse();
    message.notifications =
      object.notifications?.map((e) => Notification.fromPartial(e)) || [];
    return message;
  },
};

function createBaseListenNotificationsRequest(): ListenNotificationsRequest {
  return { userToken: undefined };
}

export const ListenNotificationsRequest = {
  encode(
    message: ListenNotificationsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.userToken !== undefined) {
      UserToken.encode(message.userToken, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ListenNotificationsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListenNotificationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userToken = UserToken.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListenNotificationsRequest {
    return {
      userToken: isSet(object.userToken)
        ? UserToken.fromJSON(object.userToken)
        : undefined,
    };
  },

  toJSON(message: ListenNotificationsRequest): unknown {
    const obj: any = {};
    message.userToken !== undefined &&
      (obj.userToken = message.userToken
        ? UserToken.toJSON(message.userToken)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListenNotificationsRequest>
  ): ListenNotificationsRequest {
    const message = createBaseListenNotificationsRequest();
    message.userToken =
      object.userToken !== undefined && object.userToken !== null
        ? UserToken.fromPartial(object.userToken)
        : undefined;
    return message;
  },
};

function createBaseListenNotificationsResponse(): ListenNotificationsResponse {
  return { notification: undefined };
}

export const ListenNotificationsResponse = {
  encode(
    message: ListenNotificationsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.notification !== undefined) {
      Notification.encode(
        message.notification,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ListenNotificationsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListenNotificationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.notification = Notification.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListenNotificationsResponse {
    return {
      notification: isSet(object.notification)
        ? Notification.fromJSON(object.notification)
        : undefined,
    };
  },

  toJSON(message: ListenNotificationsResponse): unknown {
    const obj: any = {};
    message.notification !== undefined &&
      (obj.notification = message.notification
        ? Notification.toJSON(message.notification)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListenNotificationsResponse>
  ): ListenNotificationsResponse {
    const message = createBaseListenNotificationsResponse();
    message.notification =
      object.notification !== undefined && object.notification !== null
        ? Notification.fromPartial(object.notification)
        : undefined;
    return message;
  },
};

function createBaseFetchMessagesRequest(): FetchMessagesRequest {
  return { userToken: undefined, roomUUID: "" };
}

export const FetchMessagesRequest = {
  encode(
    message: FetchMessagesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.userToken !== undefined) {
      UserToken.encode(message.userToken, writer.uint32(10).fork()).ldelim();
    }
    if (message.roomUUID !== "") {
      writer.uint32(18).string(message.roomUUID);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): FetchMessagesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFetchMessagesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userToken = UserToken.decode(reader, reader.uint32());
          break;
        case 2:
          message.roomUUID = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FetchMessagesRequest {
    return {
      userToken: isSet(object.userToken)
        ? UserToken.fromJSON(object.userToken)
        : undefined,
      roomUUID: isSet(object.roomUUID) ? String(object.roomUUID) : "",
    };
  },

  toJSON(message: FetchMessagesRequest): unknown {
    const obj: any = {};
    message.userToken !== undefined &&
      (obj.userToken = message.userToken
        ? UserToken.toJSON(message.userToken)
        : undefined);
    message.roomUUID !== undefined && (obj.roomUUID = message.roomUUID);
    return obj;
  },

  fromPartial(object: DeepPartial<FetchMessagesRequest>): FetchMessagesRequest {
    const message = createBaseFetchMessagesRequest();
    message.userToken =
      object.userToken !== undefined && object.userToken !== null
        ? UserToken.fromPartial(object.userToken)
        : undefined;
    message.roomUUID = object.roomUUID ?? "";
    return message;
  },
};

function createBaseFetchMessagesResponse(): FetchMessagesResponse {
  return { messages: [] };
}

export const FetchMessagesResponse = {
  encode(
    message: FetchMessagesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.messages) {
      Message.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): FetchMessagesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFetchMessagesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.messages.push(Message.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FetchMessagesResponse {
    return {
      messages: Array.isArray(object?.messages)
        ? object.messages.map((e: any) => Message.fromJSON(e))
        : [],
    };
  },

  toJSON(message: FetchMessagesResponse): unknown {
    const obj: any = {};
    if (message.messages) {
      obj.messages = message.messages.map((e) =>
        e ? Message.toJSON(e) : undefined
      );
    } else {
      obj.messages = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<FetchMessagesResponse>
  ): FetchMessagesResponse {
    const message = createBaseFetchMessagesResponse();
    message.messages =
      object.messages?.map((e) => Message.fromPartial(e)) || [];
    return message;
  },
};

function createBaseListenMessagesRequest(): ListenMessagesRequest {
  return { userToken: undefined, roomUUID: "" };
}

export const ListenMessagesRequest = {
  encode(
    message: ListenMessagesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.userToken !== undefined) {
      UserToken.encode(message.userToken, writer.uint32(10).fork()).ldelim();
    }
    if (message.roomUUID !== "") {
      writer.uint32(18).string(message.roomUUID);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ListenMessagesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListenMessagesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userToken = UserToken.decode(reader, reader.uint32());
          break;
        case 2:
          message.roomUUID = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListenMessagesRequest {
    return {
      userToken: isSet(object.userToken)
        ? UserToken.fromJSON(object.userToken)
        : undefined,
      roomUUID: isSet(object.roomUUID) ? String(object.roomUUID) : "",
    };
  },

  toJSON(message: ListenMessagesRequest): unknown {
    const obj: any = {};
    message.userToken !== undefined &&
      (obj.userToken = message.userToken
        ? UserToken.toJSON(message.userToken)
        : undefined);
    message.roomUUID !== undefined && (obj.roomUUID = message.roomUUID);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListenMessagesRequest>
  ): ListenMessagesRequest {
    const message = createBaseListenMessagesRequest();
    message.userToken =
      object.userToken !== undefined && object.userToken !== null
        ? UserToken.fromPartial(object.userToken)
        : undefined;
    message.roomUUID = object.roomUUID ?? "";
    return message;
  },
};

function createBaseListenOrderRequest(): ListenOrderRequest {
  return { userToken: undefined };
}

export const ListenOrderRequest = {
  encode(
    message: ListenOrderRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.userToken !== undefined) {
      UserToken.encode(message.userToken, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListenOrderRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListenOrderRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userToken = UserToken.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListenOrderRequest {
    return {
      userToken: isSet(object.userToken)
        ? UserToken.fromJSON(object.userToken)
        : undefined,
    };
  },

  toJSON(message: ListenOrderRequest): unknown {
    const obj: any = {};
    message.userToken !== undefined &&
      (obj.userToken = message.userToken
        ? UserToken.toJSON(message.userToken)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<ListenOrderRequest>): ListenOrderRequest {
    const message = createBaseListenOrderRequest();
    message.userToken =
      object.userToken !== undefined && object.userToken !== null
        ? UserToken.fromPartial(object.userToken)
        : undefined;
    return message;
  },
};

function createBaseListenMessagesResponse(): ListenMessagesResponse {
  return { messages: [] };
}

export const ListenMessagesResponse = {
  encode(
    message: ListenMessagesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.messages) {
      Message.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ListenMessagesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListenMessagesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.messages.push(Message.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListenMessagesResponse {
    return {
      messages: Array.isArray(object?.messages)
        ? object.messages.map((e: any) => Message.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ListenMessagesResponse): unknown {
    const obj: any = {};
    if (message.messages) {
      obj.messages = message.messages.map((e) =>
        e ? Message.toJSON(e) : undefined
      );
    } else {
      obj.messages = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<ListenMessagesResponse>
  ): ListenMessagesResponse {
    const message = createBaseListenMessagesResponse();
    message.messages =
      object.messages?.map((e) => Message.fromPartial(e)) || [];
    return message;
  },
};

function createBaseListenOrdersResponse(): ListenOrdersResponse {
  return { order: undefined };
}

export const ListenOrdersResponse = {
  encode(
    message: ListenOrdersResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.order !== undefined) {
      Order.encode(message.order, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ListenOrdersResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListenOrdersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.order = Order.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListenOrdersResponse {
    return {
      order: isSet(object.order) ? Order.fromJSON(object.order) : undefined,
    };
  },

  toJSON(message: ListenOrdersResponse): unknown {
    const obj: any = {};
    message.order !== undefined &&
      (obj.order = message.order ? Order.toJSON(message.order) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<ListenOrdersResponse>): ListenOrdersResponse {
    const message = createBaseListenOrdersResponse();
    message.order =
      object.order !== undefined && object.order !== null
        ? Order.fromPartial(object.order)
        : undefined;
    return message;
  },
};

function createBasePingResponse(): PingResponse {
  return { pong: "" };
}

export const PingResponse = {
  encode(
    message: PingResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pong !== "") {
      writer.uint32(10).string(message.pong);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PingResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePingResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pong = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PingResponse {
    return {
      pong: isSet(object.pong) ? String(object.pong) : "",
    };
  },

  toJSON(message: PingResponse): unknown {
    const obj: any = {};
    message.pong !== undefined && (obj.pong = message.pong);
    return obj;
  },

  fromPartial(object: DeepPartial<PingResponse>): PingResponse {
    const message = createBasePingResponse();
    message.pong = object.pong ?? "";
    return message;
  },
};

function createBasePingRequest(): PingRequest {
  return {};
}

export const PingRequest = {
  encode(_: PingRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PingRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePingRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): PingRequest {
    return {};
  },

  toJSON(_: PingRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<PingRequest>): PingRequest {
    const message = createBasePingRequest();
    return message;
  },
};

/**
 * //////////////////////////
 * SERVICES
 * //////////////////////////
 */
export type NotificationServiceDefinition =
  typeof NotificationServiceDefinition;
export const NotificationServiceDefinition = {
  name: "NotificationService",
  fullName: "carpet.src.v1.NotificationService",
  methods: {
    fetchNotifications: {
      name: "FetchNotifications",
      requestType: FetchNotificationsRequest,
      requestStream: false,
      responseType: FetchNotificationsResponse,
      responseStream: false,
      options: {},
    },
    listenNotifications: {
      name: "ListenNotifications",
      requestType: ListenNotificationsRequest,
      requestStream: false,
      responseType: ListenNotificationsResponse,
      responseStream: true,
      options: {},
    },
    ping: {
      name: "Ping",
      requestType: PingRequest,
      requestStream: false,
      responseType: PingResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface NotificationServiceServiceImplementation<CallContextExt = {}> {
  fetchNotifications(
    request: FetchNotificationsRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<FetchNotificationsResponse>>;
  listenNotifications(
    request: ListenNotificationsRequest,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<ListenNotificationsResponse>>;
  ping(
    request: PingRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<PingResponse>>;
}

export interface NotificationServiceClient<CallOptionsExt = {}> {
  fetchNotifications(
    request: DeepPartial<FetchNotificationsRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<FetchNotificationsResponse>;
  listenNotifications(
    request: DeepPartial<ListenNotificationsRequest>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<ListenNotificationsResponse>;
  ping(
    request: DeepPartial<PingRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<PingResponse>;
}

export type MessageServiceDefinition = typeof MessageServiceDefinition;
export const MessageServiceDefinition = {
  name: "MessageService",
  fullName: "carpet.src.v1.MessageService",
  methods: {
    fetchMessages: {
      name: "FetchMessages",
      requestType: FetchMessagesRequest,
      requestStream: false,
      responseType: FetchMessagesResponse,
      responseStream: false,
      options: {},
    },
    lisenMessages: {
      name: "LisenMessages",
      requestType: ListenMessagesRequest,
      requestStream: false,
      responseType: ListenMessagesResponse,
      responseStream: true,
      options: {},
    },
    listenOrders: {
      name: "ListenOrders",
      requestType: ListenOrderRequest,
      requestStream: false,
      responseType: ListenOrdersResponse,
      responseStream: true,
      options: {},
    },
    ping: {
      name: "Ping",
      requestType: PingRequest,
      requestStream: false,
      responseType: PingResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface MessageServiceServiceImplementation<CallContextExt = {}> {
  fetchMessages(
    request: FetchMessagesRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<FetchMessagesResponse>>;
  lisenMessages(
    request: ListenMessagesRequest,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<ListenMessagesResponse>>;
  listenOrders(
    request: ListenOrderRequest,
    context: CallContext & CallContextExt
  ): ServerStreamingMethodResult<DeepPartial<ListenOrdersResponse>>;
  ping(
    request: PingRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<PingResponse>>;
}

export interface MessageServiceClient<CallOptionsExt = {}> {
  fetchMessages(
    request: DeepPartial<FetchMessagesRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<FetchMessagesResponse>;
  lisenMessages(
    request: DeepPartial<ListenMessagesRequest>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<ListenMessagesResponse>;
  listenOrders(
    request: DeepPartial<ListenOrderRequest>,
    options?: CallOptions & CallOptionsExt
  ): AsyncIterable<ListenOrdersResponse>;
  ping(
    request: DeepPartial<PingRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<PingResponse>;
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export type ServerStreamingMethodResult<Response> = {
  [Symbol.asyncIterator](): AsyncIterator<Response, void>;
};
