"use server";

import {
  revalidatePath,
  updateTag,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import {
  requireAdminIdentity,
  type AdminRole,
} from "@/lib/admin/auth";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";

import { getHomeSection, validHomeCmsCopy } from "@/config/home-cms";
import { SEO_EDITABLE_ROUTES, validPublishedSeo } from "@/config/seo-cms";


/* ============================================================
   CMS CONSTANTS
   ============================================================ */

const CMS_LOCALES = [
  "pl",
  "es",
  "en",
] as const;

const CMS_KINDS = [
  "page",
  "service",
  "story",
  "promotion",
  "testimonial",
  "article",
] as const;

type CmsLocale =
  (typeof CMS_LOCALES)[number];

type CmsKind =
  (typeof CMS_KINDS)[number];


const MAX_TITLE_LENGTH =
  200;

const MAX_BODY_LENGTH =
  180_000;

const MAX_CONTENT_KEY_LENGTH =
  120;


/* ============================================================
   COMMERCIALLY MANAGED CONTENT POLICY
   ============================================================ */

/**
 * Browser maxLength is only UX; malicious POSTs can ignore it.
 * Enforce the same length and document-kind limits on the server,
 * without changing the legacy/advanced CMS's other content types.
 *
 * This also protects editorial drafts created before these controls
 * when an owner/publisher later tries to publish them.
 */
function isValidManagedDocument(
  key: string,
  kind: string,
  title: string,
  body: string,
): boolean {
  const doc = { kind, title, body };
  if (SEO_EDITABLE_ROUTES.some((route) => route.key === key)) {
    return validPublishedSeo(key, doc);
  }
  const section = getHomeSection(key);
  return !section || validHomeCmsCopy(key, doc);
}

/* ============================================================
   ROLE POLICY
   ============================================================ */

function canEditContent(
  role:
    AdminRole,
): boolean {
  return (
    role ===
      "owner" ||
    role ===
      "editor"
  );
}


function canPublishContent(
  role:
    AdminRole,
): boolean {
  return (
    role ===
      "owner" ||
    role ===
      "publisher"
  );
}


/* ============================================================
   FORM HELPERS
   ============================================================ */

function readFormString(
  formData:
    FormData,
  field:
    string,
): string | null {

  const value =
    formData.get(
      field,
    );

  return typeof value ===
    "string"
    ? value
    : null;
}


function isCmsLocale(
  value:
    string,
): value is CmsLocale {
  return CMS_LOCALES.some(
    (
      locale,
    ) =>
      locale ===
        value,
  );
}


function isCmsKind(
  value:
    string,
): value is CmsKind {
  return CMS_KINDS.some(
    (
      kind,
    ) =>
      kind ===
        value,
  );
}


function isValidContentKey(
  value:
    string,
): boolean {
  return (
    value.length >=
      1 &&
    value.length <=
      MAX_CONTENT_KEY_LENGTH &&
    /^[a-z0-9][a-z0-9_-]*$/.test(
      value,
    )
  );
}


function parseRevision(
  value:
    string | null,
): number | null {

  if (
    value ===
      null ||
    value.trim().length ===
      0
  ) {
    return null;
  }

  const parsed =
    Number(
      value,
    );

  if (
    !Number.isSafeInteger(
      parsed,
    ) ||
    parsed <
      1
  ) {
    return null;
  }

  return parsed;
}


/* ============================================================
   REDIRECT
   ============================================================ */

function redirectContent(
  parameters:
    Readonly<
      Record<
        string,
        string
      >
    >,
): never {

  const searchParams =
    new URLSearchParams(
      parameters,
    );

  redirect(
    `/admin/content?${searchParams.toString()}`,
  );
}


/* ============================================================
   SAVE DRAFT
   ============================================================ */

export async function saveContentDraft(
  formData:
    FormData,
): Promise<void> {

  const admin =
    await requireAdminIdentity();


  if (
    !canEditContent(
      admin.role,
    )
  ) {
    redirectContent({
      error:
        "forbidden",
    });
  }


  /* ========================================================
     INPUT
     ======================================================== */

  const rawContentKey =
    readFormString(
      formData,
      "contentKey",
    );

  const rawLocale =
    readFormString(
      formData,
      "locale",
    );

  const rawKind =
    readFormString(
      formData,
      "kind",
    );

  const rawTitle =
    readFormString(
      formData,
      "title",
    );

  const rawBody =
    readFormString(
      formData,
      "body",
    );

  const rawExpectedRevision =
    readFormString(
      formData,
      "expectedRevision",
    );


  if (
    rawContentKey ===
      null ||
    rawLocale ===
      null ||
    rawKind ===
      null ||
    rawTitle ===
      null ||
    rawBody ===
      null
  ) {
    redirectContent({
      error:
        "missing",
    });
  }


  const contentKey =
    rawContentKey
      .trim()
      .toLowerCase();

  const title =
    rawTitle.trim();

  const body =
    rawBody.trim();


  /* ========================================================
     VALIDATION
     ======================================================== */

  if (
    !isValidContentKey(
      contentKey,
    )
  ) {
    redirectContent({
      error:
        "invalid-key",
    });
  }


  if (
    !isCmsLocale(
      rawLocale,
    )
  ) {
    redirectContent({
      error:
        "invalid-locale",
    });
  }


  if (
    !isCmsKind(
      rawKind,
    )
  ) {
    redirectContent({
      error:
        "invalid-kind",
    });
  }


  if (
    title.length <
      1 ||
    title.length >
      MAX_TITLE_LENGTH
  ) {
    redirectContent({
      error:
        "invalid-title",
    });
  }


  if (
    body.length <
      1 ||
    body.length >
      MAX_BODY_LENGTH
  ) {
    redirectContent({
      error:
        "invalid-body",
    });
  }


  if (!isValidManagedDocument(contentKey, rawKind, title, body)) {
    redirectContent({
      error: "invalid-managed-content",
    });
  }

  const expectedRevision =
    parseRevision(
      rawExpectedRevision,
    );


  /* ========================================================
     SUPABASE SESSION CLIENT
     ======================================================== */

  const supabase =
    await createSupabaseServerClient();


  if (
    !supabase
  ) {
    redirectContent({
      error:
        "configuration",
    });
  }


  /* ========================================================
     EXISTING DRAFT
     ======================================================== */

  const {
    data:
      existing,

    error:
      existingError,
  } =
    await supabase
      .from(
        "web_cms_drafts",
      )
      .select(
        "id, kind, revision",
      )
      .eq(
        "content_key",
        contentKey,
      )
      .eq(
        "locale",
        rawLocale,
      )
      .maybeSingle();


  if (
    existingError
  ) {
    redirectContent({
      error:
        "read",
    });
  }


  const document = {
    title,
    body,
  };


  /* ========================================================
     UPDATE EXISTING
     ======================================================== */

  if (
    existing
  ) {

    const currentRevision =
      Number(
        existing.revision,
      );


    if (
      existing.kind !==
        rawKind
    ) {
      redirectContent({
        error:
          "kind-conflict",
      });
    }


    /*
     * Optimistic concurrency.
     *
     * Evita que dos administradores sobrescriban cambios
     * realizados simultáneamente.
     */
    if (
      expectedRevision ===
        null ||
      expectedRevision !==
        currentRevision
    ) {
      redirectContent({
        error:
          "conflict",
      });
    }


    const {
      data:
        updated,

      error:
        updateError,
    } =
      await supabase
        .from(
          "web_cms_drafts",
        )
        .update({
          document,
        })
        .eq(
          "id",
          existing.id,
        )
        .eq(
          "revision",
          expectedRevision,
        )
        .select(
          "id, revision",
        )
        .maybeSingle();


    if (
      updateError
    ) {
      redirectContent({
        error:
          "save",
      });
    }


    if (
      !updated
    ) {
      redirectContent({
        error:
          "conflict",
      });
    }
  }


  /* ========================================================
     CREATE NEW
     ======================================================== */

  else {

    /*
     * Un registro inexistente no debe recibir una revisión
     * esperada de un documento anterior.
     */
    if (
      expectedRevision !==
        null
    ) {
      redirectContent({
        error:
          "conflict",
      });
    }


    const {
      error:
        insertError,
    } =
      await supabase
        .from(
          "web_cms_drafts",
        )
        .insert({
          content_key:
            contentKey,

          locale:
            rawLocale,

          kind:
            rawKind,

          document,
        });


    if (
      insertError
    ) {
      redirectContent({
        error:
          "save",
      });
    }
  }


  /* ========================================================
     REVALIDATION
     ======================================================== */

  revalidatePath(
    "/admin/content",
  );


  // Preserve the marketing workflow when saving its campaign draft.
  // Fixed destination: never redirect to a user-controlled URL.
  if (
    contentKey === "home_campaign" &&
    readFormString(formData, "returnTo") === "marketing"
  ) {
    redirect("/admin/marketing?status=saved");
  }

  if (contentKey.startsWith("home_") &&
    readFormString(formData, "returnTo") === "home") {
    redirect(`/admin/home?locale=${rawLocale}&status=saved`);
  }

  if (readFormString(formData, "returnTo") === "seo" &&
    ["home_seo", "menu_seo", "location_czapelska_seo"].includes(contentKey)) {
    redirect(`/admin/seo?locale=${rawLocale}&status=saved`);
  }

  redirectContent({
    success:
      "saved",

    key:
      contentKey,

    locale:
      rawLocale,
  });
}


/* ============================================================
   PUBLISH
   ============================================================ */

export async function publishContentDraft(
  formData:
    FormData,
): Promise<void> {

  const admin =
    await requireAdminIdentity();


  if (
    !canPublishContent(
      admin.role,
    )
  ) {
    redirectContent({
      error:
        "forbidden",
    });
  }


  const draftId =
    readFormString(
      formData,
      "draftId",
    )
      ?.trim() ??
    "";


  const expectedRevision =
    parseRevision(
      readFormString(
        formData,
        "expectedRevision",
      ),
    );


  if (
    draftId.length ===
      0 ||
    expectedRevision ===
      null
  ) {
    redirectContent({
      error:
        "invalid-publish",
    });
  }


  const supabase =
    await createSupabaseServerClient();


  if (
    !supabase
  ) {
    redirectContent({
      error:
        "configuration",
    });
  }


  // Before publication validate older or externally-written drafts too.
  // Only a genuine admin session can query these RLS-protected rows.
  const { data: draft, error: draftError } = await supabase
    .from("web_cms_drafts")
    .select("content_key,kind,document,revision")
    .eq("id", draftId)
    .maybeSingle();

  if (draftError || !draft) {
    redirectContent({ error: "read" });
  }

  const managedKey = String(draft.content_key ?? "");
  if (SEO_EDITABLE_ROUTES.some((route) => route.key === managedKey) ||
      getHomeSection(managedKey)) {
    const source = draft.document;
    const sourceTitle = source && typeof source === "object" &&
      !Array.isArray(source) && typeof source.title === "string"
      ? source.title.trim() : "";
    const sourceBody = source && typeof source === "object" &&
      !Array.isArray(source) && typeof source.body === "string"
      ? source.body.trim() : "";

    if (Number(draft.revision) !== expectedRevision) {
      redirectContent({ error: "conflict" });
    }
    if (!isValidManagedDocument(managedKey, String(draft.kind ?? ""), sourceTitle, sourceBody)) {
      redirectContent({ error: "invalid-managed-content" });
    }
  }

  const {
    error,
  } =
    await supabase
      .rpc(
        "web_cms_publish",
        {
          p_draft_id:
            draftId,

          p_expected_revision:
            expectedRevision,
        },
      );


  if (
    error
  ) {

    if (
      error.code ===
        "40001"
    ) {
      redirectContent({
        error:
          "conflict",
      });
    }


    redirectContent({
      error:
        "publish",
    });
  }


  /*
   * Actualmente la home todavía utiliza contenido en código,
   * pero ya revalidamos estas rutas para que el siguiente paso
   * pueda conectar web_cms_published sin cambiar esta acción.
   */
  updateTag(
  "web-cms",
);
  revalidatePath(
    "/admin/content",
  );

  revalidatePath(
    "/pl",
  );

  revalidatePath(
    "/es",
  );

  revalidatePath(
    "/en",
  );

  // Metadata for menu and the open restaurant is generated on these
  // routes independently from /pl, /es, /en home pages. Invalidate
  // all language siblings after approved SEO publication.
  if (managedKey === "menu_seo") {
    for (const lang of CMS_LOCALES) {
      revalidatePath(`/${lang}/menu`);
    }
  } else if (managedKey === "location_czapelska_seo") {
    revalidatePath("/pl/lokale/czapelska");
    revalidatePath("/es/restaurantes/czapelska");
    revalidatePath("/en/locations/czapelska");
  }

  revalidatePath("/admin/home");
  revalidatePath("/admin/seo");

  if (readFormString(formData, "returnTo") === "marketing") {
    redirect("/admin/marketing?status=published");
  }

  if (readFormString(formData, "returnTo") === "home") {
    const preferredLocale = readFormString(formData, "locale");
    if (preferredLocale && isCmsLocale(preferredLocale)) {
      redirect(`/admin/home?locale=${preferredLocale}&status=published`);
    }
    redirect("/admin/home?status=published");
  }

  if (readFormString(formData, "returnTo") === "seo") {
    const preferredLocale = readFormString(formData, "locale");
    if (preferredLocale && isCmsLocale(preferredLocale)) {
      redirect(`/admin/seo?locale=${preferredLocale}&status=published`);
    }
    redirect("/admin/seo?status=published");
  }

  redirectContent({
    success:
      "published",
  });
}
