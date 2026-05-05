import { createClient } from '@supabase/supabase-js';
import { fetchAuthSession } from '@aws-amplify/auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: async (url, options = {}) => {
            try {
                // Get the latest session from Cognito
                const session = await fetchAuthSession();
                const token = session.tokens?.accessToken?.toString();

                if (token) {
                    const headers = new Headers(options.headers);
                    headers.set('Authorization', `Bearer ${token}`);
                    options.headers = headers;
                }
            } catch (e) {
                console.error("Could not fetch Cognito token", e);
            }

            return fetch(url, options);
        },
    },
});