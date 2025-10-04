import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { app } from "../src/index";
import dotenv from "dotenv";
import { Database } from "../src/types/supabase";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerToken = process.env.SUPABASE_BEARER_TOKEN;

type Event = Database["public"]["Tables"]["events"]["Row"];

describe("Events routes", () => {
  let creatorId: string;
  let supabase: SupabaseClient<Database>;
  const authHeader = { Authorization: `Bearer ${bearerToken}` };

  // helper 
  const makeRequest = (
    method: "post" | "get" | "patch" | "delete",
    url: string,
    body?: object
  ) => {
    let req = request(app)[method](url)
      .set("Authorization", `Bearer ${bearerToken}`)
      .set("Content-Type", "application/json");

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
    creatorId = user.id;
  });

  afterEach(async () => {
    await supabase
      .from("events")
      .delete()
      .eq("creator_id", creatorId);
  });

  describe("POST /api/events", () => {
    it("should create event successfully", async () => {
      const resNewEvent = await makeRequest("post", `/api/events`, {
        title: "Football event",
        description: "we need 10 people",
        event_date: new Date().toISOString(),
      });

      expect(resNewEvent.status).toBe(201);

      const event: Event = resNewEvent.body;
      expect(event).toHaveProperty("id");
      expect(event.title).toBe("Football event");
      expect(event.description).toBe("we need 10 people");
      expect(event.creator_id).toBe(creatorId);
    });
  });
});
