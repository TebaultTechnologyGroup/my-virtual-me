// src/lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js';
import { fetchAuthSession } from '@aws-amplify/auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: async (url, options = {}) => {
            // Initialize headers from existing options or create new ones
            const headers = new Headers(options.headers);

            try {
                const session = await fetchAuthSession();
                const token = session.tokens?.idToken?.toString();

                if (token) {
                    headers.set('Authorization', `Bearer ${token}`);
                }
            } catch (e) {
                console.warn("No active Cognito session for Supabase fetch");
            }

            // Merge the updated headers back into the options
            return fetch(url, {
                ...options,
                headers,
            });
        },
    },
});
