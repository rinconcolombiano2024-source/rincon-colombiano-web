import {
  createServerClient,
} from "@supabase/ssr";

import {
  cookies,
} from "next/headers";

import {
  getSupabasePublicConfig,
} from "@/lib/supabase/config";


export async function createSupabaseServerClient() {
  const config =
    getSupabasePublicConfig();

  if (
    !config
  ) {
    return null;
  }

  const cookieStore =
    await cookies();

  return createServerClient(
    config.url,
    config.key,
    {
      cookies: {
        getAll() {
          return cookieStore
            .getAll();
        },

        setAll(
          cookiesToSet,
        ) {
          try {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                cookieStore.set(
                  name,
                  value,
                  options,
                );
              },
            );
          } catch {
            /*
             * Un Server Component puede leer cookies
             * pero no siempre puede escribirlas.
             *
             * El refresco de sesión se realiza
             * también desde proxy.ts.
             */
          }
        },
      },
    },
  );
}
