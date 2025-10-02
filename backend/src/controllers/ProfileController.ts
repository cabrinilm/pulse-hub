// src/controllers/ProfileController.ts
import { createClient } from '@supabase/supabase-js';
import { ProfileModel } from '../models/ProfileModel';
import type { Request, Response } from 'express';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!; 

export class ProfileController {
  static async create(req: Request, res: Response) {
    const { username, avatar } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

  
    const userSupabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });


    const { data: { user }, error: authError } = await userSupabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    if (!username) return res.status(400).json({ error: 'Username is required' });

    const { success, error } = await ProfileModel.createOrUpdate(user.id, username, avatar, userSupabase);

    if (!success) {
      if (error?.code === '23505') return res.status(400).json({ error: 'Username already taken' });
      return res.status(400).json({ error: error?.message || 'Failed to create/update' });
    }

    return res.status(201).json({ message: 'Profile created/updated' });
  }

  static async get(req: Request, res: Response) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const userSupabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await userSupabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    const { data, error } = await ProfileModel.get(user.id, userSupabase);

    if (error || !data) return res.status(404).json({ error: 'Profile not found' });

    return res.status(200).json(data);
  }
}
