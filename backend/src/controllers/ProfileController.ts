import {Request, Response} from 'express'
import { supabase } from '../services/supabaseClient'
import { ProfileModel } from '../models/Profile'


export class ProfileController {


    static async create(req: Request, res: Response) {
        const {username, avatar} = req.body;
        const authHeader = req.headers.authorization;


        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({error: 'Unauthorized: Missing or invalid token'})
        }



        const token = authHeader.split(' ')[1]
    
     const {data: {user}, error: authError} = await supabase.auth.getUser(token);

       if(authError || !user){
        return res.status(401).json({error : 'Invalid token'});
       }


       if(!username){
        return res.status(400).json({error: 'Username is required'});
       }

        const { success, error } = await ProfileModel.createOrUpdate(user.id, username, avatar)
        
        if(!success){
            if(error?.code === '23505'){
                return res.status(400).json({error: 'Username already taken'});
            }
            return res.status(400).json({error: error?.message || 'Failed to create/update'});
        }

         
        return res.status(201).json({message: 'Profile created/updated'});

    }

// GET /api/profile: Check if user has a profile
 
static async get(req: Request, res: Response){
    const authHeader = req.headers.authorization;
 
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({error: 'Unauthorized: Missing or invalid token'});
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data, error } = await ProfileModel.get(user.id);

    if (error || !data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json(data);
  }
}