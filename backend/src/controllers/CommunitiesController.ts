// /backend/src/controllers/CommunityController.ts
import { Request, Response } from 'express';
import CommunitiesModels from '../models/CommunitiesModel';

class CommunityController {
  async createCommunity(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      const creatorId = req.user?.id;

      if (!creatorId) {
        res.status(401).json({ error: 'Unauthorized: No user ID found' });
        return;
      }

      if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const community = await CommunitiesModels.create(name, description, creatorId);
      res.status(201).json(community);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}