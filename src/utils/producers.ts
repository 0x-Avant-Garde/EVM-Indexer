import * as dotenv from "dotenv";
dotenv.config();

import Queue from "bee-queue";

const sharedProducerConfig = {
  getEvents: false,
  isWorker: false,
  redis: {
    host: "localhost",
    port: 6379,
    password: process.env.REDIS_PASSWORD,
  },
};

const collectionQueue = new Queue("collection", sharedProducerConfig);
const primaryQueue = new Queue("primary", sharedProducerConfig);
const liveQueue = new Queue("live", sharedProducerConfig);
const imageQueue = new Queue("image", sharedProducerConfig);
const metadataQueue = new Queue("metadata", sharedProducerConfig);

export const producers = {
  collectionQueue,
  primaryQueue,
  liveQueue,
  imageQueue,
  metadataQueue,
};
