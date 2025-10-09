import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { app } from "../src/index";
import dotenv from "dotenv";
import { Database } from "../src/types/supabase";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerToken = process.env.SUPABASE_BEARER_TOKEN; 

describe("Signups routes", () => {
  let supabase: SupabaseClient<Database>;
  let userId: string;
  let publicEventId: string; 
  let privateEventId: string; 

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
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) throw new Error("Test user not found or error: " + (userError?.message || "Unknown"));

    userId = user.id;


    const { data: publicData, error: publicError } = await supabase
      .from("events")
      .insert({
        title: "Test Public Event for Signup",
        event_date: new Date().toISOString(),
        is_public: true,
        creator_id: userId,
      })
      .select("id")
      .single();

    if (publicError || !publicData) throw new Error("Failed to create public event fixture: " + (publicError?.message || "No data returned"));

    publicEventId = publicData.id;

    
    const { data: privateData, error: privateError } = await supabase
      .from("events")
      .insert({
        title: "Test Private Event for Signup",
        event_date: new Date().toISOString(),
        is_public: false,
        creator_id: userId,
      })
      .select("id")
      .single();

    if (privateError || !privateData) throw new Error("Failed to create private event fixture: " + (privateError?.message || "No data returned"));

    privateEventId = privateData.id;


    
    await supabase.from("signups").delete().eq("user_id", userId);
  });

  afterEach(async () => {
  
    await supabase.from("signups").delete().eq("user_id", userId);
  });

  describe("CREATE Signup", () => {
    it("should create a signup for a public event", async () => {
      const body = {
        event_id: publicEventId,
      };

   

      const res = await makeRequest("post", "/api/signups", body);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user_id", userId);
      expect(res.body).toHaveProperty("event_id", publicEventId);
      expect(res.body).toHaveProperty("payment_status", "pending");
      expect(res.body).toHaveProperty("presence_status", "pending");
    });

    it("should fail to create signup if event_id is missing", async () => {
      const res = await makeRequest("post", "/api/signups", {});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Event ID is required");
    });

    it("should fail to create duplicate signup for the same event", async () => {
 
      await makeRequest("post", "/api/signups", { event_id: publicEventId });


      const res = await makeRequest("post", "/api/signups", { event_id: publicEventId });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it("should fail to create signup for a private event if not added by creator", async () => {

      const privateEventDb = "763253e3-ce43-4056-adca-9055a36b92f8"

      const res = await makeRequest("post", "/api/signups", { event_id: privateEventDb });
        console.log(res.body)
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/not authorized/i);
    });

    it("should fail to create signup if user is not authenticated", async () => {
      const body = {
        event_id: publicEventId,
      };

      const res = await makeRequest("post", "/api/signups", body, {});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "No token provided");
    });
  });

  describe("GET Signups", () => {
    beforeEach(async () => {
    
      await makeRequest("post", "/api/signups", { event_id: publicEventId });
    });

    it("should list signups for events the user participates in or created", async () => {
      const res = await makeRequest("get", "/api/signups");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty("event_id", publicEventId);
      expect(res.body[0]).toHaveProperty("user_id", userId);
    });

    it("should not list signups for events the user does not participate in", async () => {
    
      const otherEventId = "763253e3-ce43-4056-adca-9055a36b92f8";

      const res = await makeRequest("get", "/api/signups");

       console.log(res.body)

      expect(res.status).toBe(200);
      expect(res.body.every((s: any) => s.event_id === publicEventId)).toBe(true); 
    });

    it("should fail to list signups if user is not authenticated", async () => {
      const res = await makeRequest("get", "/api/signups", undefined, {});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "No token provided");
    });
  });

  describe.only("UPDATE Signup", () => {
   
     const openEventId = "807b151f-20a2-4620-9aab-5a0af298af26"
         
   
    beforeEach(async () => {
      const resPost =   await makeRequest("post", `/api/signups/${openEventId}`, { event_id: openEventId});
      expect(resPost.status).toBe(200)
      console.log(resPost.status, ",,,,,,")
    });
      
    it("should update presence_status for an event ", async () => {
      const updates = {
        event_id: openEventId,
        presence_status: "confirmed",
      };

      const res = await makeRequest("patch", `/api/signups/${openEventId}`, updates);
     
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("presence_status", "confirmed");
    });

    it("should update payment_status as creator for any signup in own event", async () => {
     
      const otherUserSignupId = "known-other-user-signup-id"; 

      const updates = {
        // event_id: signupEventId,
        payment_status: "completed",
      };

      const res = await makeRequest("patch", `/api/signups/${otherUserSignupId}`, updates);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("payment_status", "completed");
    });

    it("should fail to update if not own signup or not creator", async () => {
      
      const unauthorizedSignupId = "known-unauthorized-signup-id";

      const updates = {
        presence_status: "rejected",
      };

      const res = await makeRequest("patch", `/api/signups/${unauthorizedSignupId}`, updates);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/not authorized/i);
    });

    it("should fail to update with invalid status", async () => {
      const updates = {
        presence_status: "invalid",
      };

      const res = await makeRequest("patch", "/api/signups", updates);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid status/i);
    });

    it("should fail to update if user is not authenticated", async () => {
      const updates = {
        presence_status: "confirmed",
      };

      const res = await makeRequest("patch", "/api/signups", updates, {});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized: No user ID found");
    });
  });

  describe("DELETE Signup", () => {
    let signupEventId: string = publicEventId; // Use o público para fixture

    beforeEach(async () => {
      // Cria fixture de signup para delete
      await makeRequest("post", "/api/signups", { event_id: signupEventId });
    });

    it("should delete user's own signup", async () => {
      const res = await makeRequest("delete", `/api/signups/${signupEventId}`); 

      expect(res.status).toBe(204);

      // Verifica se deletado (tentativa de get deve falhar)
      const getRes = await makeRequest("get", "/api/signups");
      expect(getRes.body.some((s: any) => s.event_id === signupEventId)).toBe(false);
    });

    it("should delete any signup as creator of the event", async () => {
      // Assuma um signup de outro usuário no evento do criador (substitua por real)
      const otherUserSignupId = "known-other-user-signup-id";

      const res = await makeRequest("delete", `/api/signups/${otherUserSignupId}`);

      expect(res.status).toBe(204);
    });

    it("should fail to delete if not own signup or not creator", async () => {
      // Assuma um signup de outro evento/usuário
      const unauthorizedSignupId = "known-unauthorized-signup-id";

      const res = await makeRequest("delete", `/api/signups/${unauthorizedSignupId}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/not authorized/i);
    });

    it("should return 404 if signup does not exist", async () => {
      const res = await makeRequest("delete", "/api/signups/invalid-id");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Signup not found");
    });

    it("should fail to delete if user is not authenticated", async () => {
      const res = await makeRequest("delete", `/api/signups/${signupEventId}`, undefined, {});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized: No user ID found");
    });
  });
});