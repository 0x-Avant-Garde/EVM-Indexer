import { producers } from "../utils/producers";
import { workers } from "../utils/workers";
import { supabase } from "../utils/supabase";
import { redis } from "../utils/redis";

workers.primaryQueue.process(10, async (job: any, done: any) => {
  const {
    action,
    transaction_hash,
    transaction_index,
    block_number,
    log_index,
    owner,
    approval_block_number,
    approval_log_index,
    approved_to,
    approved,
    contract_type,
    contract_address,
    wallet_address_from,
    wallet_address_to,
    amount,
    token_id,
    uri_block_number,
    uri_log_index,
    new_value,
  } = job.data;

  if (
    action !== "Approval" &&
    action !== "ApprovalForAll" &&
    action !== "URIChange"
  ) {
    const { data, error } = await supabase.rpc("upsert", {
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
      console.log(
        `Error in TX ${transaction_hash} with ${contract_address} for ${token_id}`,
        error
      );

    const collectionSeen = await redis.get(`collection:${contract_address}`);

    if (collectionSeen !== "true") {
      const collectionJob = producers.collectionQueue.createJob({
        contract_type,
        contract_address,
      });
      collectionJob.retries(0).save();
      await redis.set(`collection:${contract_address}`, "true");
    }

    const metadataSeen = await redis.get(
      `metadata:${contract_address}-${token_id}`
    );
    if (metadataSeen !== "true") {
      const metadataJob = producers.metadataQueue.createJob({
        contract_type,
        contract_address,
        token_id,
      });
      metadataJob.retries(0).save();
      await redis.set(`metadata:${contract_address}-${token_id}`, "true");
    }

    return done();
  } else if (action == "Approval") {
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
    const { data, error } = await supabase.rpc("update_approval", {
      payload_approval_block_number: approval_block_number,
      payload_approval_log_index: approval_log_index,
      payload_contract_address: contract_address,
      payload_token_id: token_id,
      payload_wallet_address: owner,
      payload_approved_to: approved_to,
      payload_approved: approved,
    });
    console.log("APPROVAL RESPONSE", data);
    if (error) console.log("Approval", error);
    return done();
  } else if (action == "ApprovalForAll") {
    const { data, error } = await supabase.rpc("update_approval_for_all", {
      payload_approval_block_number: approval_block_number,
      payload_approval_log_index: approval_log_index,
      payload_contract_address: contract_address,
      payload_wallet_address: owner,
      payload_approved_to: approved_to,
      payload_approved: approved,
    });
    if (error) console.log("AFA", error);
    return done();
  } else if (action == "URIChange") {
    const { data, error } = await supabase.rpc("update_uri", {
      payload_uri_block_number: uri_block_number,
      payload_uri_log_index: uri_log_index,
      payload_contract_addres: contract_address,
      payload_token_id: token_id,
      payload_new_value: new_value,
    });
    if (error) console.log(error);
    return done();
  }
});
