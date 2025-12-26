import * as fs from "fs";
import * as path from "path";

var PRIVATE_KEY = fs.readFileSync(path.join(__dirname, "./../../private.key"));

console.log(process.env);

export default {
  redisHost: process.env.REDIS_HOST || "",
  redisPort: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : null,
  notificationHost: process.env.NOTIFICATION_HOST,
  notificationPort: process.env.NOTIFICATION_PORT,
  messageHost: process.env.MESSAGE_HOST,
  messagePort: process.env.MESSAGE_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
  AWSAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  AWSSecretKey: process.env.AWS_SECRET_KEY,
  AWSBucket: process.env.AWS_BUCKET,
  AWSRegion: process.env.AWS_REGION,
  storageEndpoint: process.env.STORAGE_URL,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  sendgridFromEmail: process.env.SENDGRID_FROM_MAIL || 'varun9509@gmail.com',
  hostUrl: process.env.HOST_URL,
  port: process.env.PORT,
  timeZone: process.env.TZ,
  hashSalt: 10,
  refreshTokenLife: 1000 * 60 * 60 * 24 * 7,
  refreshTokenExpiresIn: 7,
  privateKey: PRIVATE_KEY.toString(),
  sessionDuration: 60 * 60 * 24 * 7,
  rootFolder: path.resolve(path.join(__dirname, "..")),
};
