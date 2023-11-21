import { workers } from "../utils/workers";
import { web3 } from "../utils/web3";
import { ERC721ABI } from "../constants/abi/ERC721ABI";
import { ERC1155ABI } from "../constants/abi/ERC1155ABI";

import { supabase } from "../utils/supabase";
import { redis } from "../utils/redis";

workers.collectionQueue.process(10, async (job: any, done: any) => {
  const { contract_type, contract_address } = job.data;

  let name = "";
  let symbol = "";
  let owner = "";

  if (contract_type == "721") {
    const Contract = new web3.eth.Contract(ERC721ABI, contract_address);
    try {
      name = await Contract.methods.name().call();

      symbol = await Contract.methods.symbol().call();
    } catch (e) {
      return done();
    }

    try {
      owner = await Contract.methods.owner().call();
    } catch (e) {
      const { data, error } = await supabase.rpc("update_collection", {
        payload_contract_address: contract_address,
        payload_name: name,
        payload_symbol: symbol,
        payload_owner: null,
      });
      return done();
    }
  } else if (contract_type == "1155") {
    const Contract = new web3.eth.Contract(ERC1155ABI, contract_address);
    try {
      owner = await Contract.methods.owner().call();
    } catch (e) {
      return done();
    }
  }
  const { data, error } = await supabase.rpc("update_collection", {
    payload_contract_address: contract_address,
    payload_name: name,
    payload_symbol: symbol,
    payload_owner: owner,
  });

  return done();
});
