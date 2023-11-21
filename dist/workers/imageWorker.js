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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const workers_1 = require("../utils/workers");
const axios_1 = __importDefault(require("axios"));
const sharp_1 = __importDefault(require("sharp"));
const supabase_1 = require("../utils/supabase");
workers_1.workers.imageQueue.process(10, (job, done) => __awaiter(void 0, void 0, void 0, function* () {
    const { image_url, contract_address, token_id } = job.data;
    let format = "unknown";
    if (image_url.endsWith("jpg")) {
        const { data, error } = yield supabase_1.supabase.rpc("update_image_format", {
            payload_token: contract_address + "-" + token_id,
            payload_format: "jpg",
        });
        return done();
    }
    else if (image_url.endsWith("jpeg")) {
        const { data, error } = yield supabase_1.supabase.rpc("update_image_format", {
            payload_token: contract_address + "-" + token_id,
            payload_format: "jpeg",
        });
        return done();
    }
    else if (image_url.endsWith("png")) {
        const { data, error } = yield supabase_1.supabase.rpc("update_image_format", {
            payload_token: contract_address + "-" + token_id,
            payload_format: "png",
        });
        return done();
    }
    else if (image_url.endsWith("gif")) {
        const { data, error } = yield supabase_1.supabase.rpc("update_image_format", {
            payload_token: contract_address + "-" + token_id,
            payload_format: "gif",
        });
        return done();
    }
    else if (image_url.endsWith("webp")) {
        const { data, error } = yield supabase_1.supabase.rpc("update_image_format", {
            payload_token: contract_address + "-" + token_id,
            payload_format: "webp",
        });
        return done();
    }
    else if (image_url.endsWith("avif")) {
        const { data, error } = yield supabase_1.supabase.rpc("update_image_format", {
            payload_token: contract_address + "-" + token_id,
            payload_format: "avif",
        });
        return done();
    }
    else if (image_url.endsWith("mp4")) {
        const { data, error } = yield supabase_1.supabase.rpc("update_image_format", {
            payload_token: contract_address + "-" + token_id,
            payload_format: "video",
        });
        return done();
    }
    else if (image_url.endsWith("mov")) {
        const { data, error } = yield supabase_1.supabase.rpc("update_image_format", {
            payload_token: contract_address + "-" + token_id,
            payload_format: "video",
        });
        return done();
    }
    if (!image_url.startsWith("ipfs") && !image_url.startsWith("data")) {
        try {
            const res = yield axios_1.default.get(image_url, {
                responseType: "arraybuffer",
                signal: AbortSignal.timeout(1000),
            });
            const metadata = yield (0, sharp_1.default)(res.data).metadata();
            format = metadata.format;
        }
        catch (e) {
            const { data, error } = yield supabase_1.supabase.rpc("update_image_format", {
                payload_token: contract_address + "-" + token_id,
                payload_format: "unknown",
            });
            return done();
        }
    }
    else if (image_url.startsWith("ipfs")) {
        try {
            const gateway = "http://127.0.0.1:8080/ipfs/";
            const appended = image_url.slice(7);
            const res = yield axios_1.default.get(gateway + appended, {
                signal: AbortSignal.timeout(1000),
            });
            const metadata = yield (0, sharp_1.default)(res.data).metadata();
            format = metadata.format;
        }
        catch (e) {
            const { data, error } = yield supabase_1.supabase.rpc("update_image_format", {
                payload_token: contract_address + "-" + token_id,
                payload_format: "unknown",
            });
            return done();
        }
    }
    else if (image_url.startsWith("data")) {
        console.log(image_url);
        format = "svg";
    }
    const { data, error } = yield supabase_1.supabase.rpc("update_image_format", {
        payload_contract_address: contract_address,
        payload_token_id: token_id,
        payload_format: format,
    });
    return done();
}));
