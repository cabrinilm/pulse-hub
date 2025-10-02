// /backend/src/controllers/AuthController.ts
import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';

class AuthController {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, username } = req.body;

      if (!email || !password || !username) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
        res.status(400).json({ error: 'Username must be 3-20 alphanumeric characters' });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ user_id: data.user.id, username });

        if (profileError) {
          res.status(400).json({ error: profileError.message });
          return;
        }

        res.status(201).json({ message: 'Signup successful', user: data.user });
      } else {
        res.status(400).json({ error: 'User creation failed' });
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

export default new AuthController();