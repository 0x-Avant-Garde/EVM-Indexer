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
workers_1.workers.liveQueue.process(10, (job, done) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Action", job.data.action);
    const { action, transaction_hash, transaction_index, transaction_id, block_number, log_index, owner, approval_block_number, approval_log_index, approved_to, approved, contract_type, contract_address, wallet_address_from, wallet_address_to, amount, token_id, token, owner_token, owner_token_from, owner_token_to, uri_block_number, uri_log_index, new_value, } = job.data;
    if (action !== "Approval" &&
        action !== "ApprovalForAll" &&
        action !== "URIChange") {
        if (contract_type == "721") {
            const { data, error } = yield supabase_1.supabase.rpc("upsert721", {
                payload_action: action,
                payload_transaction_hash: transaction_hash,
                payload_transaction_index: transaction_index,
                payload_transaction_id: transaction_id,
                payload_block_number: block_number,
                payload_log_index: log_index,
                payload_contract_type: contract_type,
                payload_contract_address: contract_address,
                payload_wallet_address_from: wallet_address_from,
                payload_wallet_address_to: wallet_address_to,
                payload_amount: amount,
                payload_token_id: token_id,
                payload_token: token,
                payload_owner_token: owner_token,
            });
            const collectionJob = producers_1.producers.collectionQueue.createJob({
                contract_type,
                contract_address,
            });
            collectionJob.retries(0).save();
            const metadataJob = producers_1.producers.metadataQueue.createJob({
                contract_type,
                contract_address,
                token_id,
            });
            metadataJob.retries(0).save();
            return done();
        }
        else if (contract_type == "1155") {
            const { data, error } = yield supabase_1.supabase.rpc("upsert1155", {
                payload_action: action,
                payload_transaction_hash: transaction_hash,
                payload_transaction_index: transaction_index,
                payload_transaction_id: transaction_id,
                payload_block_number: block_number,
                payload_log_index: log_index,
                payload_contract_type: contract_type,
                payload_contract_address: contract_address,
                payload_wallet_address_from: wallet_address_from,
                payload_wallet_address_to: wallet_address_to,
                payload_amount: amount,
                payload_token_id: token_id,
                payload_token: token,
                payload_owner_token_from: owner_token_from,
                payload_owner_token_to: owner_token_to,
            });
            const collectionJob = producers_1.producers.collectionQueue.createJob({
                contract_type,
                contract_address,
            });
            collectionJob.retries(0).save();
            const metadataJob = producers_1.producers.metadataQueue.createJob({
                contract_type,
                contract_address,
                token_id,
            });
            metadataJob.retries(0).save();
            return done();
        }
    }
    else if (action == "Approval") {
        const { data, error } = yield supabase_1.supabase.rpc("update_approval", {
            payload_approval_block_number: approval_block_number,
            payload_approval_log_index: approval_log_index,
            payload_approved_to: approved_to,
            payload_owner: owner,
            payload_token: token,
        });
        console.log("Approval", error);
        return done();
    }
    else if (action == "ApprovalForAll") {
        if (approved) {
            const { data, error } = yield supabase_1.supabase.rpc("update_approval_for_all", {
                payload_approval_block_number: approval_block_number,
                payload_approval_log_index: approval_log_index,
                payload_approved_to: approved_to,
                payload_contract_address: contract_address,
                payload_owner: owner,
            });
            if (error)
                console.log(error);
            return done();
        }
        else {
            const { data, error } = yield supabase_1.supabase.rpc("update_approval_for_all", {
                payload_approval_block_number: approval_block_number,
                payload_approval_log_index: approval_log_index,
                payload_approved_to: null,
                payload_contract_address: contract_address,
                payload_owner: owner,
            });
            if (error)
                console.log(error);
            return done();
        }
    }
    else if (action == "URIChange") {
        const { data, error } = yield supabase_1.supabase.rpc("update_uri", {
            payload_uri_block_number: uri_block_number,
            payload_uri_log_index: uri_log_index,
            payload_token: token,
            payload_new_value: new_value,
        });
        if (error)
            console.log(error);
        return done();
    }
}));
