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

  afterEach(async () => {
    await supabaseUser.from("signups").delete().eq("user_id", userId);
  });

  afterAll(async () => {
    await supabaseCreator.from("events").delete().in("id", [publicEventId, privateEventId]);
  });

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
      // expect(res.body).toHaveProperty("event_id", publicEventId);
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
    it.only("should list signups for a public event (visible to all users)", async () => {

      await makeRequest("post", `/api/events/${publicEventId}/signups`, {
        presence_status: "pending",
      });

      const res = await makeRequest("get", `/api/events/${publicEventId}/signups`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty("event_id", publicEventId);
    });

    it("should not list signups for a private event if user is not participant or creator", async () => {
      const res = await makeRequest("get", `/api/events/${privateEventId}/signups`);
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not authorized/i);
    });
  });

  // ======================================================
  // PATCH /api/events/:event_id/signups/:signup_id
  // ======================================================
  describe("PATCH /api/events/:event_id/signups/:signup_id", () => {
    it("should allow a user to update their presence_status", async () => {
      const { body: signup } = await makeRequest("post", `/api/events/${publicEventId}/signups`, {
        presence_status: "pending",
      });

      const res = await makeRequest(
        "patch",
        `/api/events/${publicEventId}/signups/${signup.id}`,
        { presence_status: "confirmed" }
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("presence_status", "confirmed");
    });

    it("should not allow another user to update someone else’s signup", async () => {
      const { body: signup } = await makeRequest("post", `/api/events/${publicEventId}/signups`, {
        presence_status: "pending",
      });

      const res = await makeRequest(
        "patch",
        `/api/events/${publicEventId}/signups/${signup.id}`,
        { presence_status: "confirmed" },
        bearerTokenCreator
      );

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not authorized/i);
    });
  });

  // ======================================================
  // DELETE /api/events/:event_id/signups/:signup_id
  // ======================================================
  describe("DELETE /api/events/:event_id/signups/:signup_id", () => {
    it("should allow user to delete their own signup", async () => {
      const { body: signup } = await makeRequest("post", `/api/events/${publicEventId}/signups`, {
        presence_status: "pending",
      });

      const res = await makeRequest("delete", `/api/events/${publicEventId}/signups/${signup.id}`);
      expect(res.status).toBe(204);
    });

    it("should not allow a different user (creator) to delete another user’s signup", async () => {
      const { body: signup } = await makeRequest("post", `/api/events/${publicEventId}/signups`, {
        presence_status: "pending",
      });

      const res = await makeRequest(
        "delete",
        `/api/events/${publicEventId}/signups/${signup.id}`,
        undefined,
        bearerTokenCreator
      );

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not authorized/i);
    });
  });
});


// import request from "supertest";
// import { createClient, SupabaseClient } from "@supabase/supabase-js";
// import { app } from "../src/index";
// import dotenv from "dotenv";
// import { Database } from "../src/types/supabase";

// dotenv.config();

// const supabaseUrl = process.env.SUPABASE_URL!;
// const supabaseKey = process.env.SUPABASE_ANON_KEY!;
// const bearerToken = process.env.SUPABASE_BEARER_TOKEN;

// describe("Signups routes", () => {
//   let supabase: SupabaseClient<Database>;
//   let userId: string;
//   let publicEventId: string;
//   let privateEventId: string;
//   const testPrefix = "test_signup_";

//   const authHeader = { Authorization: `Bearer ${bearerToken}` };

//   const makeRequest = (
//     method: "post" | "get" | "patch" | "delete",
//     url: string,
//     body?: object,
//     headers: { [key: string]: string } = authHeader
//   ) => {
//     let req = request(app)[method](url).set("Content-Type", "application/json");
//     if (headers) req = req.set(headers);
//     if (body) req = req.send(body);
//     return req;
//   };

//   beforeAll(async () => {
//     if (!bearerToken) throw new Error("Missing SUPABASE_BEARER_TOKEN");

//     supabase = createClient<Database>(supabaseUrl, supabaseKey, {
//       global: { headers: authHeader },
//     });

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) throw new Error("Test user not found");
//     userId = user.id;

//     // Criar eventos fixos
//     const { data: publicEvent } = await supabase
//       .from("events")
//       .insert({
//         title: `${testPrefix}public_event`,
//         event_date: new Date().toISOString(),
//         is_public: true,
//         creator_id: userId,
//       })
//       .select("id")
//       .single();

//     const { data: privateEvent } = await supabase
//       .from("events")
//       .insert({
//         title: `${testPrefix}private_event`,
//         event_date: new Date().toISOString(),
//         is_public: false,
//         creator_id: userId,
//       })
//       .select("id")
//       .single();

//     if (!publicEvent || !privateEvent)
//       throw new Error("Failed to create test events");

//     publicEventId = publicEvent.id;
//     privateEventId = privateEvent.id;
//   });

//   afterEach(async () => {
//     // limpar signups criados
//     await supabase.from("signups").delete().like("presence_status", `${testPrefix}%`);
//   });

//   afterAll(async () => {
//     // limpar eventos criados
//     await supabase.from("events").delete().like("title", `${testPrefix}%`);
//   });

//   // ----------------------------
//   // CREATE SIGNUP
//   // ----------------------------
//   describe("CREATE Signup (POST /api/events/:event_id/signups)", () => {
//     it.only("should create a signup for a public event", async () => {

//       const dbId = "bc57ccab-17a0-4331-b9b6-2fe75f2ee6d7";
//       const res = await makeRequest("post", `/api/events/${dbId}/signups`, {
//         presence_status: "pending",
//       });
//        console.log(res.body)
//       expect(res.status).toBe(201);
//       expect(res.body).toHaveProperty("user_id", userId);
//       expect(res.body).toHaveProperty("event_id", dbId);
//       expect(res.body).toHaveProperty("payment_status", "pending");
//       expect(res.body).toHaveProperty("presence_status", "pending");
//     });

//     it("should fail to create signup for a private event if user not added", async () => {
//       const res = await makeRequest("post", `/api/events/${privateEventId}/signups`, {
//         presence_status: "pending",
//       });

//       expect(res.status).toBe(403);
//       expect(res.body.error).toMatch(/not authorized/i);
//     });

//     it("should fail to create signup if user is not authenticated", async () => {
//       const res = await makeRequest("post", `/api/events/${publicEventId}/signups`, {
//         presence_status: "pending",
//       }, {});

//       expect(res.status).toBe(401);
//       expect(res.body).toHaveProperty("error", "No token provided");
//     });
//   });

//   // ----------------------------
//   // GET SIGNUPS
//   // ----------------------------
//   describe("GET Signups (List user signups)", () => {
//     beforeEach(async () => {
//       await makeRequest("post", `/api/events/${publicEventId}/signups`, {
//         presence_status: "confirmed",
//       });
//     });

//     it("should list all signups of the user", async () => {
//       const res = await makeRequest("get", `/api/signups`);

//       expect(res.status).toBe(200);
//       expect(Array.isArray(res.body)).toBe(true);
//       expect(res.body.length).toBeGreaterThan(0);
//       expect(
//         res.body.some((s: any) => s.event_id === publicEventId)
//       ).toBe(true);
//     });

//     it("should fail to list signups if not authenticated", async () => {
//       const res = await makeRequest("get", `/api/signups`, undefined, {});

//       expect(res.status).toBe(401);
//       expect(res.body).toHaveProperty("error", "No token provided");
//     });
//   });

//   // ----------------------------
//   // GET Signup by ID
//   // ----------------------------
//   describe("GET Signup by ID", () => {
//     let signupId: string;

//     beforeEach(async () => {
//       const res = await makeRequest("post", `/api/events/${publicEventId}/signups`, {
//         presence_status: "confirmed",
//       });
//       signupId = res.body.id;
//     });

//     it("should get a signup by ID", async () => {
//       const res = await makeRequest("get", `/api/signups/${signupId}`);

//       expect(res.status).toBe(200);
//       expect(res.body).toHaveProperty("id", signupId);
//       expect(res.body).toHaveProperty("user_id", userId);
//     });

//     it("should fail to get signup if user not authenticated", async () => {
//       const res = await makeRequest("get", `/api/signups/${signupId}`, undefined, {});
//       expect(res.status).toBe(401);
//       expect(res.body).toHaveProperty("error", "No token provided");
//     });

//     it("should return 404 if signup not found", async () => {
//       const res = await makeRequest("get", `/api/signups/11111111-1111-1111-1111-111111111111`);
//       expect(res.status).toBe(404);
//       expect(res.body).toHaveProperty("error", "Signup not found");
//     });
//   });

//   // ----------------------------
//   // UPDATE Signup
//   // ----------------------------
//   describe("UPDATE Signup", () => {
//     let signupId: string;

//     beforeEach(async () => {
//       const res = await makeRequest("post", `/api/events/${publicEventId}/signups`, {
//         presence_status: "pending",
//       });
//       signupId = res.body.id;
//     });

//     it("should update signup presence_status", async () => {
//       const updates = { presence_status: "confirmed" };

//       const res = await makeRequest("patch", `/api/signups/${signupId}`, updates);

//       expect(res.status).toBe(200);
//       expect(res.body).toHaveProperty("presence_status", "confirmed");
//     });

//     it("should fail if user not authenticated", async () => {
//       const updates = { presence_status: "confirmed" };
//       const res = await makeRequest("patch", `/api/signups/${signupId}`, updates, {});
//       expect(res.status).toBe(401);
//       expect(res.body).toHaveProperty("error", "No token provided");
//     });

//     it("should return 404 if signup does not exist", async () => {
//       const res = await makeRequest("patch", `/api/signups/11111111-1111-1111-1111-111111111111`, {
//         presence_status: "confirmed",
//       });
//       expect(res.status).toBe(404);
//       expect(res.body).toHaveProperty("error", "Signup not found");
//     });
//   });

//   // ----------------------------
//   // DELETE Signup
//   // ----------------------------
//   describe("DELETE Signup", () => {
//     let signupId: string;

//     beforeEach(async () => {
//       const res = await makeRequest("post", `/api/events/${publicEventId}/signups`, {
//         presence_status: "pending",
//       });
//       signupId = res.body.id;
//     });

//     it("should delete a signup", async () => {
//       const res = await makeRequest("delete", `/api/signups/${signupId}`);
//       expect(res.status).toBe(204);

//       const check = await makeRequest("get", `/api/signups/${signupId}`);
//       expect(check.status).toBe(404);
//     });

//     it("should fail if user not authenticated", async () => {
//       const res = await makeRequest("delete", `/api/signups/${signupId}`, undefined, {});
//       expect(res.status).toBe(401);
//       expect(res.body).toHaveProperty("error", "No token provided");
//     });

//     it("should return 404 if signup does not exist", async () => {
//       const res = await makeRequest("delete", `/api/signups/11111111-1111-1111-1111-111111111111`);
//       expect(res.status).toBe(404);
//       expect(res.body).toHaveProperty("error", "Signup not found");
//     });
//   });
// });



