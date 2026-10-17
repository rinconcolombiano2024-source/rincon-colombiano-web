"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminIdentity } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const statuses = new Set(["pending", "published", "rejected"]);

export async function moderateReview(formData: FormData) {
  const admin = await requireAdminIdentity();
  if (admin.role !== "owner" && admin.role !== "publisher") {
    redirect("/admin/reviews?result=forbidden");
  }
  const id = String(formData.get("id") ?? "");
  const expected = String(formData.get("expected") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
      !statuses.has(expected) || !statuses.has(status) || expected === status) {
    redirect("/admin/reviews?result=invalid");
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/reviews?result=unavailable");
  }
  const { data, error } = await supabase.from("customer_reviews")
    .update({ status }).eq("id", id).eq("status", expected).select("id");
  if (error) {
    redirect("/admin/reviews?result=unavailable");
  }
  if (data?.length !== 1) {
    redirect("/admin/reviews?result=conflict");
  }
  revalidatePath("/admin/reviews");
  for (const locale of ["pl", "es", "en"]) {
    revalidatePath(`/${locale}`);
  }
  redirect("/admin/reviews?result=saved");
}
