import { supabase } from './src/services/supabaseClient.ts'


async function getJwt(){

    const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: "dom@hotmail.com",
        password: "123321lL",
      });
      if (error) {
        console.error("Error:", error.message);
        return;
      }
      console.log("JWT:", session.access_token);
    }
    
    getJwt();
    