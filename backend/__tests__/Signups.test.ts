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
      const PaymentAndPresente  ={
    
         presence_status: "pending"
      }
      const res = await makeRequest(
        "post",
        `/api/events/${publicEventId}/signups`
      , PaymentAndPresente);
      console.log(res.status)
      console.log(res.body)
      expect(res.body).toHaveProperty("user_id", userId);
      expect(res.body).toHaveProperty("event_id", publicEventId);
      expect(res.body).toHaveProperty("signup_date");
      expect(res.body).toHaveProperty("payment_status", "pending");
      expect(res.body).toHaveProperty("presence_status", "pending");
    });
  });
});
