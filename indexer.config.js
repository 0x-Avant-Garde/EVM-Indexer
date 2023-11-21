module.exports = {
  apps: [
    { name: "processor", script: "./dist/index.js" },
    { name: "listener", script: "./dist/listener.js" },
    {
      name: "collectionInfoWorker",
      script: "./dist/workers/collectionInfoWorker.js",
    },

    { name: "imageWorker", script: "./dist/workers/imageWorker.js" },

    { name: "metadataWorker", script: "./dist/workers/metadataWorker.js" },

    { name: "primaryWorker", script: "./dist/workers/primaryWorker.js" },
    { name: "liveWorker", script: "./dist/workers/liveWorker.js" },
  ],
};
