import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { Database } from "@/types/supabase"; // Assuming you have generated Database types

/**
 * Creates an authenticated Supabase server client with Clerk authentication
 * and enhanced error handling and logging.
 */
export async function createSupabaseServerClient() {
  const cookieStore = cookies();
  const { userId } = auth();

  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              console.error("Error setting cookie:", error);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              console.error("Error removing cookie:", error);
            }
          },
        },
      }
    );

    // If user is authenticated with Clerk, set the JWT for Supabase
    if (userId) {
      const token = await auth().getToken({ template: "supabase" });
      if (token) {
        await supabase.auth.setAuth(token);
      }
    }

    return supabase;
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    throw new Error("Failed to initialize Supabase client");
  }
}

/**
 * Creates an admin-level Supabase client for server-side operations
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set in environment
 */
export async function createSupabaseAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not set in environment");
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/**
 * Helper function to get the current authenticated user from Supabase
 * Returns null if no user is authenticated
 */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching current user:", error);
    return null;
  }

  return user;
}

/**
 * Helper function to get the current session from Supabase
 * Returns null if no session exists
 */
export async function getCurrentSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching current session:", error);
    return null;
  }

  return session;
}

/**
 * Helper function to fetch user profile from public.users table
 * Combines auth user with profile data
 */
export async function getUserProfile(userId?: string) {
  const supabase = await createSupabaseServerClient();
  
  if (!userId) {
    const user = await getCurrentUser();
    if (!user) return null;
    userId = user.id;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

/**
 * Helper function to check if user has specific role
 * Requires RLS to be properly configured in Supabase
 */
export async function checkUserRole(userId: string, requiredRole: string) {
  const supabaseAdmin = await createSupabaseAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error checking user role:", error);
    return false;
  }

  return data?.role === requiredRole;
}

/**
 * Server-side safe client component initializer
 * To be used in Server Components that need Supabase client
 */
export async function withSupabaseClient<T>(
  action: (supabase: ReturnType<typeof createServerClient>) => Promise<T>
): Promise<T> {
  const supabase = await createSupabaseServerClient();
  return action(supabase);
}

/**
 * Type-safe query helper for common operations
 */
export async function queryHandler<T = any>(
  query: Promise<{ data: T | null; error: Error | null }>
) {
  try {
    const { data, error } = await query;
    
    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { data: null, error: error as Error };
  }
}
