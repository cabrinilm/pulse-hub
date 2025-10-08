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

    it("should fail to create an event if title is missing", async () => {
      const body = {
        description: "Test description",
        event_date: new Date().toISOString(),
      };

      const res = await makeRequest("post", "/api/events", body);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Title is required");
    });

    it("should fail to create an event if event_date is missing", async () => {
      const body = {
        title: `${testTitlePrefix}No Date Event`,
        description: "Test description",
      };

      const res = await makeRequest("post", "/api/events", body);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Event date is required");
    });

    it("should fail to create an event if price is negative", async () => {
      const body = {
        title: `${testTitlePrefix}Negative Price Event`,
        event_date: new Date().toISOString(),
        price: -5,
      };

      const res = await makeRequest("post", "/api/events", body);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Price must be >= 0");
    });

    it("should fail to create an event if user is not authenticated", async () => {
      const body = {
        title: `${testTitlePrefix}Unauth Event`,
        event_date: new Date().toISOString(),
      };

      const res = await makeRequest("post", "/api/events", body, {});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "No token provided");
    });

    it("should create a private event with optional fields empty", async () => {
      const body = {
        title: `${testTitlePrefix}Private Minimal Event`,
        event_date: new Date().toISOString(),
        is_public: false,
      };

      const res = await makeRequest("post", "/api/events", body);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("title", body.title);
      expect(res.body).toHaveProperty("is_public", false);
      expect(res.body.description).toBeNull();
      expect(res.body.price).toBeNull();
    });
  });
  describe("GET Events (List)", () => {
    beforeEach(async () => {
     
      await makeRequest("post", "/api/events", {
        title: `${testTitlePrefix}Public List Event`,
        event_date: new Date().toISOString(),
        is_public: true,
      });

      await makeRequest("post", "/api/events", {
        title: `${testTitlePrefix}Private Own Event`,
        event_date: new Date().toISOString(),
        is_public: false,
      });
    });

    it("should list public events and user's own events for authenticated user", async () => {
      const res = await makeRequest("get", "/api/events");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2); 
      expect(res.body.some((e: any) => e.title.includes("Public List Event"))).toBe(true);
      expect(res.body.some((e: any) => e.title.includes("Private Own Event"))).toBe(true);
    });

    it("should not list private events of others", async () => {
    
      const res = await makeRequest("get", "/api/events");

      expect(res.status).toBe(200);
  
      expect(res.body.every((e: any) => e.is_public || e.creator_id === userId)).toBe(true);
    });

    it("should fail to list events if user is not authenticated", async () => {
      const res = await makeRequest("get", "/api/events", undefined, {});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "No token provided");
    });
  });

  describe("GET Event by ID", () => {
    let publicEventId: string;
    let privateOwnEventId: string;

    beforeEach(async () => {

      const publicRes = await makeRequest("post", "/api/events", {
        title: `${testTitlePrefix}Public By ID Event`,
        event_date: new Date().toISOString(),
        is_public: true,
      });
      publicEventId = publicRes.body.id;

      const privateRes = await makeRequest("post", "/api/events", {
        title: `${testTitlePrefix}Private Own By ID Event`,
        event_date: new Date().toISOString(),
        is_public: false,
      });
      privateOwnEventId = privateRes.body.id;
    });

    it("should get a public event by ID for authenticated user", async () => {
      const res = await makeRequest("get", `/api/events/${publicEventId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", publicEventId);
      expect(res.body).toHaveProperty("is_public", true);
    });

    it("should get user's own private event by ID", async () => {
      const res = await makeRequest("get", `/api/events/${privateOwnEventId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", privateOwnEventId);
      expect(res.body).toHaveProperty("is_public", false);
      expect(res.body).toHaveProperty("creator_id", userId);
    });

    it("should fail to get a private event of another user", async () => {
   
      const otherPrivateId = "763253e3-ce43-4056-adca-9055a36b92f8";

      const res = await makeRequest("get", `/api/events/${otherPrivateId}`);
       console.log(res.body)
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Event not found");
    });

    it("should fail to get event if ID does not exist", async () => {
      const res = await makeRequest("get", "/api/events/6a7b40ff-2a0f-4475-a891-2ae41ab059f4");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Event not found");
    });

    it("should fail to get event by ID if user is not authenticated", async () => {
      const res = await makeRequest("get", `/api/events/${publicEventId}`, undefined, {});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "No token provided");
    });
  });

});