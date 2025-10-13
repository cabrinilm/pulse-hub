"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseUserClient = getSupabaseUserClient;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
    throw new Error('SUPABASE_URL must be defined in .env');
}
function getSupabaseUserClient(token) {
    if (!token) {
        throw new Error('User token is required to create a Supabase user client');
    }
    return (0, supabase_js_1.createClient)(supabaseUrl, token);
}
