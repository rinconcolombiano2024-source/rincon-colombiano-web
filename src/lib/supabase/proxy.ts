import {
  createServerClient,
} from "@supabase/ssr";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  getSupabasePublicConfig,
} from "@/lib/supabase/config";


export async function updateSupabaseSession(
  request:
    NextRequest,
): Promise<NextResponse> {
  const config =
    getSupabasePublicConfig();

  if (
    !config
  ) {
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse =
    NextResponse.next({
      request,
    });

  const supabase =
    createServerClient(
      config.url,
      config.key,
      {
        cookies: {
          getAll() {
            return request
              .cookies
              .getAll();
          },

          setAll(
            cookiesToSet,
          ) {
            cookiesToSet.forEach(
              ({
                name,
                value,
              }) => {
                request.cookies.set(
                  name,
                  value,
                );
              },
            );

            supabaseResponse =
              NextResponse.next({
                request,
              });

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                supabaseResponse
                  .cookies
                  .set(
                    name,
                    value,
                    options,
                  );
              },
            );
          },
        },
      },
    );

  /*
   * Verifica criptográficamente la sesión
   * y permite renovar tokens próximos
   * a expirar.
   *
   * Nunca usar getSession() aquí
   * para autorización.
   */
  await supabase
    .auth
    .getClaims();

  return supabaseResponse;
}
