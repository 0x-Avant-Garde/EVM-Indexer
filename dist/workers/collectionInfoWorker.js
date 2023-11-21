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
const workers_1 = require("../utils/workers");
const web3_1 = require("../utils/web3");
const ERC721ABI_1 = require("../constants/abi/ERC721ABI");
const ERC1155ABI_1 = require("../constants/abi/ERC1155ABI");
const supabase_1 = require("../utils/supabase");
workers_1.workers.collectionQueue.process(10, (job, done) => __awaiter(void 0, void 0, void 0, function* () {
    const { contract_type, contract_address } = job.data;
    let name = "";
    let symbol = "";
    let owner = "";
    if (contract_type == "721") {
        const Contract = new web3_1.web3.eth.Contract(ERC721ABI_1.ERC721ABI, contract_address);
        try {
            name = yield Contract.methods.name().call();
            symbol = yield Contract.methods.symbol().call();
        }
        catch (e) {
            return done();
        }
        try {
            owner = yield Contract.methods.owner().call();
        }
        catch (e) {
            const { data, error } = yield supabase_1.supabase.rpc("update_collection", {
                payload_contract_address: contract_address,
                payload_name: name,
                payload_symbol: symbol,
                payload_owner: null,
            });
            return done();
        }
    }
    else if (contract_type == "1155") {
        const Contract = new web3_1.web3.eth.Contract(ERC1155ABI_1.ERC1155ABI, contract_address);
        try {
            owner = yield Contract.methods.owner().call();
        }
        catch (e) {
            return done();
        }
    }
    const { data, error } = yield supabase_1.supabase.rpc("update_collection", {
        payload_contract_address: contract_address,
        payload_name: name,
        payload_symbol: symbol,
        payload_owner: owner,
    });
    return done();
}));
