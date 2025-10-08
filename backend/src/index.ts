import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AuthController from './controllers/AuthController.ts';
import CommunityController from './controllers/CommunityController.ts';
import profilesController from './controllers/ProfileController.ts';
import communityMemberController from './controllers/CommunityMembersController.ts';
import { authMiddleware } from './middleware/auth.ts';
import eventsController from './controllers/EventsController.ts';
import signupsController from './controllers/SignupsController.ts';


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api', (_req, res) => {
  res.json({ message: 'PulseHub Backend' });
});

// Auth routes
app.post('/api/signup', AuthController.signup);

// Profile routes
app.post('/api/profile', authMiddleware, profilesController.createProfile);
app.get('/api/profile', authMiddleware, profilesController.getProfile);
app.patch('/api/profile', authMiddleware, profilesController.updateProfile);
app.delete('/api/profile', authMiddleware, profilesController.deleteProfile);

// // Community routes

// app.post('/api/communities', authMiddleware, CommunityController.createCommunity);
// app.get('/api/communities', authMiddleware, CommunityController.getCommunities);
// app.get('/api/communities/:id', authMiddleware, CommunityController.getCommunityById);
// app.patch('/api/communities/:id', authMiddleware, CommunityController.updateCommunity);
// app.delete('/api/communities/:id', authMiddleware, CommunityController.deleteCommunity);

// // Community members 

// app.post('/api/communities/:communityId/members', authMiddleware, communityMemberController.joinCommunityById);
// app.get('/api/communities/:communityId/members', authMiddleware, communityMemberController.getAllMembersCommunity);
// app.delete('/api/communities/:communityId/members', authMiddleware, communityMemberController.memberLeavesCommunity);
// app.delete('/api/communities/:communityId/:removedUserId', authMiddleware, communityMemberController.admRemoveMember);


// Events 

app.post('/api/events', authMiddleware, eventsController.createEvent);
// app.patch(`/api/events/:id`, authMiddleware, eventsController.updateEventByUser);
// app.delete(`/api/events/:id`, authMiddleware, eventsController.deleteEventByUser);
// app.get('/api/events', authMiddleware, eventsController.listEvents);
// app.get('/api/events/:id', authMiddleware, eventsController.getEventById);


// Signups 

app.post('/api/events/:id/signups', authMiddleware, signupsController.signupEvent);
app.patch('/api/events/:id/signups', authMiddleware, signupsController.updatePresence);
app.delete('/api/events/:id/signups', authMiddleware, signupsController.deleteSignups);
app.get('/api/signups', authMiddleware, signupsController.getAllSignups);
app.post('/api/events/:event_id/add-user', authMiddleware, signupsController.addUserToEvent
);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export { app };