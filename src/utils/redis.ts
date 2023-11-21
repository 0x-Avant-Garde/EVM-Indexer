import * as dotenv from "dotenv";
dotenv.config();

import { Redis } from "ioredis";

export const redis = new Redis({
  port: 6379, // Redis port
  host: "localhost", // Redis host
  password: process.env.REDIS_PASSWORD,
});
