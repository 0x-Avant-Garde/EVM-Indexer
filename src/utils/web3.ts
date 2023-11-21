import * as dotenv from "dotenv";
dotenv.config();

import Web3 from "web3";

export const web3 = new Web3(process.env.RPC_ENDPOINT!);

export const web3Ws = new Web3(
  new Web3.providers.WebsocketProvider(process.env.RPC_WS_ENDPOINT!, {
    clientConfig: {
      maxReceivedFrameSize: 7000000000000,
      maxReceivedMessageSize: 7000000000000,
      keepalive: true,
      keepaliveInterval: 60000, // ms
    },
    reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 5,
      onTimeout: true,
    },
  })
);

export const ABIHash = {
  // ** 721 Functions ** //
  Transfer: <string>web3.utils.sha3("Transfer(address,address,uint256)"),
  PunkTransfer: <string>(
    web3.utils.sha3("PunkTransfer(address,address,uint256)")
  ),
  // **** NEED TO IMPLEMENT **** //
  Approval: <string>web3.utils.sha3("Approval(address,address,uint256)"),
  // **** NEED TO IMPLEMENT **** //
  ApprovalForAll: <string>(
    web3.utils.sha3("ApprovalForAll(address,address,bool)")
  ),
  // ** 1155 Functions **/
  TransferSingle: <string>(
    web3.utils.sha3("TransferSingle(address,address,address,uint256,uint256)")
  ),
  TransferBatch: <string>(
    web3.utils.sha3(
      "TransferBatch(address,address,address,uint256[],uint256[])"
    )
  ),
  // **** NEED TO IMPLEMENT **** //
  URI: <string>web3.utils.sha3("URI(string,uint256)"),
};
