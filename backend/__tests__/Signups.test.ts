import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { app } from "../src/index";
import dotenv from "dotenv";
import { Database } from "../src/types/supabase";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerToken = process.env.SUPABASE_BEARER_TOKEN;

type Signups = Database["public"]["Tables"]["signups"]["Row"];

describe("Signups routes", () => {
  let userId: string;
  let supabase: SupabaseClient<Database>;
  let eventId: string;

  const authHeader = { Authorization: `Bearer ${bearerToken}` };

  // Helper

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
  });

  afterEach(async () => {
    await supabase.from("signups").delete().eq("user_id", userId);
  });

  describe("POST /api/signups", () => {
    it("should signup to an public event successfully without community", async () => {
      const publicEventId = "07ff0188-7382-4c68-9ba2-8b1c9111c5ee";
      const PaymentAndPresente = {
        presence_status: "pending",
      };
      const res = await makeRequest(
        "post",
        `/api/events/${publicEventId}/signups`,
        PaymentAndPresente
      );

      expect(res.body).toHaveProperty("user_id", userId);
      expect(res.body).toHaveProperty("event_id", publicEventId);
      expect(res.body).toHaveProperty("signup_date");
      expect(res.body).toHaveProperty("payment_status", "pending");
      expect(res.body).toHaveProperty("presence_status", "pending");
    });
    it("should fail to signup to a private event as a non-creator", async () => {
      const privateEventId = "0f5ddea2-2d92-417e-837b-5999ea808470";
      const signupData = {
        presence_status: "pending",
      };

      const res = await makeRequest(
        "post",
        `/api/events/${privateEventId}/signups`,
        signupData
      );

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/not authorized/i);
    });
    it("should fail to signup to a non-existent event", async () => {
      const nonExistentEventId = "0f5ddea2-2d92-417e-837b-5999ea808411";
      const signupData = {
        presence_status: "pending",
      };

      const res = await makeRequest(
        "post",
        `/api/events/${nonExistentEventId}/signups`,
        signupData
      );

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(
        "Forbidden: user is not authorized to signup for this event or event doesnt exist"
      );
    });
    it("should fail to signup to an event in a community where user is not a member", async () => {
      const communityEventId = "0f5ddea2-2d92-417e-837b-5999ea808470";
      const signupData = {
        presence_status: "pending",
      };

      const res = await makeRequest(
        "post",
        `/api/events/${communityEventId}/signups`,
        signupData
      );

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(
        "Forbidden: user is not authorized to signup for this event or event doesnt exist"
      );
    });
    it("should fail if user is not authenticated", async () => {
      const publicEventId = "07ff0188-7382-4c68-9ba2-8b1c9111c5ee";
      const signupData = {
        presence_status: "pending",
      };

      const res = await makeRequest(
        "post",
        `/api/events/${publicEventId}/signups`,
        signupData,
        {}
      );

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/unauthorized|no token provided/i);
    });
    it("should signup to a community event successfully as a verified community member", async () => {
      const communityEventId = "0882c7d6-2bc1-41af-bbbd-4f1c3d23fc73";
      const signupData = {
        presence_status: "pending",
      };

      const res = await makeRequest(
        "post",
        `/api/events/${communityEventId}/signups`,
        signupData
      );

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user_id", userId);
      expect(res.body).toHaveProperty("event_id", communityEventId);
      expect(res.body).toHaveProperty("signup_date");
      expect(res.body).toHaveProperty("payment_status", "pending");
      expect(res.body).toHaveProperty("presence_status", "pending");
    });
  });
  describe("PATCH /api/events/:id/signups", () => {
    it("should update presence in the event without a community", async () => {
      const publicEventId = "07ff0188-7382-4c68-9ba2-8b1c9111c5ee";
      const PaymentAndPresente = {
        presence_status: "pending",
      };
      const res = await makeRequest(
        "post",
        `/api/events/${publicEventId}/signups`,
        PaymentAndPresente
      );

      expect(res.status).toBe(201)

      const updatePresence = {
        presence_status: "confirmed",
      };

      const resUpdate = await makeRequest(
        "patch",
        `/api/events/${publicEventId}/signups`,
        updatePresence
      );

      expect(resUpdate.status).toBe(200);

      expect(resUpdate.body).toBeDefined();

      expect(resUpdate.body.event_id).toBe(publicEventId);
      expect(resUpdate.body.user_id).toBeDefined();

      expect(resUpdate.body.presence_status).toBe("confirmed");
    });
    it("should update presence in the event with community", async () => {
      const communityEventId = "9144c3fc-4785-4755-aaaa-b9b02be30174";
      const PaymentAndPresente = {
        presence_status: "pending",
      };
      const res = await makeRequest(
        "post",
        `/api/events/${communityEventId}/signups`,
        PaymentAndPresente
      );

      expect(res.status).toBe(201)

      const updatePresence = {
        presence_status: "confirmed",
      };

      const resUpdate = await makeRequest(
        "patch",
        `/api/events/${communityEventId}/signups`,
        updatePresence
      );

      expect(resUpdate.status).toBe(200);

      expect(resUpdate.body).toBeDefined();

      expect(resUpdate.body.event_id).toBe(communityEventId);
      expect(resUpdate.body.user_id).toBeDefined();

      expect(resUpdate.body.presence_status).toBe("confirmed");
    });
    it("should fail to update non-existent signup", async () => {
      const publicEventId = "07ff0188-7382-4c68-9ba2-8b1c9111c5ee";
      const updatePresence = {
        presence_status: "confirmed",
      };
  
      
      const resUpdate = await makeRequest("patch", `/api/events/${publicEventId}/signups`, updatePresence);
  
      expect(resUpdate.status).toBe(404);
      expect(resUpdate.body).toHaveProperty("error");
      expect(resUpdate.body.error).toMatch(/signup not found/i);
    });
    it("should fail to update with invalid presence_status", async () => {
      const publicEventId = "07ff0188-7382-4c68-9ba2-8b1c9111c5ee";
      const signupData = {
        presence_status: "pending",
      };
      const res = await makeRequest("post", `/api/events/${publicEventId}/signups`, signupData);
  
      expect(res.status).toBe(201);
  
      const updatePresence = {
        presence_status: "invalid_status",
      };
      const resUpdate = await makeRequest("patch", `/api/events/${publicEventId}/signups`, updatePresence);
    
      expect(resUpdate.status).toBe(500);
   
    });
  });
});
