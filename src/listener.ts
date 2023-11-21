import * as dotenv from "dotenv";
dotenv.config();
import { web3Ws, ABIHash } from "./utils/web3";
import { processEvent } from "./helpers/processEvent";
import { Redis } from "ioredis";

const redis = new Redis({
  port: 6379, // Redis port
  host: "localhost", // Redis host
  password: process.env.REDIS_PASSWORD,
});

async function listen() {
  const lastSeen = await redis.get("lastSeenLiveBlock");
  const lastSeenBlock = Number(lastSeen);
  const options721 = {
    fromBlock: lastSeenBlock,
    toBlock: "latest",
    topics: [
      [
        ABIHash.Transfer,
        ABIHash.PunkTransfer,
        ABIHash.Approval,
        ABIHash.ApprovalForAll,
        ABIHash.TransferSingle,
        ABIHash.TransferBatch,
        ABIHash.URI,
      ],
    ],
  };

  var subscription = web3Ws.eth.subscribe("logs", options721);

  subscription.on("data", async (event: any) => {
    // console.log(event);
    if (event.topics[0] == ABIHash.Transfer) {
      // A normal ERC-721 Transfer has occured

      await processEvent({
        event: event,
        action: "Transfer",
        argCount: event.topics.length,
        live: true,
      });
    }

    if (event.topics[0] == ABIHash.PunkTransfer) {
      // A Punk ERC-721 Transfer has occured

      await processEvent({
        event: event,
        action: "PunkTransfer",
        argCount: event.topics.length,
        live: true,
      });
    }

    if (event.topics[0] == ABIHash.Approval) {
      // An Approval Event has occured

      await processEvent({
        event: event,
        action: "Approval",
        argCount: event.topics.length,
        live: true,
      });
    }

    if (event.topics[0] == ABIHash.ApprovalForAll) {
      // An Approval Event has occured

      await processEvent({
        event: event,
        action: "ApprovalForAll",
        argCount: event.topics.length,
        live: true,
      });
    }

    if (event.topics[0] == ABIHash.TransferSingle) {
      // A normal ERC-1155 Transfer has occured

      await processEvent({
        event: event,
        action: "TransferSingle",
        argCount: event.topics.length,
        live: true,
      });
    }

    if (event.topics[0] == ABIHash.TransferBatch) {
      // A normal ERC-1155 Batch Transfer has occured
      await processEvent({
        event: event,
        action: "TransferBatch",
        argCount: event.topics.length,
        live: true,
      });
    }

    if (event.topics[0] == ABIHash.URI) {
      await processEvent({
        event: event,
        action: "UriChange",
        argCount: event.topics.length,
        live: true,
      });
    }
    await redis.set("lastSeenLiveBlock", event.blockNumber);
  });

  subscription.on("error", (err: any) => {
    console.log(err);
  });
}

listen();
