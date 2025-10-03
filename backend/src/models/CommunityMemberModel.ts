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
        status: status ?? "pending",
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
}

export default new CommunityMemberModel();