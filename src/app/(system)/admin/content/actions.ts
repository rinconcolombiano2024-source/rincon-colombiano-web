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


  redirectContent({
    success:
      "published",
  });
}
