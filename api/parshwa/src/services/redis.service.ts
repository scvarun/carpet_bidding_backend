import config from "../config";
import * as redis from "redis";
import { isNil } from "lodash";

class RedisClient {
  private _client = redis.createClient({
    url: `redis://${config.redisHost}:${config.redisPort}`,
  });
  private static _instance;

  constructor() {
    this._client.on("error", function (err) {
      console.error("[RedisError] : " + err);
    });

    this._client.connect();
  }

  /**
   * @return {RedisClient} instance
   */
  static instance(): RedisClient {
    if (isNil(RedisClient._instance)) {
      RedisClient._instance = new RedisClient();
    }
    return RedisClient._instance;
  }

  get client() {
    return this._client;
  }
}

export default RedisClient;
