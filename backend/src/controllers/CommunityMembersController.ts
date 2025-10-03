import type { Request, Response } from "express";
import CommunityMemberModel from "../models/CommunityMemberModel";



class CommunityMemberControll {


    async joinCommunityById(req: Request, res: Response): Promise<void> {
        try {
            const {communityId} = req.params;
            const userId = req.user?.id;
            const supabase = req.supabase;
           
            if (!userId) {
                res.status(401).json({ error: "Unauthorized: No user ID found" });
                return;
              }
              if (!supabase) {
                res.status(500).json({ error: "Supabase client not found in request" });
                return;
              }
              if (!communityId) {
                res.status(400).json({ error: "Name is required" });
                return;
              }
              const community = await CommunityMemberModel.joinCommunity(supabase, communityId);
              if(!community){

                res.status(404).json({ error: "Community not found" });
                return;
              }
        
              res.status(200).json(community);
            } catch (error) {
              res
                .status(500)
                .json({
                  error: error instanceof Error ? error.message : "Unknown error",
                });
            }
          }
    }
    




export default CommunityMemberControll