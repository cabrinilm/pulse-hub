import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { app } from "../src/index";
import dotenv from "dotenv";
import { Database } from "../src/types/supabase";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerToken = process.env.SUPABASE_BEARER_TOKEN; 

describe("Profiles routes", () => {
  let supabase: SupabaseClient<Database>;
  let userId: string;
  const testUsernamePrefix = "test_user_"; 

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

   
    await supabase.from("profiles").delete().like("username", `${testUsernamePrefix}%`);
  });

  afterEach(async () => {
    if (!userId) return;
   
    await supabase.from("profiles").delete().eq("user_id", userId).like("username", `${testUsernamePrefix}%`);
  });

  describe("CREATE Profile", () => {
    it("should create a profile for the authenticated user", async () => {
      const body = {
        username: `${testUsernamePrefix}first`,
        full_name: "Test User",
        avatar: "https://example.com/avatar.png",
      };

      const res = await makeRequest("post", "/api/profile", body);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user_id", userId);
      expect(res.body).toHaveProperty("username", `${testUsernamePrefix}first`);
      expect(res.body).toHaveProperty("full_name", "Test User");
      expect(res.body).toHaveProperty("avatar", "https://example.com/avatar.png");
    });

    it("should fail to create a profile if username is missing", async () => {
      const body = { full_name: "Test User" };

      const res = await makeRequest("post", "/api/profile", body);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Username is required");
    });

    it("should fail to create a profile if user is not authenticated", async () => {
      const body = {
        username: `${testUsernamePrefix}unauth`,
        full_name: "Test User",
      };

      const res = await makeRequest("post", "/api/profile", body, {});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "No token provided");
    });

    it("should fail to create a duplicate username", async () => {

      await makeRequest("post", "/api/profile", {
        username: `${testUsernamePrefix}duplicate`,
        full_name: "Dup User",
      });

 
      const res = await makeRequest("post", "/api/profile", {
        username: `${testUsernamePrefix}duplicate`,
        full_name: "Dup User 2",
      });

      expect(res.status).toBe(409); 
      expect(res.body.error).toMatch('Profile with this username already exists');
    });

    it("should create profile with optional fields empty", async () => {
      const body = { username: `${testUsernamePrefix}minimal` };

      const res = await makeRequest("post", "/api/profile", body);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("username", `${testUsernamePrefix}minimal`);
      expect(res.body.full_name).toBeNull(); 
      expect(res.body.avatar).toBeNull();
    });
  });

  describe("GET Profile", () => {
    beforeEach(async () => {
     
      await makeRequest("post", "/api/profile", {
        username: `${testUsernamePrefix}get`,
        full_name: "Get User",
        avatar: "https://example.com/get-avatar.png",
      });
    });

    it("should get the profile for the authenticated user", async () => {
      const res = await makeRequest("get", "/api/profile");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user_id", userId);
      expect(res.body).toHaveProperty("username", `${testUsernamePrefix}get`);
      expect(res.body).toHaveProperty("full_name", "Get User");
    });

    it("should return 404 if profile does not exist", async () => {
    
      await supabase.from("profiles").delete().eq("user_id", userId).like("username", `${testUsernamePrefix}%`);

      const res = await makeRequest("get", "/api/profile");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", expect.stringContaining("not found"));
    });

    it("should fail to get profile if user is not authenticated", async () => {
      const res = await makeRequest("get", "/api/profile", undefined, {});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "No token provided");
    });
  });

  describe("UPDATE Profile", () => {
    let testUsername: string;

    beforeEach(async () => {
      testUsername = `${testUsernamePrefix}update`;
      // Cria um perfil fixture para atualização
      await makeRequest("post", "/api/profile", {
        username: testUsername,
        full_name: "Original User",
        avatar: "https://example.com/original-avatar.png",
      });
    });

    it("should update the profile for the authenticated user", async () => {
      const updates = {
        full_name: "Updated User",
        avatar: "https://example.com/updated-avatar.png",
      };

      const res = await makeRequest("patch", "/api/profile", updates);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user_id", userId);
      expect(res.body).toHaveProperty("username", testUsername);
      expect(res.body).toHaveProperty("full_name", "Updated User");
      expect(res.body).toHaveProperty("avatar", "https://example.com/updated-avatar.png");
    });

    it("should fail to update if user is not authenticated", async () => {
      const updates = {
        full_name: "Unauthorized Update",
      };

      const res = await makeRequest("patch", "/api/profile", updates, {});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "No token provided");
    });

    it("should fail to update with invalid data (e.g., duplicate username from another profile)", async () => {
      // Cria outro perfil para simular duplicata (assumindo que o controller verifica unicidade)
      await makeRequest("post", "/api/profile", {
        username: `${testUsernamePrefix}other`,
        full_name: "Other User",
      });

      const updates = {
        username: `${testUsernamePrefix}other`, // Tenta atualizar para um username existente
      };

      const res = await makeRequest("patch", "/api/profile", updates);

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/duplicate|unique/i);
    });

    it("should update only optional fields without changing username", async () => {
      const updates = {
        full_name: "Partial Update",
      };

      const res = await makeRequest("patch", "/api/profile", updates);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("username", testUsername);
      expect(res.body).toHaveProperty("full_name", "Partial Update");
      expect(res.body).toHaveProperty("avatar", "https://example.com/original-avatar.png"); // Não alterado
    });
  });

  describe("DELETE Profile", () => {
    beforeEach(async () => {
      // Cria um perfil fixture para deleção
      await makeRequest("post", "/api/profile", {
        username: `${testUsernamePrefix}delete`,
        full_name: "Delete User",
        avatar: "https://example.com/delete-avatar.png",
      });
    });

    it("should delete the profile for the authenticated user", async () => {
      const res = await makeRequest("delete", "/api/profile");

      expect(res.status).toBe(204); // Ou 200, dependendo do controller; ajuste se retornar mensagem

      // Verifica se deletado
      const getRes = await makeRequest("get", "/api/profile");
      expect(getRes.status).toBe(404);
      expect(getRes.body).toHaveProperty("error", expect.stringContaining("not found"));
    });

    it("should fail to delete if user is not authenticated", async () => {
      const res = await makeRequest("delete", "/api/profile", undefined, {});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "No token provided");
    });

    it.only("should return 404 or no-op if profile does not exist", async () => {
    
      await supabase.from("profiles").delete().eq("user_id", userId).like("username", `${testUsernamePrefix}%`);

      const res = await makeRequest("delete", "/api/profile");

      expect(res.status).toBe(204); 
      expect(res.body).toHaveProperty("error", expect.stringContaining("not found"));
    });
  });
});