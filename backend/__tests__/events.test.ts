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

  // Helper
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
    it("should create event successfully without community", async () => {
      const eventData = {
        creator_id: creatorId, 
        community_id: null, 
        title: "Allowed Event",
        description: "User created event without community",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), 
        is_public: true,
        price: 0,
        location: "Online",
      };

      const resNewEvent = await makeRequest("post", "/api/events", eventData);

      console.log("Response body:", resNewEvent.body);
      expect(resNewEvent.status).toBe(201);

      const event: Event = resNewEvent.body;
      expect(event).toHaveProperty("id");
      expect(event.title).toBe("Allowed Event");
      expect(event.description).toBe("User created event without community");
      expect(event.creator_id).toBe(creatorId);
      expect(event.community_id).toBeNull();
      expect(event.is_public).toBe(true);
      expect(event.price).toBe(0);
      expect(event.location).toBe("Online");
    });

    it("should fail to create event for community where user is not a member", async () => {
      const eventData = {
        creator_id: creatorId,
        community_id: "7622bf78-748b-49c4-9c29-a619cecc72e6", 
        title: "Unauthorized Event",
        description: "User is not a member of this community",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };

      const resNewEvent = await makeRequest("post", "/api/events", eventData);
       console.log(resNewEvent.body)
      console.log("Response body:", resNewEvent.body);
      expect(resNewEvent.status).toBe(403); 
      expect(resNewEvent.body).toHaveProperty("error");
      expect(resNewEvent.body.error).toMatch("Forbidden: user is not a member of the specified community");
    });
  });
});