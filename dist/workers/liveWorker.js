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
const producers_1 = require("../utils/producers");
const workers_1 = require("../utils/workers");
const supabase_1 = require("../utils/supabase");
const redis_1 = require("../utils/redis");
workers_1.workers.liveQueue.process(10, (job, done) => __awaiter(void 0, void 0, void 0, function* () {
    const { action, transaction_hash, transaction_index, block_number, log_index, owner, approval_block_number, approval_log_index, approved_to, approved, contract_type, contract_address, wallet_address_from, wallet_address_to, amount, token_id, uri_block_number, uri_log_index, new_value, } = job.data;
    if (action !== "Approval" &&
        action !== "ApprovalForAll" &&
        action !== "URIChange") {
        const { data, error } = yield supabase_1.supabase.rpc("upsert", {
            payload_action: action,
            payload_transaction_hash: transaction_hash,
            payload_transaction_index: transaction_index,
            payload_block_number: block_number,
            payload_log_index: log_index,
            payload_contract_type: contract_type,
            payload_contract_address: contract_address,
            payload_wallet_address_from: wallet_address_from,
            payload_wallet_address_to: wallet_address_to,
            payload_amount: amount,
            payload_token_id: token_id,
        });
        if (error)
            console.log(error);
        const collectionSeen = yield redis_1.redis.get(`collection:${contract_address}`);
        if (collectionSeen !== "true") {
            const collectionJob = producers_1.producers.collectionQueue.createJob({
                contract_type,
                contract_address,
            });
            collectionJob.retries(0).save();
            yield redis_1.redis.set(`collection:${contract_address}`, "true");
        }
        const metadataSeen = yield redis_1.redis.get(`metadata:${contract_address}-${token_id}`);
        if (metadataSeen !== "true") {
            const metadataJob = producers_1.producers.metadataQueue.createJob({
                contract_type,
                contract_address,
                token_id,
            });
            metadataJob.retries(0).save();
            yield redis_1.redis.set(`metadata:${contract_address}-${token_id}`, "true");
        }
        return done();
    }
    else if (action == "Approval") {
        console.log("PRIMARY WORKER APPROVAL:", approval_block_number);
        if (approved_to !== "0x0000000000000000000000000000000000000000") {
            console.log("P2P Approval: ", {
                payload_approval_block_number: approval_block_number,
                payload_approval_log_index: approval_log_index,
                payload_contract_address: contract_address,
                payload_token_id: token_id,
                payload_wallet_address: owner,
                payload_approved_to: approved_to,
                payload_approved: approved,
            });
        }
        const { data, error } = yield supabase_1.supabase.rpc("update_approval", {
            payload_approval_block_number: approval_block_number,
            payload_approval_log_index: approval_log_index,
            payload_contract_address: contract_address,
            payload_token_id: token_id,
            payload_wallet_address: owner,
            payload_approved_to: approved_to,
            payload_approved: approved,
        });
        if (error)
            console.log("Approval", error);
        return done();
    }
    else if (action == "URIChange") {
        const { data, error } = yield supabase_1.supabase.rpc("update_uri", {
            payload_uri_block_number: uri_block_number,
            payload_uri_log_index: uri_log_index,
            payload_contract_addres: contract_address,
            payload_token_id: token_id,
            payload_new_value: new_value,
        });
        if (error)
            console.log(error);
        return done();
    }
}));
/* 5|liveWorker  |   details: 'Searched for the function public.upsert with parameters payload_action,
payload_amount,
payload_block_number,
 payload_contract_address,
 payload_contract_type,
 payload_log_index,
 payload_token_id,
 payload_transaction_hash,
 payload_transaction_index,
 payload_wallet_address_from,
 payload_wallet_address_to or with a single unnamed json/jsonb parameter, but no matches were found in the schema cache.',
5|liveWorker  |   hint: 'Perhaps you meant to call the function public.upsert(
  payload_action,
  payload_amount,
  payload_block_number,
  payload_contract_address,
  payload_contract_type,
  payload_log_index,
  payload_token_id,
  payload_transaction_hash,
  payload_transaction_id,
  payload_transaction_index,
  payload_wallet_address_from,
  payload_wallet_address_to)', */
