"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminIdentity } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CampaignLocale = "pl" | "es" | "en";

function isLocale(value: unknown): value is CampaignLocale {
  return value === "pl" || value === "es" || value === "en";
}

function marketingRedirect(status: string): never {
  redirect(`/admin/marketing?status=${encodeURIComponent(status)}`);
}

/**
 * Unpublish sólo tras comprobar rol y revisión en el servidor Y de
 * nuevo en PostgreSQL. No aceptamos IDs de contenidos arbitrarios.
 */
export async function unpublishHomeCampaign(formData: FormData): Promise<void> {
  const admin = await requireAdminIdentity();
  if (admin.role !== "owner" && admin.role !== "publisher") {
    marketingRedirect("forbidden");
  }

  const locale = formData.get("locale");
  const revisionValue = formData.get("expectedRevision");
  const revision = typeof revisionValue === "string" ? Number(revisionValue) : NaN;

  if (!isLocale(locale) || !Number.isSafeInteger(revision) || revision < 1) {
    marketingRedirect("invalid");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    marketingRedirect("unavailable");
  }

  const { data, error } = await supabase.rpc("web_campaign_unpublish", {
    p_locale: locale,
    p_expected_revision: revision,
  });

  if (error) {
    marketingRedirect(error.code === "40001" ? "conflict" : "unavailable");
  }

  if (data !== true) {
    marketingRedirect("missing");
  }

  revalidatePath("/admin/marketing");
  revalidatePath(`/${locale}`);

  marketingRedirect("unpublished");
}
