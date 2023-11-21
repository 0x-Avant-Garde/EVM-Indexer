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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const web3_1 = require("./utils/web3");
const processEvent_1 = require("./helpers/processEvent");
const ioredis_1 = require("ioredis");
const redis = new ioredis_1.Redis({
    port: 6379,
    host: "localhost",
    password: process.env.REDIS_PASSWORD,
});
function listen() {
    return __awaiter(this, void 0, void 0, function* () {
        const lastSeen = yield redis.get("lastSeenLiveBlock");
        const lastSeenBlock = Number(lastSeen);
        const options721 = {
            fromBlock: lastSeenBlock,
            toBlock: "latest",
            topics: [
                [
                    web3_1.ABIHash.Transfer,
                    web3_1.ABIHash.PunkTransfer,
                    web3_1.ABIHash.Approval,
                    web3_1.ABIHash.ApprovalForAll,
                    web3_1.ABIHash.TransferSingle,
                    web3_1.ABIHash.TransferBatch,
                    web3_1.ABIHash.URI,
                ],
            ],
        };
        var subscription = web3_1.web3Ws.eth.subscribe("logs", options721);
        subscription.on("data", (event) => __awaiter(this, void 0, void 0, function* () {
            // console.log(event);
            if (event.topics[0] == web3_1.ABIHash.Transfer) {
                // A normal ERC-721 Transfer has occured
                yield (0, processEvent_1.processEvent)({
                    event: event,
                    action: "Transfer",
                    argCount: event.topics.length,
                    live: true,
                });
            }
            if (event.topics[0] == web3_1.ABIHash.PunkTransfer) {
                // A Punk ERC-721 Transfer has occured
                yield (0, processEvent_1.processEvent)({
                    event: event,
                    action: "PunkTransfer",
                    argCount: event.topics.length,
                    live: true,
                });
            }
            if (event.topics[0] == web3_1.ABIHash.Approval) {
                // An Approval Event has occured
                yield (0, processEvent_1.processEvent)({
                    event: event,
                    action: "Approval",
                    argCount: event.topics.length,
                    live: true,
                });
            }
            if (event.topics[0] == web3_1.ABIHash.ApprovalForAll) {
                // An Approval Event has occured
                yield (0, processEvent_1.processEvent)({
                    event: event,
                    action: "ApprovalForAll",
                    argCount: event.topics.length,
                    live: true,
                });
            }
            if (event.topics[0] == web3_1.ABIHash.TransferSingle) {
                // A normal ERC-1155 Transfer has occured
                yield (0, processEvent_1.processEvent)({
                    event: event,
                    action: "TransferSingle",
                    argCount: event.topics.length,
                    live: true,
                });
            }
            if (event.topics[0] == web3_1.ABIHash.TransferBatch) {
                // A normal ERC-1155 Batch Transfer has occured
                yield (0, processEvent_1.processEvent)({
                    event: event,
                    action: "TransferBatch",
                    argCount: event.topics.length,
                    live: true,
                });
            }
            if (event.topics[0] == web3_1.ABIHash.URI) {
                yield (0, processEvent_1.processEvent)({
                    event: event,
                    action: "UriChange",
                    argCount: event.topics.length,
                    live: true,
                });
            }
            yield redis.set("lastSeenLiveBlock", event.blockNumber);
        }));
        subscription.on("error", (err) => {
            console.log(err);
        });
    });
}
listen();
