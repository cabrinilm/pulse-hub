import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { app } from "../src/index";
import dotenv from "dotenv";
import { Database } from "../src/types/supabase";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerToken = process.env.SUPABASE_BEARER_TOKEN;

describe("Profiles routes", () => {
  let userId: string;
  let supabase: SupabaseClient<Database>;
  const authHeader = { Authorization: `Bearer ${bearerToken}` };

  const makeRequest = (
    method: "post" | "get" | "patch" | "delete",
    url: string,
    body?: object,
    headers: { [key: string]: string } = authHeader
  ) => {
    let req = request(app)[method](url).set("Content-Type", "application/json");
    if (headers) req = req.set(headers);
    if (body) req = req.send(body);
    return req;
  };

  beforeAll(async () => {
    supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      global: { headers: authHeader },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Test user not found");
    userId = user.id;

  
    await supabase.from("profiles").delete().eq("user_id", userId);
  });

  afterEach(async () => {

    await supabase.from("profiles").delete().eq("user_id", userId);
  });

  it("should create a profile for the authenticated user", async () => {
    const body = {
      username: "testuser",
      full_name: "Test User",
      avatar: "https://example.com/avatar.png",
    };

    const res = await makeRequest("post", "/api/profiles", body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user_id", userId);
    expect(res.body).toHaveProperty("username", "testuser");
    expect(res.body).toHaveProperty("full_name", "Test User");
    expect(res.body).toHaveProperty("avatar", "https://example.com/avatar.png");
  });
});