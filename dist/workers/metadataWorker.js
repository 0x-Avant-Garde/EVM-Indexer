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
const producers_1 = require("../utils/producers");
const web3_1 = require("../utils/web3");
const ERC721ABI_1 = require("../constants/abi/ERC721ABI");
const ERC1155ABI_1 = require("../constants/abi/ERC1155ABI");
const axios_1 = __importDefault(require("axios"));
const supabase_1 = require("../utils/supabase");
const updateAttributes_1 = require("../Supabase-Functions/updateAttributes");
workers_1.workers.metadataQueue.process(10, (job, done) => __awaiter(void 0, void 0, void 0, function* () {
    const { contract_type, contract_address, token_id } = job.data;
    let URI = null;
    let metadata;
    function complete() {
        return __awaiter(this, void 0, void 0, function* () {
            if (metadata === null || metadata === void 0 ? void 0 : metadata.attributes) {
                yield (0, updateAttributes_1.update_collection_attributes)({
                    contract_address,
                    token_id,
                    metadata,
                    update: false,
                });
            }
            const { data, error } = yield supabase_1.supabase.rpc("update_metadata", {
                payload_contract_address: contract_address,
                payload_token_id: token_id,
                payload_uri: URI ? URI : "",
                payload_metadata: metadata ? metadata : "",
                payload_image_url: metadata.image ? metadata.image : "",
            });
            if (error)
                console.log(error);
            const image_info = {
                image_url: metadata === null || metadata === void 0 ? void 0 : metadata.image,
                contract_address: contract_address,
                token_id: token_id,
            };
            if (metadata &&
                metadata.image !== "undefined" &&
                metadata.image !== undefined) {
                const imageJob = producers_1.producers.imageQueue.createJob(image_info);
                imageJob.save();
            }
            return done();
        });
    }
    if (contract_type == "721") {
        const Contract = new web3_1.web3.eth.Contract(ERC721ABI_1.ERC721ABI, contract_address);
        try {
            URI = yield Contract.methods.tokenURI(token_id).call();
            if (!URI) {
                return done();
            }
        }
        catch (e) {
            return done();
        }
        if (!URI.startsWith("ipfs") && !URI.startsWith("data")) {
            try {
                const res = yield axios_1.default.get(URI, {
                    signal: AbortSignal.timeout(1000),
                });
                metadata = res.data;
            }
            catch (e) {
                yield complete();
            }
        }
        else if (URI.startsWith("ipfs")) {
            const gateway = "http://127.0.0.1:8080/ipfs/";
            const appended = URI.slice(7);
            const url = gateway + appended;
            try {
                const res = yield axios_1.default.get(url, {
                    signal: AbortSignal.timeout(1000),
                });
                metadata = res.data;
            }
            catch (e) {
                yield complete();
            }
        }
        else if (URI.startsWith("data")) {
            try {
                metadata = JSON.parse(atob(URI.replace(/^data:\w+\/\w+;base64,/, "")));
            }
            catch (e) {
                yield complete();
            }
            yield complete();
        }
    }
    else if (contract_type == "1155") {
        var Contract = new web3_1.web3.eth.Contract(ERC1155ABI_1.ERC1155ABI, contract_address);
        try {
            URI = yield Contract.methods.uri(token_id).call();
            if (!URI) {
                return done();
            }
        }
        catch (e) {
            return done();
        }
        if (URI.endsWith("{id}")) {
            URI = URI.substr(0, URI.length - 4) + token_id;
        }
        if (!URI.startsWith("ipfs") && !URI.startsWith("data")) {
            try {
                const res = yield axios_1.default.get(URI, {
                    signal: AbortSignal.timeout(1000),
                });
                metadata = res.data;
            }
            catch (e) {
                yield complete();
            }
        }
        else if (URI.startsWith("ipfs")) {
            const gateway = "http://127.0.0.1:8080/ipfs/";
            const appended = URI.slice(7);
            const url = gateway + appended;
            try {
                const res = yield axios_1.default.get(url, {
                    signal: AbortSignal.timeout(1000),
                });
                metadata = res.data;
            }
            catch (e) {
                yield complete();
            }
        }
        else if (URI.startsWith("data")) {
            try {
                metadata = JSON.parse(atob(URI.replace(/^data:\w+\/\w+;base64,/, "")));
            }
            catch (e) {
                yield complete();
            }
        }
        yield complete();
    }
}));
