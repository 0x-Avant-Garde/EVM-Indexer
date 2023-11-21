import * as dotenv from "dotenv";
dotenv.config();
import { web3Ws, ABIHash } from "./utils/web3";
import { processEvent } from "./helpers/processEvent";
import { redis } from "./utils/redis";

async function getPastLogs() {
  const lastSeen = await redis.get("lastSeenBlock");
  const lastSeenBlock = Number(lastSeen);
  // var fromBlock = lastSeenBlock;
  var fromBlock = 2253000;
  var toBlock = fromBlock + 10;
  // var toBlock = lastSeenBlock + 10;
  const endBlock = 2255000;
  console.log("Starting");

  while (toBlock <= endBlock) {
    console.log("To Block: ", toBlock);
    const event = await web3Ws.eth.getPastLogs({
      fromBlock: fromBlock,
      toBlock: toBlock,
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
    });

    let i = 0;
    const len = event.length;

    if (len == 0) {
      await redis.set("lastSeenBlock", toBlock);
    }

    while (i < len) {
      if (event[i].topics[0] == ABIHash.Transfer) {
        // A normal ERC-721 Transfer has occured

        await processEvent({
          event: event[i],
          action: "Transfer",
          argCount: event[i].topics.length,
        });
      } else if (event[i].topics[0] == ABIHash.PunkTransfer) {
        // A normal ERC-721 Transfer has occured

        console.log("Punk Transfer: ", event[i].topics.length);
        await processEvent({
          event: event[i],
          action: "PunkTransfer",
          argCount: event[i].topics.length,
        });
      } else if (event[i].topics[0] == ABIHash.Approval) {
        // An Approval Event has occured
        // if (event[i].topics.length > 3) console.log("Indexer Approval");
        await processEvent({
          event: event[i],
          action: "Approval",
          argCount: event[i].topics.length,
        });
      } else if (event[i].topics[0] == ABIHash.ApprovalForAll) {
        // An Approval Event has occured
        // console.log("Index AFA", event[i].topics.length);
        await processEvent({
          event: event[i],
          action: "ApprovalForAll",
          argCount: event[i].topics.length,
        });
      } else if (event[i].topics[0] == ABIHash.TransferSingle) {
        // A normal ERC-1155 Transfer has occured

        await processEvent({
          event: event[i],
          action: "TransferSingle",
          argCount: event[i].topics.length,
        });
      } else if (event[i].topics[0] == ABIHash.TransferBatch) {
        // A normal ERC-1155 Batch Transfer has occured
        await processEvent({
          event: event[i],
          action: "TransferBatch",
          argCount: event[i].topics.length,
        });
      } else if (event[i].topics[0] == ABIHash.URI) {
        await processEvent({
          event: event[i],
          action: "UriChange",
          argCount: event[i].topics.length,
        });
      }
      await redis.set("lastSeenBlock", event[i].blockNumber);
      i++;
    }

    // Terminate every 5000 blocks to avoid memory leaks //

    if (toBlock >= Number(lastSeen) + 20000) {
      process.exit(0);
    }

    fromBlock = toBlock + 1;
    toBlock = toBlock + 10;
  }
}

getPastLogs();
