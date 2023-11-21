import * as dotenv from "dotenv";
dotenv.config();

const Arena = require("bull-arena");
const Bee = require("bee-queue");
const express = require("express");
const router = express.Router();

const arena = Arena(
  {
    Bee,
    // Include a reference to the bee-queue or bull libraries, depending on the library being used.

    queues: [
      {
        // Required for each queue definition.
        name: "primary",

        // User-readable display name for the host. Required.
        hostId: "Primary Queue",

        // Queue type (Bull or Bee - default Bull).
        type: "bee",

        host: "localhost",
        port: 6379,
        password: process.env.REDIS_PASSWORD,
      },
      {
        // Required for each queue definition.
        name: "metadata",

        // User-readable display name for the host. Required.
        hostId: "Metadata Queue",

        // Queue type (Bull or Bee - default Bull).
        type: "bee",

        host: "localhost",
        port: 6379,
        password: process.env.REDIS_PASSWORD,
      },
      {
        // Required for each queue definition.
        name: "image",

        // User-readable display name for the host. Required.
        hostId: "Image Queue",

        // Queue type (Bull or Bee - default Bull).
        type: "bee",

        host: "localhost",
        port: 6379,
        password: process.env.REDIS_PASSWORD,
      },
      {
        // Required for each queue definition.
        name: "collection",

        // User-readable display name for the host. Required.
        hostId: "Collection Queue",

        // Queue type (Bull or Bee - default Bull).
        type: "bee",

        host: "localhost",
        port: 6379,
        password: process.env.REDIS_PASSWORD,
      },
    ],
  },
  {
    // Make the arena dashboard become available at {my-site.com}/arena.
    basePath: "/arena",
  }
);

router.use("/", arena);
