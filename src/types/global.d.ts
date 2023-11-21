export {};

declare global {
  type MetadataJob = {
    contract_type: string;
    contract_address: string;
    token_id: number;
  };

  type ImageJob = {
    image_url: string;
    contract_address: string;
    token_id: number;
  };

  type ERC721Job = {
    action: string;
    transaction_hash: string;
    transaction_index: string;
    block_number: string;
    log_index: string;
    contract_type: string;
    contract_address: string;
    wallet_address_from: string;
    wallet_address_to: string;
    amount: number;
    token_id: string;
  };

  type ERC1155Job = {
    action: string;
    transaction_hash: string;
    transaction_index: string;
    block_number: string;
    log_index: string;
    contract_type: string;
    contract_address: string;
    wallet_address_from: string;
    wallet_address_to: string;
    amount: number;
    token_id: string;
  };

  type ApprovalJob = {
    action: string;
    approval_block_number: number;
    approval_log_index: number;
    contract_address: string;
    owner: string;
    token_id: string;
    approved_to: string;
    approved: boolean;
  };

  type ApprovalForAllJob = {
    action: string;
    approval_block_number: number;
    approval_log_index: number;
    contract_address: string;
    owner: string;
    approved_to: string;
    approved: boolean;
  };

  type URIJob = {
    action: string;
    uri_block_number: number;
    uri_log_index: number;
    contract_address: string;
    token_id: string;
    new_value: string;
  };
}
