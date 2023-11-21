"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workers = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
//  queues running on the web server
const bee_queue_1 = __importDefault(require("bee-queue"));
const sharedWorkerConfig = {
    removeOnSuccess: true,
    removeOnFailure: true,
    redis: {
        host: "localhost",
        port: 6379,
        password: process.env.REDIS_PASSWORD,
    },
};
const collectionQueue = new bee_queue_1.default("collection", sharedWorkerConfig);
const primaryQueue = new bee_queue_1.default("primary", sharedWorkerConfig);
const liveQueue = new bee_queue_1.default("live", sharedWorkerConfig);
const imageQueue = new bee_queue_1.default("image", sharedWorkerConfig);
const metadataQueue = new bee_queue_1.default("metadata", sharedWorkerConfig);
exports.workers = {
    collectionQueue,
    primaryQueue,
    liveQueue,
    imageQueue,
    metadataQueue,
};
