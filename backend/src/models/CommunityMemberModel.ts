import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

interface CommunityMember {
  community_id: string;
  user_id: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "rejected";
  joined_at: string;
}

class CommunityMemberModel {
  async joinCommunity(
    supabase: SupabaseClient<Database>,
    community_id: string,
    user_id: string,
    role?: "admin" | "member",
    status?: "pending" | "accepted" | "rejected"
  ): Promise<CommunityMember> {
    const { data, error } = await supabase
      .from("community_members")
      .insert({
        community_id,
        user_id,
        role: role ?? "member",         
        status: status ?? "accepted",
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("User already joined this community");
      }
      throw new Error(`Failed to join community: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from join operation");
    }

    return data as CommunityMember;
  }
 
  // Get members of a community


    async getAllMembers(
      supabase: SupabaseClient<Database>,
      communityId: string
    ): Promise<CommunityMember[]> {
      const { data, error } = await supabase
        .from("community_members")
        .select("*")
        .eq("community_id", communityId)
        .order("joined_at", { ascending: false });
  
      if (error) {
        throw new Error(`Failed to fetch members: ${error.message}`);
      }
  
      return (data as CommunityMember[]) || [];
    }
 
    //  Member leaves the community 

    async leaveCommunity(
      supabase: SupabaseClient<Database>,
      communityId: string,
      userId: string,
    ): Promise<CommunityMember[]> {
      const { data, error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", userId)
        .select(); 
    
      if (error) {
        throw new Error(`Failed to leave community: ${error.message}`);
      }
    
      return data as CommunityMember[];
    
    }

    // Adm remove member

    async admRemove(
      supabase: SupabaseClient<Database>,
      communityId: string,
      removedUserId: string
    ): Promise<CommunityMember[]> {
      const { data, error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", removedUserId)
        .select();
    
      if (error) {
        throw new Error(`Failed to remove member: ${error.message}`);
      }
    
      return data as CommunityMember[];
    }

    
    }

    


  
  


export default new CommunityMemberModel();