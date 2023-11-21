import * as dotenv from "dotenv";
dotenv.config();

//  queues running on the web server
import Queue from "bee-queue";

const sharedWorkerConfig = {
  removeOnSuccess: true,
  removeOnFailure: true,
  redis: {
    host: "localhost",
    port: 6379,
    password: process.env.REDIS_PASSWORD,
  },
};

const collectionQueue = new Queue("collection", sharedWorkerConfig);
const primaryQueue = new Queue("primary", sharedWorkerConfig);
const liveQueue = new Queue("live", sharedWorkerConfig);
const imageQueue = new Queue("image", sharedWorkerConfig);
const metadataQueue = new Queue("metadata", sharedWorkerConfig);

export const workers = {
  collectionQueue,
  primaryQueue,
  liveQueue,
  imageQueue,
  metadataQueue,
};
