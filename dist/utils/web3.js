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
exports.ABIHash = exports.web3Ws = exports.web3 = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const web3_1 = __importDefault(require("web3"));
exports.web3 = new web3_1.default(process.env.RPC_ENDPOINT);
exports.web3Ws = new web3_1.default(new web3_1.default.providers.WebsocketProvider(process.env.RPC_WS_ENDPOINT, {
    clientConfig: {
        maxReceivedFrameSize: 7000000000000,
        maxReceivedMessageSize: 7000000000000,
        keepalive: true,
        keepaliveInterval: 60000, // ms
    },
    reconnect: {
        auto: true,
        delay: 5000,
        maxAttempts: 5,
        onTimeout: true,
    },
}));
exports.ABIHash = {
    // ** 721 Functions ** //
    Transfer: exports.web3.utils.sha3("Transfer(address,address,uint256)"),
    PunkTransfer: (exports.web3.utils.sha3("PunkTransfer(address,address,uint256)")),
    // **** NEED TO IMPLEMENT **** //
    Approval: exports.web3.utils.sha3("Approval(address,address,uint256)"),
    // **** NEED TO IMPLEMENT **** //
    ApprovalForAll: (exports.web3.utils.sha3("ApprovalForAll(address,address,bool)")),
    // ** 1155 Functions **/
    TransferSingle: (exports.web3.utils.sha3("TransferSingle(address,address,address,uint256,uint256)")),
    TransferBatch: (exports.web3.utils.sha3("TransferBatch(address,address,address,uint256[],uint256[])")),
    // **** NEED TO IMPLEMENT **** //
    URI: exports.web3.utils.sha3("URI(string,uint256)"),
};
