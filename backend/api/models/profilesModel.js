"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProfilesModel {
    // cria profile
    async createProfile(supabase, user_id, profile) {
        const { username, full_name, avatar } = profile;
        const { data, error } = await supabase
            .from("profiles")
            .insert([
            {
                user_id,
                username,
                full_name,
                avatar,
            },
        ])
            .select()
            .single();
        if (error) {
            if (error.code === "23505") {
                throw new Error("Profile with this username already exists");
            }
            throw new Error(`Failed to create profile: ${error.message}`);
        }
        if (!data) {
            throw new Error("No data returned from profile creation");
        }
        return data;
    }
    // retorna profile pelo user_id
    async getProfile(supabase, user_id) {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user_id)
            .maybeSingle();
        if (error) {
            throw new Error(`Failed to fetch profile: ${error.message}`);
        }
        return data;
    }
    // update
    async updateProfile(supabase, user_id, updates) {
        const { data, error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("user_id", user_id)
            .select()
            .single();
        if (error) {
            if (error.message.includes("duplicate") ||
                error.details?.includes("username")) {
                throw new Error("Username already exists");
            }
            throw new Error(`Failed to update profile: ${error.message}`);
        }
        if (!data) {
            throw new Error("Profile not found");
        }
        return data;
    }
    // deleta profile
    async deleteProfile(supabase, user_id) {
        const { error } = await supabase
            .from("profiles")
            .delete()
            .eq("user_id", user_id);
        if (error) {
            throw new Error(`Failed to delete profile: ${error.message}`);
        }
    }
}
exports.default = new ProfilesModel();
