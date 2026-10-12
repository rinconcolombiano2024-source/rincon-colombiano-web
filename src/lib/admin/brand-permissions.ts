import type { AdminRole } from "@/lib/admin/auth";

/**
 * Central brand authorization matrix.
 * - Owner: upload, publish, retire.
 * - Editor: upload drafts, never publish.
 * - Publisher: publish/retire reviewed assets, never upload.
 *
 * Every privileged Server Action must enforce these checks BEFORE
 * calling the service_role Supabase client.
 */
export function canUploadBrand(role: AdminRole): boolean {
  return role === "owner" || role === "editor";
}

export function canPublishBrand(role: AdminRole): boolean {
  return role === "owner" || role === "publisher";
}

export function canRetireBrand(role: AdminRole): boolean {
  return role === "owner" || role === "publisher";
}
