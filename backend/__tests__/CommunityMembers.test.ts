import request from "supertest";
import { createClient } from "@supabase/supabase-js";
import { app } from "../src/index";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerToken = process.env.SUPABASE_BEARER_TOKEN!;

describe("Community.Members routes", () => {
  let userId: string;
  let communityId: string;
  let supabase: ReturnType<typeof createClient>;
  const authHeader = { Authorization: `Bearer ${bearerToken}` };

  // helpers
  // const uniqueName = () => `Community${Date.now()}`;
  const makeRequest = (
    method: "post" | "get" | "patch" | "delete",
    url: string,
    body?: object
  ) => {
    let req = request(app)
      [method](url)
      .set("Authorization", `Bearer ${bearerToken}`)
      .set("Content-Type", "application/json");
    if (body) req = req.send(body);
    return req;
  };

  beforeAll(async () => {
    if (!bearerToken) throw new Error("Missing SUPABASE_BEARER_TOKEN");
    supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: authHeader },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Test user not found");
    userId = user.id;

  });

  afterEach(async () => {
    await supabase
    .from("community_members")
    .delete()
    .eq("user_id", userId)
    .eq("community_id", "98d6642c-37ec-41df-b407-50ec60196583");
  });

  describe("POST api/communities", () => {
    it("should successfuly join a community", async () => {
      communityId = "98d6642c-37ec-41df-b407-50ec60196583";

      const resJoin = await makeRequest(
        "post",
        `/api/communities/${communityId}/members`
      );

      expect(resJoin.status).toBe(200);
      expect(resJoin.body).toHaveProperty("user_id", userId);
      expect(resJoin.body).toHaveProperty("community_id", communityId);

    });
  });
});
