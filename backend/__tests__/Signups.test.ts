import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { app } from "../src/index";
import dotenv from "dotenv";
import { Database } from "../src/types/supabase";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerTokenUser = process.env.SUPABASE_BEARER_TOKEN!;
const bearerTokenCreator = process.env.CREATOR_TEST!;

describe("Signups API", () => {
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
    supabaseCreator = createClient<Database>(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${bearerTokenCreator}` } },
    });

    supabaseUser = createClient<Database>(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${bearerTokenUser}` } },
    });

    const { data: creatorData } = await supabaseCreator.auth.getUser();
    if (!creatorData.user) throw new Error("Creator user not found");
    creatorId = creatorData.user.id;

    const { data: userData } = await supabaseUser.auth.getUser();
    if (!userData.user) throw new Error("Test user not found");
    userId = userData.user.id;

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

    await supabaseUser.from("signups").delete().eq("user_id", userId);
  });

  // afterEach(async () => {
  //   await supabaseUser.from("signups").delete().eq("user_id", userId);
  // });

  // afterAll(async () => {
  //   await supabaseCreator.from("events").delete().in("id", [publicEventId, privateEventId]);
  // });

  // ======================================================
  // POST /api/events/:event_id/signups
  // ======================================================
  describe("POST /api/events/:event_id/signups", () => {
    it("should create a signup for a public event", async () => {
   
      const res = await makeRequest("post", `/api/events/${publicEventId}/signups`, {
        presence_status: "pending",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user_id", userId);
      expect(res.body).toHaveProperty("event_id", publicEventId);
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
      const res = await request(app)
        .post(`/api/events/${publicEventId}/signups`)
        .set("Content-Type", "application/json")
        .send({ presence_status: "pending" });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "No token provided");
    });
  });
  
  // ======================================================
  // GET /api/events/:event_id/signups
  // ======================================================
  describe("GET /api/events/:event_id/signups", () => {
    it("should list signups for a public event (visible to all users)", async () => {
     
        const resPost =   await makeRequest("post", `/api/events/${publicEventId}/signups`, {
        presence_status: "pending",
      });
         
      expect(resPost.status).toBe(201)
   
      const res = await makeRequest("get", `/api/events/${publicEventId}/signups`);
      console.log(res.body)
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({
        signup_count: 1,
        confirmed_count: 0,
        rejected_count: 0,
      }));
    });
    it("should not list signups for a private event if user is not participant or creator", async () => {
      const res = await makeRequest("get", `/api/events/${privateEventId}/signups`);
    
      expect(res.status).toBe(200);
 

    });
  });
  // ======================================================
  // PATCH /api/events/:event_id/signups/:signup_id
  // ======================================================
  describe("PATCH /api/events/:event_id/signups", () => {
    beforeAll(async () => {
      // Crie um signup para testar update
      await makeRequest("post", `/api/events/${publicEventId}/signups`, {
        presence_status: "pending",
      });
    });

    it("should allow a user to update their presence_status", async () => {
      const res = await makeRequest(
        "patch",
        `/api/events/${publicEventId}/signups`, 
        { presence_status: "confirmed" }
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("presence_status", "confirmed");
    });

    it("should not allow another user to update someone else’s signup", async () => {
  
      const res = await makeRequest(
        "patch",
        `/api/events/${publicEventId}/signups`,  
        { presence_status: "confirmed" },
        bearerTokenCreator
      );
      console.log(res.body)
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch("Failed to update signup: Cannot coerce the result to a single JSON object");
    });
  });

  describe.only("DELETE /api/events/:event_id/signups", () => {
    beforeAll(async () => {
      
      await makeRequest("post", `/api/events/${publicEventId}/signups`, {
        presence_status: "pending",
      });
    });

    it("should allow user to delete their own signup", async () => {
      const res = await makeRequest("delete", `/api/events/${publicEventId}/signups`); 

      expect(res.status).toBe(204);
    });

    it("should not allow a different user (creator) to delete another user’s signup", async () => {
      const res = await makeRequest("delete", `/api/events/${publicEventId}/signups`, undefined, bearerTokenCreator);
          console.log(res.body)
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/not authorized/i);
    });
  });
});




