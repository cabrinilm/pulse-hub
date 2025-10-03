import type { Request, Response } from "express";
import CommunityModel from '../models/CommunityModel';

class CommunityController {
  async createCommunity(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      const creatorId = req.user?.id;
      const supabase = req.supabase; 

      if (!creatorId) {
        res.status(401).json({ error: 'Unauthorized: No user ID found' });
        return;
      }
      if (!supabase) {
        res.status(500).json({ error: 'Supabase client not found in request' });
        return;
      }
      if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const community = await CommunityModel.create(supabase, name, description, creatorId);
      res.status(201).json(community);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getCommunities(req: Request, res: Response): Promise<void> {
    try {
      const supabase = req.supabase;
      if (!supabase) {
        res.status(500).json({ error: 'Supabase client not found in request' });
        return;
      }

      const communities = await CommunityModel.getAll(supabase);
      res.status(200).json(communities);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getCommunityById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supabase = req.supabase;

      if (!id) {
        res.status(400).json({ error: 'Community ID is required' });
        return;
      }
      if (!supabase) {
        res.status(500).json({ error: 'Supabase client not found in request' });
        return;
      }

      const community = await CommunityModel.getById(supabase, id);
      if (!community) {
        res.status(404).json({ error: 'Community not found' });
        return;
      }

      res.status(200).json(community);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async updateCommunity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const creatorId = req.user?.id;
      const supabase = req.supabase;

      if (!creatorId) {
        res.status(401).json({ error: 'Unauthorized: No user ID found' });
        return;
      }
      if (!supabase) {
        res.status(500).json({ error: 'Supabase client not found in request' });
        return;
      }
      if (!id) {
        res.status(400).json({ error: 'Community ID is required' });
        return;
      }

      const community = await CommunityModel.update(supabase, id, name, description);
      res.status(200).json(community);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async deleteCommunity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const creatorId = req.user?.id;
      const supabase = req.supabase;

      if (!creatorId) {
        res.status(401).json({ error: 'Unauthorized: No user ID found' });
        return;
      }
      if (!supabase) {
        res.status(500).json({ error: 'Supabase client not found in request' });
        return;
      }
      if (!id) {
        res.status(400).json({ error: 'Community ID is required' });
        return;
      }

      await CommunityModel.delete(supabase, id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

const communityController = new CommunityController();
export default communityController;
