import { workers } from "../utils/workers";
import { producers } from "../utils/producers";
import { web3 } from "../utils/web3";
import { ERC721ABI } from "../constants/abi/ERC721ABI";
import { ERC1155ABI } from "../constants/abi/ERC1155ABI";
import axios from "axios";
import { supabase } from "../utils/supabase";
import { update_collection_attributes } from "../Supabase-Functions/updateAttributes";

workers.metadataQueue.process(10, async (job: any, done: any) => {
  const { contract_type, contract_address, token_id } = <MetadataJob>job.data;

  let URI: any = null;
  let metadata: any;

  async function complete() {
    if (metadata?.attributes) {
      await update_collection_attributes({
        contract_address,
        token_id,
        metadata,
        update: false,
      });
    }

    const { data, error } = await supabase.rpc("update_metadata", {
      payload_contract_address: contract_address,
      payload_token_id: token_id,
      payload_uri: URI ? URI : "",
      payload_metadata: metadata ? metadata : "",
      payload_image_url: metadata.image ? metadata.image : "",
    });

    if (error) console.log(error);

    const image_info = <ImageJob>{
      image_url: metadata?.image,
      contract_address: contract_address,
      token_id: token_id,
    };
    if (
      metadata &&
      metadata.image !== "undefined" &&
      metadata.image !== undefined
    ) {
      const imageJob = producers.imageQueue.createJob(image_info);
      imageJob.save();
    }
    return done();
  }

  if (contract_type == "721") {
    const Contract = new web3.eth.Contract(ERC721ABI, contract_address);

    try {
      URI = await Contract.methods.tokenURI(token_id).call();

      if (!URI) {
        return done();
      }
    } catch (e) {
      return done();
    }

    if (!URI.startsWith("ipfs") && !URI.startsWith("data")) {
      try {
        const res = await axios.get(URI, {
          signal: AbortSignal.timeout(1000),
        });
        metadata = res.data;
      } catch (e) {
        await complete();
      }
    } else if (URI.startsWith("ipfs")) {
      const gateway = "http://127.0.0.1:8080/ipfs/";
      const appended = URI.slice(7);
      const url = gateway + appended;

      try {
        const res = await axios.get(url, {
          signal: AbortSignal.timeout(1000),
        });
        metadata = res.data;
      } catch (e) {
        await complete();
      }
    } else if (URI.startsWith("data")) {
      try {
        metadata = JSON.parse(atob(URI.replace(/^data:\w+\/\w+;base64,/, "")));
      } catch (e) {
        await complete();
      }
      await complete();
    }
  } else if (contract_type == "1155") {
    var Contract = new web3.eth.Contract(ERC1155ABI, contract_address);

    try {
      URI = await Contract.methods.uri(token_id).call();

      if (!URI) {
        return done();
      }
    } catch (e) {
      return done();
    }

    if (URI.endsWith("{id}")) {
      URI = URI.substr(0, URI.length - 4) + token_id;
    }

    if (!URI.startsWith("ipfs") && !URI.startsWith("data")) {
      try {
        const res = await axios.get(URI, {
          signal: AbortSignal.timeout(1000),
        });
        metadata = res.data;
      } catch (e) {
        await complete();
      }
    } else if (URI.startsWith("ipfs")) {
      const gateway = "http://127.0.0.1:8080/ipfs/";
      const appended = URI.slice(7);
      const url = gateway + appended;

      try {
        const res = await axios.get(url, {
          signal: AbortSignal.timeout(1000),
        });
        metadata = res.data;
      } catch (e) {
        await complete();
      }
    } else if (URI.startsWith("data")) {
      try {
        metadata = JSON.parse(atob(URI.replace(/^data:\w+\/\w+;base64,/, "")));
      } catch (e) {
        await complete();
      }
    }
    await complete();
  }
});
