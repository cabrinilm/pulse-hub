import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { app } from "../src/index";
import dotenv from "dotenv";
import { Database } from "../src/types/supabase";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerToken = process.env.SUPABASE_BEARER_TOKEN; 

describe("Events routes", () => {
  let supabase: SupabaseClient<Database>;
  let userId: string;
  const testTitlePrefix = "test_event_"; 

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
    if (!bearerToken) throw new Error("Missing SUPABASE_BEARER_TOKEN");

    supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      global: { headers: authHeader },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Test user not found");
    userId = user.id;

    
    await supabase.from("events").delete().like("title", `${testTitlePrefix}%`);
  });

  afterEach(async () => {
    if (!userId) return;
  
    await supabase.from("events").delete().eq("creator_id", userId).like("title", `${testTitlePrefix}%`);
  });

  describe("CREATE Event", () => {
    it("should create a public event for the authenticated user", async () => {
      const body = {
        title: `${testTitlePrefix}Public Event`,
        description: "Test description",
        event_date: new Date().toISOString(), 
        is_public: true,
        price: 10.5, 
        location: "Test location",
      };

      const res = await makeRequest("post", "/api/events", body);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("title", body.title);
      expect(res.body).toHaveProperty("creator_id", userId);
      expect(res.body).toHaveProperty("is_public", true);
    });
  });

});