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
const redis_1 = require("./utils/redis");
function getPastLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        const lastSeen = yield redis_1.redis.get("lastSeenBlock");
        const lastSeenBlock = Number(lastSeen);
        // var fromBlock = lastSeenBlock;
        var fromBlock = 2253000;
        var toBlock = fromBlock + 10;
        // var toBlock = lastSeenBlock + 10;
        const endBlock = 2255000;
        console.log("Starting");
        while (toBlock <= endBlock) {
            console.log("To Block: ", toBlock);
            const event = yield web3_1.web3Ws.eth.getPastLogs({
                fromBlock: fromBlock,
                toBlock: toBlock,
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
            });
            let i = 0;
            const len = event.length;
            if (len == 0) {
                yield redis_1.redis.set("lastSeenBlock", toBlock);
            }
            while (i < len) {
                if (event[i].topics[0] == web3_1.ABIHash.Transfer) {
                    // A normal ERC-721 Transfer has occured
                    yield (0, processEvent_1.processEvent)({
                        event: event[i],
                        action: "Transfer",
                        argCount: event[i].topics.length,
                    });
                }
                else if (event[i].topics[0] == web3_1.ABIHash.PunkTransfer) {
                    // A normal ERC-721 Transfer has occured
                    console.log("Punk Transfer: ", event[i].topics.length);
                    yield (0, processEvent_1.processEvent)({
                        event: event[i],
                        action: "PunkTransfer",
                        argCount: event[i].topics.length,
                    });
                }
                else if (event[i].topics[0] == web3_1.ABIHash.Approval) {
                    // An Approval Event has occured
                    // if (event[i].topics.length > 3) console.log("Indexer Approval");
                    yield (0, processEvent_1.processEvent)({
                        event: event[i],
                        action: "Approval",
                        argCount: event[i].topics.length,
                    });
                }
                else if (event[i].topics[0] == web3_1.ABIHash.ApprovalForAll) {
                    // An Approval Event has occured
                    // console.log("Index AFA", event[i].topics.length);
                    yield (0, processEvent_1.processEvent)({
                        event: event[i],
                        action: "ApprovalForAll",
                        argCount: event[i].topics.length,
                    });
                }
                else if (event[i].topics[0] == web3_1.ABIHash.TransferSingle) {
                    // A normal ERC-1155 Transfer has occured
                    yield (0, processEvent_1.processEvent)({
                        event: event[i],
                        action: "TransferSingle",
                        argCount: event[i].topics.length,
                    });
                }
                else if (event[i].topics[0] == web3_1.ABIHash.TransferBatch) {
                    // A normal ERC-1155 Batch Transfer has occured
                    yield (0, processEvent_1.processEvent)({
                        event: event[i],
                        action: "TransferBatch",
                        argCount: event[i].topics.length,
                    });
                }
                else if (event[i].topics[0] == web3_1.ABIHash.URI) {
                    yield (0, processEvent_1.processEvent)({
                        event: event[i],
                        action: "UriChange",
                        argCount: event[i].topics.length,
                    });
                }
                yield redis_1.redis.set("lastSeenBlock", event[i].blockNumber);
                i++;
            }
            // Terminate every 5000 blocks to avoid memory leaks //
            if (toBlock >= Number(lastSeen) + 20000) {
                process.exit(0);
            }
            fromBlock = toBlock + 1;
            toBlock = toBlock + 10;
        }
    });
}
getPastLogs();
