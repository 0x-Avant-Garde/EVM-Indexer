"use strict";
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
exports.processEvent = void 0;
const web3_1 = require("../utils/web3");
const producers_1 = require("../utils/producers");
function processEvent({ event, action, argCount, live, }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (argCount == 4) {
                if (action == "Transfer") {
                    const transaction = web3_1.web3.eth.abi.decodeLog([
                        {
                            type: "address",
                            name: "from",
                            indexed: true,
                        },
                        {
                            type: "address",
                            name: "to",
                            indexed: true,
                        },
                        {
                            type: "uint256",
                            name: "tokenId",
                            indexed: true,
                        },
                    ], event.data, [event.topics[1], event.topics[2], event.topics[3]]);
                    const tx_payload = {
                        action: action,
                        transaction_hash: event.transactionHash,
                        transaction_index: event.transactionIndex,
                        block_number: event.blockNumber,
                        log_index: event.logIndex,
                        contract_type: "721",
                        contract_address: event.address,
                        wallet_address_from: transaction.from,
                        wallet_address_to: transaction.to,
                        amount: 1,
                        token_id: transaction.tokenId,
                    };
                    // *** Add to Primary Queue *** //
                    if (live) {
                        const job = producers_1.producers.liveQueue.createJob(tx_payload);
                        job.save();
                    }
                    else {
                        const job = producers_1.producers.primaryQueue.createJob(tx_payload);
                        job.save();
                    }
                    return;
                }
                else if (action == "TransferSingle") {
                    /* 1155 Single Transfer */
                    const transaction = web3_1.web3.eth.abi.decodeLog([
                        {
                            type: "address",
                            name: "operator",
                            indexed: true,
                        },
                        {
                            type: "address",
                            name: "from",
                            indexed: true,
                        },
                        {
                            type: "address",
                            name: "to",
                            indexed: true,
                        },
                        {
                            type: "uint256",
                            name: "id",
                        },
                        {
                            type: "uint256",
                            name: "value",
                        },
                    ], event.data, [event.topics[1], event.topics[2], event.topics[3]]);
                    const tx_payload = {
                        action: action,
                        transaction_hash: event.transactionHash,
                        transaction_index: event.transactionIndex,
                        block_number: event.blockNumber,
                        log_index: event.logIndex,
                        contract_type: "1155",
                        contract_address: event.address,
                        wallet_address_from: transaction.from,
                        wallet_address_to: transaction.to,
                        amount: Number(transaction.value),
                        token_id: transaction.id,
                    };
                    if (live) {
                        const job = producers_1.producers.liveQueue.createJob(tx_payload);
                        job.save();
                    }
                    else {
                        const job = producers_1.producers.primaryQueue.createJob(tx_payload);
                        job.save();
                    }
                    return;
                }
                else if (action == "TransferBatch") {
                    /* Transfer Batch */
                    const transaction = web3_1.web3.eth.abi.decodeLog([
                        {
                            indexed: true,
                            internalType: "address",
                            name: "operator",
                            type: "address",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "from",
                            type: "address",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "to",
                            type: "address",
                        },
                        {
                            indexed: false,
                            internalType: "uint256[]",
                            name: "ids",
                            type: "uint256[]",
                        },
                        {
                            indexed: false,
                            internalType: "uint256[]",
                            name: "values",
                            type: "uint256[]",
                        },
                    ], event.data, [event.topics[1], event.topics[2], event.topics[3]]);
                    let i = 0;
                    while (i < transaction.ids.length) {
                        const tx_payload = {
                            action: action,
                            transaction_hash: event.transactionHash,
                            transaction_index: event.transactionIndex,
                            block_number: event.blockNumber,
                            log_index: event.logIndex,
                            contract_type: "1155",
                            contract_address: event.address,
                            wallet_address_from: transaction.from,
                            wallet_address_to: transaction.to,
                            amount: Number(transaction.values[i]),
                            token_id: transaction.ids[i],
                        };
                        if (live) {
                            const job = producers_1.producers.liveQueue.createJob(tx_payload);
                            job.save();
                        }
                        else {
                            const job = producers_1.producers.primaryQueue.createJob(tx_payload);
                            job.save();
                        }
                        i++;
                    }
                    return;
                }
                else if (action == "Approval") {
                    const transaction = web3_1.web3.eth.abi.decodeLog([
                        {
                            type: "address",
                            name: "owner",
                            indexed: true,
                        },
                        {
                            type: "address",
                            name: "approved",
                            indexed: true,
                        },
                        {
                            type: "uint256",
                            name: "tokenId",
                            indexed: true,
                        },
                    ], event.data, [event.topics[1], event.topics[2], event.topics[3]]);
                    const tx_payload = {
                        action: action,
                        approval_block_number: event.blockNumber,
                        approval_log_index: event.logIndex,
                        contract_address: event.address,
                        token_id: transaction.tokenId,
                        owner: transaction.owner,
                        approved_to: transaction.approved,
                        approved: true,
                    };
                    // console.log("Process Event Approval", live);
                    if (live) {
                        const job = producers_1.producers.liveQueue.createJob(tx_payload);
                        job.save();
                    }
                    else {
                        const job = producers_1.producers.primaryQueue.createJob(tx_payload);
                        job.save();
                    }
                    return;
                }
            }
            else if (argCount == 3) {
                if (action == "PunkTransfer") {
                    const transaction = web3_1.web3.eth.abi.decodeLog([
                        {
                            type: "address",
                            name: "from",
                            indexed: true,
                        },
                        {
                            type: "address",
                            name: "to",
                            indexed: true,
                        },
                        {
                            type: "uint256",
                            name: "punkIndex",
                            indexed: false,
                        },
                    ], event.data, [event.topics[1], event.topics[2], event.topics[3]]);
                    const tx_payload = {
                        action: action,
                        transaction_hash: event.transactionHash,
                        transaction_index: event.transactionIndex,
                        block_number: event.blockNumber,
                        log_index: event.logIndex,
                        contract_type: "721",
                        contract_address: event.address,
                        wallet_address_from: transaction.from,
                        wallet_address_to: transaction.to,
                        amount: 1,
                        token_id: transaction.punkIndex,
                    };
                    if (live) {
                        const job = producers_1.producers.liveQueue.createJob(tx_payload);
                        job.save();
                    }
                    else {
                        const job = producers_1.producers.primaryQueue.createJob(tx_payload);
                        job.save();
                    }
                    return;
                }
                else if (action == "ApprovalForAll") {
                    const transaction = web3_1.web3.eth.abi.decodeLog([
                        {
                            type: "address",
                            name: "owner",
                            indexed: true,
                        },
                        {
                            type: "address",
                            name: "operator",
                            indexed: true,
                        },
                        {
                            type: "bool",
                            name: "approved",
                            indexed: false,
                        },
                    ], event.data, [event.topics[1], event.topics[2], event.topics[3]]);
                    const tx_payload = {
                        action: action,
                        approval_block_number: event.blockNumber,
                        approval_log_index: event.logIndex,
                        contract_address: event.address,
                        owner: transaction.owner,
                        approved_to: transaction.operator,
                        approved: Boolean(transaction.approved),
                    };
                    if (live) {
                        const job = producers_1.producers.liveQueue.createJob(tx_payload);
                        job.save();
                    }
                    else {
                        const job = producers_1.producers.primaryQueue.createJob(tx_payload);
                        job.save();
                    }
                    return;
                }
            }
            else if (action == "UriChange") {
                const transaction = web3_1.web3.eth.abi.decodeLog([
                    {
                        type: "string",
                        name: "value",
                        indexed: false,
                    },
                    {
                        type: "uint256",
                        name: "id",
                        indexed: true,
                    },
                ], event.data, [event.topics[1], event.topics[2], event.topics[3]]);
                const tx_payload = {
                    action: action,
                    uri_block_number: event.blockNumber,
                    uri_log_index: event.logIndex,
                    contract_address: event.address,
                    token_id: transaction.id,
                    new_value: transaction.value,
                };
                if (live) {
                    const job = producers_1.producers.liveQueue.createJob(tx_payload);
                    job.save();
                }
                else {
                    const job = producers_1.producers.primaryQueue.createJob(tx_payload);
                    job.save();
                }
                return;
            }
        }
        catch (e) {
            console.log("HELPER ERROR: ", e);
        }
    });
}
exports.processEvent = processEvent;
