import type { Request, Response } from "express";
import CommunityMemberModel from "../models/CommunityMemberModel";

class CommunityMemberController {
  async joinCommunityById(req: Request, res: Response): Promise<void> {
    try {
      const communityId = req.params.communityId;
      const userId = req.user?.id;
      const supabase = req.supabase;
      console.log(userId, 'controller')

      if (!userId) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }
      if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }
      if (!communityId) {
        res.status(400).json({ error: "Community ID is required" });
        return;
      }

      const community = await CommunityMemberModel.joinCommunity(
        supabase,
        communityId,
        userId
      );

      if (!community) {
        res.status(404).json({ error: "Community not found" });
        return;
      }

      res.status(200).json(community);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

const communityMemberController = new CommunityMemberController();
export default communityMemberController;
