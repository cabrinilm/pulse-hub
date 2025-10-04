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
  const authHeader = { Authorization: `Bearer ${bearerToken}` };

  // Helper
  const makeRequest = (
    method: "post" | "get" | "patch" | "delete",
    url: string,
    body?: object
  ) => {
    let req = request(app)[method](url)
      .set("Authorization", `Bearer ${bearerToken}`)
      .set("Content-Type", "application/json");

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
    await supabase
      .from("events")
      .delete()
      .eq("creator_id", creatorId);
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
        community_id: "e5f2ff2f-9d5a-4223-8eca-a05cc1439ea2",
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
      expect(event.community_id).toBe('e5f2ff2f-9d5a-4223-8eca-a05cc1439ea2');
    });

    it("should fail to create event for community where user is not a member", async () => {
      const eventData = {
        creator_id: creatorId,
        community_id: "7622bf78-748b-49c4-9c29-a619cecc72e6",
        title: "Unauthorized Event",
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
      expect(resNewEvent.body.error).toMatch('Forbidden: creator_id does not match authenticated user');
    });
  });
  describe.only("UPDATE /api/events", () => {
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

      const updateEvent =  {
        creator_id: creatorId,
        community_id: null,
        title: "Pizza day Event",
        description: "User created event without community",
        event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_public: true,
        price: 0,
        location: "Online",
      };
        
      const resUpdateEvent =   await makeRequest("patch", `/api/events/${resNewEvent.body.id}`,  updateEvent);
         
  
      expect(resUpdateEvent.status).toBe(200);
      expect(resUpdateEvent.body.title).toBe(updateEvent.title);
      expect(resUpdateEvent.body.description).toBe(updateEvent.description);

   });
   it("should update event successfully for community where user is a member", async () => {
    const eventData = {
      creator_id: creatorId,
      community_id: 'e5f2ff2f-9d5a-4223-8eca-a05cc1439ea2',
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
      community_id: 'e5f2ff2f-9d5a-4223-8eca-a05cc1439ea2',
      title: "Updated Community Event",
      description: "Updated event for community",
      event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      is_public: false,
      price: 10,
      location: "In-person",
    };

    const resUpdateEvent = await makeRequest("patch", `/api/events/${resNewEvent.body.id}`, updateEvent);
    
   
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
    let eventId = '05f185de-e280-4119-9f02-d5f456909f43';
    const resUpdateEvent = await makeRequest("patch", `/api/events/${eventId}`, updateEvent);

   
    expect(resUpdateEvent.status).toBe(404);
    expect(resUpdateEvent.body).toHaveProperty("error");
    expect(resUpdateEvent.body.error).toMatch('Event not found or update failed');
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

    const resUpdateEvent = await makeRequest("patch", `/api/events/${eventId}`, updateEvent);

  
    expect(resUpdateEvent.status).toBe(404);
    expect(resUpdateEvent.body).toHaveProperty("error");
    expect(resUpdateEvent.body.error).toMatch(/Event not found or update failed/i);
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
    const eventId = '5fcd3276-657f-417b-bf9e-c0039214172c';
    const resUpdateEvent = await makeRequest("patch", `/api/events/${eventId}`, updateEvent);

  
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
    const eventId = '5fcd3276-657f-417b-bf9e-c0039214172c';
    const resUpdateEvent = await makeRequest("patch", `/api/events/${eventId}`, updateEvent);

 
    expect(resUpdateEvent.status).toBe(404);
    expect(resUpdateEvent.body).toHaveProperty("error");
    expect(resUpdateEvent.body.error).toMatch("Event not found or update failed");
  });
  });
});