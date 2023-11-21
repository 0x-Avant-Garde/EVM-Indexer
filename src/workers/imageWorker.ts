import { workers } from "../utils/workers";
import axios from "axios";
import sharp from "sharp";
import { supabase } from "../utils/supabase";

workers.imageQueue.process(10, async (job: any, done: any) => {
  const { image_url, contract_address, token_id } = <ImageJob>job.data;

  let format: any = "unknown";

  if (image_url.endsWith("jpg")) {
    const { data, error } = await supabase.rpc("update_image_format", {
      payload_token: contract_address + "-" + token_id,
      payload_format: "jpg",
    });

    return done();
  } else if (image_url.endsWith("jpeg")) {
    const { data, error } = await supabase.rpc("update_image_format", {
      payload_token: contract_address + "-" + token_id,
      payload_format: "jpeg",
    });

    return done();
  } else if (image_url.endsWith("png")) {
    const { data, error } = await supabase.rpc("update_image_format", {
      payload_token: contract_address + "-" + token_id,
      payload_format: "png",
    });

    return done();
  } else if (image_url.endsWith("gif")) {
    const { data, error } = await supabase.rpc("update_image_format", {
      payload_token: contract_address + "-" + token_id,
      payload_format: "gif",
    });

    return done();
  } else if (image_url.endsWith("webp")) {
    const { data, error } = await supabase.rpc("update_image_format", {
      payload_token: contract_address + "-" + token_id,
      payload_format: "webp",
    });

    return done();
  } else if (image_url.endsWith("avif")) {
    const { data, error } = await supabase.rpc("update_image_format", {
      payload_token: contract_address + "-" + token_id,
      payload_format: "avif",
    });

    return done();
  } else if (image_url.endsWith("mp4")) {
    const { data, error } = await supabase.rpc("update_image_format", {
      payload_token: contract_address + "-" + token_id,
      payload_format: "video",
    });

    return done();
  } else if (image_url.endsWith("mov")) {
    const { data, error } = await supabase.rpc("update_image_format", {
      payload_token: contract_address + "-" + token_id,
      payload_format: "video",
    });

    return done();
  }

  if (!image_url.startsWith("ipfs") && !image_url.startsWith("data")) {
    try {
      const res = await axios.get(image_url, {
        responseType: "arraybuffer",
        signal: AbortSignal.timeout(1000),
      });

      const metadata = await sharp(res.data).metadata();
      format = metadata.format;
    } catch (e) {
      const { data, error } = await supabase.rpc("update_image_format", {
        payload_token: contract_address + "-" + token_id,
        payload_format: "unknown",
      });

      return done();
    }
  } else if (image_url.startsWith("ipfs")) {
    try {
      const gateway = "http://127.0.0.1:8080/ipfs/";
      const appended = image_url.slice(7);
      const res = await axios.get(gateway + appended, {
        signal: AbortSignal.timeout(1000),
      });

      const metadata = await sharp(res.data).metadata();
      format = metadata.format;
    } catch (e) {
      const { data, error } = await supabase.rpc("update_image_format", {
        payload_token: contract_address + "-" + token_id,
        payload_format: "unknown",
      });

      return done();
    }
  } else if (image_url.startsWith("data")) {
    console.log(image_url);
    format = "svg";
  }

  const { data, error } = await supabase.rpc("update_image_format", {
    payload_contract_address: contract_address,
    payload_token_id: token_id,
    payload_format: format,
  });
  return done();
});
