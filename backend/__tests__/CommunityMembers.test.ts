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
  communityId = "98d6642c-37ec-41df-b407-50ec60196583";
  // helpers
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
      const resJoin = await makeRequest(
        "post",
        `/api/communities/${communityId}/members`
      );

      expect(resJoin.status).toBe(200);
      expect(resJoin.body).toHaveProperty("user_id", userId);
      expect(resJoin.body).toHaveProperty("community_id", communityId);
    });
    it("GET/ should list the members of a community", async () => {
      const resList = await makeRequest(
        "get",
        `/api/communities/${communityId}/members`
      );

      console.log(resList.body);

      expect(resList.status).toBe(200);
      expect(Array.isArray(resList.body)).toBe(true);

      const memberUserIds = resList.body.map((m: any) => m.user_id);
      expect(memberUserIds).toContain("98234733-7397-4478-9e8b-504761923450");
    });

  });
  describe('DELETE api/communities/:communityId/members', () => {
    it.only("user should be able to leave the community", async() => {
    
      const resJoin = await makeRequest(
        "post",
        `/api/communities/${communityId}/members`
      );
      expect(resJoin.status).toBe(200);
  
  
      const resDelete = await makeRequest(
        "delete",
        `/api/communities/${communityId}/members`
      );
      expect(resDelete.status).toBe(200); 
  
      
      const resList = await makeRequest(
        "get",
        `/api/communities/${communityId}/members`
      );
      expect(resList.status).toBe(200);
      const memberUserIds = resList.body.map((m: any) => m.user_id);
      expect(memberUserIds).not.toContain(userId);
    });
  });
  })

