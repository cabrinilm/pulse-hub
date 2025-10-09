import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { app } from "../src/index";
import dotenv from "dotenv";
import { Database } from "../src/types/supabase";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerTokenUser = process.env.SUPABASE_BEARER_TOKEN!;
const bearerTokenCreator = process.env.SUPABASE_BEARER_TOKEN_TEST_CREATOR!;

describe("POST /api/events/:event_id/signups", () => {
  let supabaseCreator: SupabaseClient<Database>;
  let supabaseUser: SupabaseClient<Database>;
  let creatorId: string;
  let userId: string;
  let publicEventId: string;
  let privateEventId: string;

  const makeRequest = (
    method: "post" | "get" | "patch" | "delete",
    url: string,
    body?: object,
    token: string = bearerTokenUser
  ) => {
    let req = request(app)[method](url).set("Content-Type", "application/json");
    if (token) req = req.set("Authorization", `Bearer ${token}`);
    if (body) req = req.send(body);
    return req;
  };

  beforeAll(async () => {
    // Cliente do creator para criar eventos
    supabaseCreator = createClient<Database>(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${bearerTokenCreator}` } },
    });

    // Cliente do user para signup
    const supabaseUserClient = createClient<Database>(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${bearerTokenUser}` } },
    });

    // Pegar IDs dos usuários
    const { data: creatorData } = await supabaseCreator.auth.getUser();
    if (!creatorData.user) throw new Error("Creator user not found");
    creatorId = creatorData.user.id;

    const { data: userData } = await supabaseUserClient.auth.getUser();
    if (!userData.user) throw new Error("Test user not found");
    userId = userData.user.id;

    // Criar eventos
    const { data: publicData } = await supabaseCreator
      .from("events")
      .insert({
        title: "Test Public Event",
        event_date: new Date().toISOString(),
        is_public: true,
        creator_id: creatorId,
      })
      .select("id")
      .single();
    if (!publicData) throw new Error("Failed to create public event");
    publicEventId = publicData.id;

    const { data: privateData } = await supabaseCreator
      .from("events")
      .insert({
        title: "Test Private Event",
        event_date: new Date().toISOString(),
        is_public: false,
        creator_id: creatorId,
      })
      .select("id")
      .single();
    if (!privateData) throw new Error("Failed to create private event");
    privateEventId = privateData.id;

    // Limpar signups do usuário de teste
    await supabaseUserClient.from("signups").delete().eq("user_id", userId);
  });

  afterEach(async () => {
    // Limpar signups do usuário após cada teste
    const supabaseUserClient = createClient<Database>(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${bearerTokenUser}` } },
    });
    await supabaseUserClient.from("signups").delete().eq("user_id", userId);
  });

  it("should create a signup for a public event", async () => {

    const openEvent = "b597ad60-1936-4061-b8ef-f71b8486bd07";
    const res = await makeRequest("post", `/api/events/${openEvent}/signups`, {
      presence_status: "pending",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user_id", userId);
    expect(res.body).toHaveProperty("event_id", openEvent);
    expect(res.body).toHaveProperty("payment_status", "pending");
    expect(res.body).toHaveProperty("presence_status", "pending");
  });

  it("should fail to create signup for a private event if user is not added by creator", async () => {
    const res = await makeRequest("post", `/api/events/${privateEventId}/signups`, {
      presence_status: "pending",
    });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it("should fail if user is not authenticated", async () => {
    const res = await makeRequest("post", `/api/events/${publicEventId}/signups`, {
      presence_status: "pending",
    }, ""); // token vazio

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "No token provided");
  });
});
