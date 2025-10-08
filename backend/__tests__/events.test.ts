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
    creatorId = user.id;
  });

  afterEach(async () => {
    await supabase.from("events").delete().eq("creator_id", creatorId);
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

    it("should create event successfully for community where user is a member", async () => {
      const eventData = {
        creator_id: creatorId,
        community_id: "6af95627-c2f9-42bc-bd04-559daf11027e",
        title: "Authorized Event",
        description: "User is a member of this community",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };

      const resNewEvent = await makeRequest("post", "/api/events", eventData);

      expect(resNewEvent.status).toBe(201);

      const event: Event = resNewEvent.body;
      expect(event).toHaveProperty("id");
      expect(event.title).toBe("Authorized Event");
      expect(event.community_id).toBe("6af95627-c2f9-42bc-bd04-559daf11027e");
    });

    it("should fail to create event for community where user is not a member", async () => {
      const eventData = {
        creator_id: creatorId,
        community_id: "82ad0e4e-6207-4307-9e91-d3fa5c2e59be",
        title: "TESTE NOT ENTER",
        description: "User is not a member of this community",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };

      const resNewEvent = await makeRequest("post", "/api/events", eventData);
    
      expect(resNewEvent.status).toBe(403);
      expect(resNewEvent.body).toHaveProperty("error");
      expect(resNewEvent.body.error).toMatch(/Forbidden/i);
    });

    it("should fail if title is missing", async () => {
      const eventData = {
        creator_id: creatorId,
        community_id: null,
        description: "Event without title",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };

      const resNewEvent = await makeRequest("post", "/api/events", eventData);

      expect(resNewEvent.status).toBe(400);
      expect(resNewEvent.body).toHaveProperty("error");
      expect(resNewEvent.body.error).toMatch(/Title.*required/i);
    });

    it("should fail if title is invalid", async () => {
      const eventData = {
        creator_id: creatorId,
        community_id: null,
        title: "!!",
        description: "Event with invalid title",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };

      const resNewEvent = await makeRequest("post", "/api/events", eventData);

      expect(resNewEvent.status).toBe(500);
      expect(resNewEvent.body).toHaveProperty("error");
      expect(resNewEvent.body.error).toMatch(/title must be 3-50 characters/i);
    });

    it("should fail if creator_id does not match authenticated user", async () => {
      const eventData = {
        creator_id: "different-user-id",
        community_id: null,
        title: "Invalid Creator Event",
        description: "Creator ID does not match",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };

      const resNewEvent = await makeRequest("post", "/api/events", eventData);

      expect(resNewEvent.status).toBe(403);
      expect(resNewEvent.body).toHaveProperty("error");
      expect(resNewEvent.body.error).toMatch(/Forbidden.*creator_id/i);
    });

    it("should fail if user is not authenticated", async () => {
      const eventData = {
        creator_id: "b849653a-6d41-473d-b378-be90e24ce495",
        community_id: null,
        title: "Unauthenticated Event",
        description: "No authenticated user",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };

      const resNewEvent = await makeRequest("post", "/api/events", eventData);

      expect(resNewEvent.status).toBe(403);
      expect(resNewEvent.body).toHaveProperty("error");
      expect(resNewEvent.body.error).toMatch(
        "Forbidden: creator_id does not match authenticated user"
      );
    });
  });
  describe("UPDATE /api/events", () => {
    it("should update event succefully without community", async () => {
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

      expect(resNewEvent.status).toBe(201);

      const updateEvent = {
        creator_id: creatorId,
        community_id: null,
        title: "Pizza day Event",
        description: "User created event without community",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };

      const resUpdateEvent = await makeRequest(
        "patch",
        `/api/events/${resNewEvent.body.id}`,
        updateEvent
      );

      expect(resUpdateEvent.status).toBe(200);
      expect(resUpdateEvent.body.title).toBe(updateEvent.title);
      expect(resUpdateEvent.body.description).toBe(updateEvent.description);
    });
    it("should update event successfully for community where user is a member", async () => {
      const eventData = {
        creator_id: creatorId,
        community_id: "6af95627-c2f9-42bc-bd04-559daf11027e",
        title: "Community Event",
        description: "Event for community",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };

      const resNewEvent = await makeRequest("post", "/api/events", eventData);
      expect(resNewEvent.status).toBe(201);
     
      const updateEvent = {
        creator_id: creatorId,
        community_id: "6af95627-c2f9-42bc-bd04-559daf11027e",
        title: "Updated Community Event",
        description: "Updated event for community",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: false,
        price: 10,
        location: "In-person",
      };

      const resUpdateEvent = await makeRequest(
        "patch",
        `/api/events/${resNewEvent.body.id}`,
        updateEvent
      );
      console.log(resUpdateEvent.body)
      console.log(resUpdateEvent.status)
      expect(resUpdateEvent.status).toBe(200);
      expect(resUpdateEvent.body.title).toBe(updateEvent.title);
      expect(resUpdateEvent.body.is_public).toBe(false);
      expect(resUpdateEvent.body.price).toBe(10);
    });
    it("should fail to update event for community where user is not a member", async () => {
      const updateEvent = {
        creator_id: creatorId,
        community_id: "98d6642c-37ec-41df-b407-50ec60196583",
        title: "Unauthorized Update",
        description: "User is not a member of this community",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };
      let eventId = "05f185de-e280-4119-9f02-d5f456909f43";
      const resUpdateEvent = await makeRequest(
        "patch",
        `/api/events/${eventId}`,
        updateEvent
      );

      expect(resUpdateEvent.status).toBe(404);
      expect(resUpdateEvent.body).toHaveProperty("error");
      expect(resUpdateEvent.body.error).toMatch(
        "Event not found or update failed"
      );
    });
    it("should fail to update event by non-creator", async () => {
      const eventId = "05f185de-e280-4119-9f02-d5f456909f43";

      const updateEvent = {
        creator_id: creatorId,
        community_id: null,
        title: "Non Creator Update",
        description: "Attempt by non-creator",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };

      const resUpdateEvent = await makeRequest(
        "patch",
        `/api/events/${eventId}`,
        updateEvent
      );

      expect(resUpdateEvent.status).toBe(404);
      expect(resUpdateEvent.body).toHaveProperty("error");
      expect(resUpdateEvent.body.error).toMatch(
        /Event not found or update failed/i
      );
    });
    it("should fail if title is missing", async () => {
      const updateEvent = {
        creator_id: creatorId,
        community_id: null,
        description: "Event without title",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };
      const eventId = "5fcd3276-657f-417b-bf9e-c0039214172c";
      const resUpdateEvent = await makeRequest(
        "patch",
        `/api/events/${eventId}`,
        updateEvent
      );

      expect(resUpdateEvent.status).toBe(400);
      expect(resUpdateEvent.body).toHaveProperty("error");
      expect(resUpdateEvent.body.error).toMatch(/Title.*required/i);
    });
    it("should fail if user is not authenticated", async () => {
      const updateEvent = {
        creator_id: creatorId,
        community_id: null,
        title: "Unauthenticated Update",
        description: "No authenticated user",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };
      const eventId = "5fcd3276-657f-417b-bf9e-c0039214172c";
      const resUpdateEvent = await makeRequest(
        "patch",
        `/api/events/${eventId}`,
        updateEvent
      );

      expect(resUpdateEvent.status).toBe(404);
      expect(resUpdateEvent.body).toHaveProperty("error");
      expect(resUpdateEvent.body.error).toMatch(
        "Event not found or update failed"
      );
    });
  });
  describe("DELETE /api/events/:id", () => {
    it("should delete event successfully by creator", async () => {
      const { data: event } = await supabase
        .from("events")
        .insert({
          creator_id: creatorId,
          community_id: null,
          title: "Test Event",
          description: "Event for testing deletion",
          event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_public: true,
          price: 0,
          location: "Online",
        })
        .select()
        .single();
      const eventId = event!.id;

      const resDeleteEvent = await makeRequest(
        "delete",
        `/api/events/${eventId}`
      );

      expect(resDeleteEvent.status).toBe(204);
      expect(resDeleteEvent.body).toEqual({});

      const { data } = await supabase
        .from("events")
        .select()
        .eq("id", eventId)
        .maybeSingle();
      expect(data).toBeNull();
    });

    it("should fail to delete event by non-creator", async () => {
      const nonCreatorEventId = "05f185de-e280-4119-9f02-d5f456909f43";

      const resDeleteEvent = await makeRequest(
        "delete",
        `/api/events/${nonCreatorEventId}`
      );

      expect(resDeleteEvent.status).toBe(404);
      expect(resDeleteEvent.body).toHaveProperty("error");
      expect(resDeleteEvent.body.error).toMatch(/Forbidden|not found/i);
    });

    it("should fail to delete non-existent event", async () => {
      const invalidEventId = "05f185de-e280-4119-9f02-d5f456909f11";

      const resDeleteEvent = await makeRequest(
        "delete",
        `/api/events/${invalidEventId}`
      );

      expect(resDeleteEvent.status).toBe(404);
      expect(resDeleteEvent.body).toHaveProperty("error");
      expect(resDeleteEvent.body.error).toMatch(/not found/i);
    });

    it("should fail to delete event if user is not authenticated", async () => {
      const { data: event } = await supabase
        .from("events")
        .insert({
          creator_id: creatorId,
          community_id: null,
          title: "Test Event Unauthenticated",
          description: "Event for testing unauthenticated deletion",
          event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_public: true,
          price: 0,
          location: "Online",
        })
        .select()
        .single();
      const eventId = event!.id;

      const resDeleteEvent = await makeRequest(
        "delete",
        `/api/events/${eventId}`,
        undefined,
        {}
      );

      expect(resDeleteEvent.status).toBe(401);
      expect(resDeleteEvent.body).toHaveProperty("error");
      expect(resDeleteEvent.body.error).toMatch("No token provided");
    });
  });
  describe("GET /api/events", () => {
    it("should list public events", async () => {
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

      const res = await makeRequest("get", "/api/events", {});

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(
        res.body.some((event: Event) => event.title === "Allowed Event")
      ).toBe(true);
    });
    it("should list events for community where user is a member", async () => {
      const res = await makeRequest("get", "/api/events");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(
        res.body.some(
          (event: Event) =>
            event.title === "event to testert" &&
            event.community_id === "959e1a73-f59d-4450-bc16-9becae6d87ca"
        )
      ).toBe(true);
    });
    it("should not list private events not accessible", async () => {
      const res = await makeRequest("get", "/api/events");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(
        res.body.some((event: Event) => event.title === "anual meeting")
      ).toBe(false);
    });
    it("should fail to list events if user is not authenticated", async () => {
      const res = await makeRequest("get", "/api/events", undefined, {});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch("No token provided");
    });
    describe("GET /api/events/:id", () => {
      it("should get public event details", async () => {
        const publicEventId = "94b58b43-60df-4077-ac58-d2269b75a56f";
        const res = await makeRequest("get", `/api/events/${publicEventId}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id", publicEventId);
        expect(res.body.title).toBe("event to testert");
        expect(res.body.is_public).toBe(true);
      });
      it("should get event details for community where user is a member", async () => {
        const communityEventId = "94b58b43-60df-4077-ac58-d2269b75a56f";
        const res = await makeRequest("get", `/api/events/${communityEventId}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id", communityEventId);
        expect(res.body.title).toBe("event to testert");
      });
      it("should fail to get private event not accessible", async () => {
        const privateEventId = "2450fc5c-4271-4a5b-8fb2-9b0d5dd04261";
        const res = await makeRequest("get", `/api/events/${privateEventId}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toMatch(/not found|not accessible/i);
      });
      it("should fail to get non-existent event", async () => {
        const invalidEventId = "2450fc5c-4271-4a5b-8fb2-9b0d5dd04333";

        const res = await makeRequest("get", `/api/events/${invalidEventId}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toMatch(/not found/i);
      });

      it("should fail to get event if user is not authenticated", async () => {
        const publicEventId = "94b58b43-60df-4077-ac58-d2269b75a56f";
        const res = await makeRequest(
          "get",
          `/api/events/${publicEventId}`,
          undefined,
          {}
        );

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toMatch("No token provided");
      });
    });
  });
});
