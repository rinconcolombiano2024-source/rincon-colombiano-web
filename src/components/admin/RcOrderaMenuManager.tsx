"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Image from "next/image";
import {
  addMenuProduct,
  duplicateMenuProductDraft,
  addMenuCategory,
  removeEmptyMenuCategory,
  removeMenuProduct,
  restoreUnpublishedMenuDraft,
  detectProductImageMime,
  getProductTranslation,
  getMenuLocalePreview,
  auditMenuTranslations,
  hasUnappliedProductChanges,
  hasUnappliedNewProductFields,
  isSafeMenuRevision,
  areMenuSnapshotsEqual,
  menuDraftFingerprint,
  classifyMenuSaveOutcome,
  menuProductCount,
  searchMenuProducts,
  summarizeMenuChanges,
  undoMenuProductChange,
  normalizeMenu,
  updateProduct,
  validProductImageUrl,
  type RcEditableMenu,
  type RcMenuProduct,
  type RcProductUpdate,
  type RcProductTranslation,
  type RcProductTranslationUpdates,
  type RcTranslationLocale,
} from "@/integrations/rc-ordera/menu-editor-utils";

type EditorConfig = {
  readonly supabaseUrl: string;
  readonly anonKey: string;
  readonly restaurantId: string;
};

interface Snapshot {
  readonly menu: RcEditableMenu;
  readonly revision: number;
}

function createEphemeralClient(config: EditorConfig): SupabaseClient {
  return createClient(config.supabaseUrl, config.anonKey, {
    auth: {
      // RC ORDERA authentication is independent of Web administration.
      // No tokens, refresh tokens or passwords in localStorage.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function loadSnapshot(client: SupabaseClient, ownerId: string): Promise<Snapshot> {
  // RLS: app_settings can be SELECTed only by auth.uid() = user_id.
  const { data, error } = await client
    .from("app_settings")
    .select("menu, menu_revision")
    .eq("user_id", ownerId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("No se pudo consultar el menú de la cuenta propietaria.");
  }
  const menu = normalizeMenu(data.menu);
  const revision = Number(data.menu_revision);
  if (!menu || !Number.isSafeInteger(revision) || revision < 0) {
    throw new Error("El menú de RC ORDERA no tiene un formato compatible. No se modificó ningún producto.");
  }
  return { menu, revision };
}

function downloadBackup(
  menu: RcEditableMenu,
  revision: number,
  restaurantId: string,
  unpublishedDraft = false,
): void {
  const backup = JSON.stringify({
    restaurantId,
    menuRevision: revision,
    exportedAt: new Date().toISOString(),
    status: unpublishedDraft ? "UNPUBLISHED_DRAFT" : "LAST_READ_SERVER_SNAPSHOT",
    menu,
  }, null, 2);
  const blob = new Blob([backup], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = unpublishedDraft
    ? `rc-ordera-UNPUBLISHED-draft-from-revision-${revision}.json`
    : `rc-ordera-menu-backup-revision-${revision}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

function ProductCard({
  product,
  busy,
  onApply,
  onUpload,
  onUnappliedChange,
}: {
  readonly product: RcMenuProduct;
  readonly busy: boolean;
  readonly onApply: (patch: RcProductUpdate) => boolean;
  readonly onUpload: (file: File) => Promise<string>;
  readonly onUnappliedChange: (hasChanges: boolean) => void;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(String(product.price));
  const [available, setAvailable] = useState(product.available);
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const [translations, setTranslations] = useState<Record<RcTranslationLocale, RcProductTranslation>>({
    pl: getProductTranslation(product, "pl"),
    es: getProductTranslation(product, "es"),
    en: getProductTranslation(product, "en"),
  });
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // A product form has a second, unsaved layer BEFORE its values enter the
  // RC ORDERA menu draft. Observe it so that changing product/category and
  // clicking "Guardar" never silently discards un-applied field edits.
  useEffect(() => {
    onUnappliedChange(hasUnappliedProductChanges(product, {
      name, description, priceText: price, available, imageUrl, translations,
    }));
  }, [product, name, description, price, available, imageUrl, translations, onUnappliedChange]);

  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(price.replace(",", "."));
    if (!name.trim() || name.length > 160 ||
      description.length > 3000 ||
      !Number.isFinite(value) || value < 0 || value > 9999 ||
      Math.abs(value * 100 - Math.round(value * 100)) >= 0.000001 ||
      !validProductImageUrl(imageUrl.trim())) {
      setUploadMessage("Revisa nombre, precio, descripción y dirección HTTPS de la fotografía.");
      return;
    }
    const translationUpdates: RcProductTranslationUpdates = {};
    for (const locale of ["pl", "es", "en"] as const) {
      const oldValue = getProductTranslation(product, locale);
      const next = translations[locale];
      if (next.name.length > 160 || next.description.length > 3000) {
        setUploadMessage("Las traducciones deben respetar los límites de nombre y descripción.");
        return;
      }
      if (oldValue.name !== next.name || oldValue.description !== next.description) {
        translationUpdates[locale] = next;
      }
    }
    const wasApplied = onApply({
      name: name.trim(),
      description,
      price: value,
      available,
      imageUrl: imageUrl.trim(),
      ...(Object.keys(translationUpdates).length > 0
        ? { translations: translationUpdates }
        : {}),
    });
    if (wasApplied) {
      onUnappliedChange(false);
      setUploadMessage("Cambios aplicados al borrador. Falta publicar con «Guardar en RC ORDERA».");
    } else {
      setUploadMessage("No se aplicaron los cambios. Consulta el error del editor.");
    }
  }

  async function upload(file: File | undefined) {
    if (!file) {
      return;
    }
    setUploading(true);
    setUploadMessage("");
    try {
      const url = await onUpload(file);
      setImageUrl(url);
      setUploadMessage("Fotografía subida. Aplica los cambios al borrador y después guarda el menú.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={apply} className="mt-5 grid gap-4 rounded-2xl border border-[#e4dccf] bg-[#faf9f6] p-5 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-bold" htmlFor="ordera-product-name">Nombre</label>
        <input id="ordera-product-name" required maxLength={160} value={name} disabled={busy || uploading}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-bold" htmlFor="ordera-product-price">Precio (PLN)</label>
        <input id="ordera-product-price" required inputMode="decimal" value={price} disabled={busy || uploading}
          onChange={(event) => setPrice(event.target.value)}
          className="mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-bold" htmlFor="ordera-product-desc">Descripción</label>
        <textarea id="ordera-product-desc" maxLength={3000} rows={3} value={description} disabled={busy || uploading}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm" />
      </div>
      <details className="rounded-xl border border-[#d9dfe9] bg-white p-4 sm:col-span-2">
        <summary className="cursor-pointer text-sm font-black text-[#123d73]">
          Traducciones de producto · Polski / Español / English
        </summary>
        <p className="mt-3 text-xs leading-6 text-[#62594f]">
          Edita los nombres y descripciones que utiliza RC ORDERA en cada idioma.
          Los textos vacíos permanecen vacíos; no inventamos traducciones automáticas.
          Las traducciones no se publican hasta guardar el menú con la cuenta propietaria.
        </p>
        <div className="mt-4 grid gap-4">
          {([
            { key: "pl", title: "Polski (Polonia)" },
            { key: "es", title: "Español (Colombia)" },
            { key: "en", title: "English (international)" },
          ] as const).map(({ key, title }) => (
            <fieldset key={key} className="rounded-lg border border-[#e4dccf] p-4">
              <legend className="px-2 text-sm font-black">{title}</legend>
              <label className="mt-2 block text-xs font-bold" htmlFor={`ordera-translation-name-${key}`}>
                Nombre del plato
              </label>
              <input id={`ordera-translation-name-${key}`}
                value={translations[key].name} maxLength={160} disabled={busy || uploading}
                onChange={(event) => setTranslations((current) => ({
                  ...current,
                  [key]: { ...current[key], name: event.target.value },
                }))}
                className="mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm" />
              <label className="mt-3 block text-xs font-bold" htmlFor={`ordera-translation-description-${key}`}>
                Descripción traducida
              </label>
              <textarea id={`ordera-translation-description-${key}`} rows={2}
                maxLength={3000} disabled={busy || uploading}
                value={translations[key].description}
                onChange={(event) => setTranslations((current) => ({
                  ...current,
                  [key]: { ...current[key], description: event.target.value },
                }))}
                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm" />
            </fieldset>
          ))}
        </div>
      </details>
      <div className="sm:col-span-2">
        <label className="block text-sm font-bold" htmlFor="ordera-product-image">URL HTTPS de fotografía</label>
        <input id="ordera-product-image" type="url" maxLength={1600} value={imageUrl} disabled={busy || uploading}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://…" className="mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm" />
        <label className="mt-3 block text-sm font-bold" htmlFor="ordera-image-upload">
          O subir fotografía del producto (JPG, PNG o WebP, máximo 2 MB)
        </label>
        <input id="ordera-image-upload" type="file" accept="image/jpeg,image/png,image/webp"
          disabled={busy || uploading}
          onChange={(event) => {
            void upload(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
          className="mt-2 block w-full rounded-xl border bg-white p-2 text-sm" />
        {imageUrl.trim() && validProductImageUrl(imageUrl.trim()) ? (
          <div className="mt-4 rounded-xl border border-[#d9dfe9] bg-white p-3" aria-label="Fotografía pendiente de aplicar">
            <p className="mb-2 text-xs font-bold text-[#123d73]">Vista previa de fotografía · todavía sin aplicar</p>
            <Image src={imageUrl.trim()} alt={`Fotografía propuesta: ${name}`}
              width={240} height={180} unoptimized loading="lazy" referrerPolicy="no-referrer"
              className="h-auto max-h-44 w-auto max-w-full rounded-lg object-contain" />
          </div>
        ) : imageUrl.trim() ? (
          <p className="mt-2 text-xs font-semibold text-red-800" role="alert">
            La dirección de fotografía no es una URL HTTPS válida.
          </p>
        ) : null}
      </div>
      <label className="flex items-center gap-3 text-sm font-bold">
        <input type="checkbox" checked={available} disabled={busy || uploading}
          onChange={(event) => setAvailable(event.target.checked)} className="size-5 accent-[#123d73]" />
        Disponible para clientes
      </label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={busy || uploading}
          className="inline-flex min-h-11 items-center rounded-full bg-[#123d73] px-5 text-sm font-black text-white disabled:opacity-50">
          Aplicar al borrador
        </button>
        <p role="status" className="text-xs leading-5 text-[#62594f]">{uploadMessage}</p>
      </div>
    </form>
  );
}

function readNewProductTranslations(values: FormData): RcProductTranslationUpdates {
  const translations: RcProductTranslationUpdates = {};
  for (const locale of ["pl", "es", "en"] as const) {
    const name = String(values.get(`translation-${locale}-name`) ?? "").trim();
    const description = String(values.get(`translation-${locale}-description`) ?? "").trim();
    if (name || description) {
      translations[locale] = { name, description };
    }
  }
  return translations;
}

function newProductFormHasInput(form: HTMLFormElement): boolean {
  const values = new FormData(form);
  return hasUnappliedNewProductFields({
    name: String(values.get("name") ?? ""),
    description: String(values.get("description") ?? ""),
    priceText: String(values.get("price") ?? ""),
    station: String(values.get("station") ?? "kitchen"),
    translations: readNewProductTranslations(values),
  });
}

function AddProductForm({
  busy,
  onCreate,
  onUnappliedChange,
}: {
  readonly busy: boolean;
  readonly onUnappliedChange: (dirty: boolean) => void;
  readonly onCreate: (fields: {
    name: string;
    description: string;
    price: number;
    station: "kitchen" | "bar";
    translations: RcProductTranslationUpdates;
  }) => boolean;
}) {
  function create(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const rawPrice = String(fields.get("price") ?? "").trim().replace(",", ".");
    const price = Number(rawPrice);
    const station = fields.get("station") === "bar" ? "bar" : "kitchen";
    const success = onCreate({
      name: String(fields.get("name") ?? "").trim(),
      description: String(fields.get("description") ?? "").trim(),
      price,
      station,
      translations: readNewProductTranslations(fields),
    });
    if (success) {
      form.reset();
      onUnappliedChange(false);
    }
  }

  return (
    <form onSubmit={create}
      onInput={(event) => onUnappliedChange(newProductFormHasInput(event.currentTarget))}
      onChange={(event) => onUnappliedChange(newProductFormHasInput(event.currentTarget))}
      className="mt-4 grid gap-3 rounded-2xl bg-[#faf9f6] p-5 sm:grid-cols-2">
      <div>
        <label htmlFor="ordera-new-name" className="block text-sm font-bold">Nuevo producto</label>
        <input id="ordera-new-name" name="name" required maxLength={160} disabled={busy}
          placeholder="Nombre del plato" className="mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="ordera-new-price" className="block text-sm font-bold">Precio en PLN</label>
        <input id="ordera-new-price" name="price" type="number" inputMode="decimal"
          required min="0" max="9999" step="0.01" disabled={busy}
          className="mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="ordera-new-description" className="block text-sm font-bold">
          Descripción del nuevo producto
        </label>
        <textarea id="ordera-new-description" name="description" maxLength={3000}
          rows={2} disabled={busy}
          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm" />
      </div>
      <details className="rounded-xl border border-[#d9dfe9] bg-white p-4 sm:col-span-2">
        <summary className="cursor-pointer text-sm font-black text-[#123d73]">
          Traducciones del producto nuevo · Polski / Español / English
        </summary>
        <p className="mt-3 text-xs text-[#62594f]">
          Puedes crear las tres traducciones ahora mismo. Si dejas un idioma vacío
          aparecerá el texto original; el sistema no inventa traducciones.
          También puedes modificar estos campos antes de publicar el menú.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {([
            { locale: "pl", label: "Polski" },
            { locale: "es", label: "Español" },
            { locale: "en", label: "English" },
          ] as const).map(({ locale, label }) => (
            <fieldset key={locale} className="min-w-0 rounded-xl border border-[#e4dccf] p-3">
              <legend className="px-2 text-sm font-black">{label}</legend>
              <label htmlFor={`ordera-new-translation-name-${locale}`}
                className="block text-xs font-bold">Nombre traducido</label>
              <input id={`ordera-new-translation-name-${locale}`}
                name={`translation-${locale}-name`} maxLength={160} disabled={busy}
                className="mt-2 min-h-11 w-full rounded-lg border px-3 py-2 text-sm" />
              <label htmlFor={`ordera-new-translation-description-${locale}`}
                className="mt-3 block text-xs font-bold">Descripción traducida</label>
              <textarea id={`ordera-new-translation-description-${locale}`}
                name={`translation-${locale}-description`} maxLength={3000}
                rows={2} disabled={busy}
                className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
            </fieldset>
          ))}
        </div>
      </details>
      <div>
        <label htmlFor="ordera-new-station" className="block text-sm font-bold">
          Estación de preparación
        </label>
        <select id="ordera-new-station" name="station" disabled={busy}
          className="mt-2 min-h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm">
          <option value="kitchen">Cocina</option>
          <option value="bar">Bar / bebidas</option>
        </select>
      </div>
      <button type="submit" disabled={busy}
        className="inline-flex min-h-11 items-center justify-center self-end rounded-full bg-[#123d73] px-5 text-sm font-black text-white disabled:opacity-50">
        + Agregar al borrador
      </button>
    </form>
  );
}

/**
 * Two separate authorization domains:
 * 1) Next.js server requires an approved Web administrator.
 * 2) RC ORDERA directly authenticates its own restaurant OWNER,
 *    and the existing database RLS and RPC verify ownership.
 *
 * No shared secret/service_role; no cross-project token substitution.
 */
export default function RcOrderaMenuManager({ config }: { readonly config: EditorConfig }) {
  const [client] = useState(() => createEphemeralClient(config));
  const [connected, setConnected] = useState(false);
  const [original, setOriginal] = useState<RcEditableMenu | null>(null);
  const [draft, setDraft] = useState<RcEditableMenu | null>(null);
  const [revision, setRevision] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [translationReviewLocale, setTranslationReviewLocale] = useState<"pl" | "en" | null>(null);
  const [translationReviewPage, setTranslationReviewPage] = useState(0);
  const [productId, setProductId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const [pendingLogout, setPendingLogout] = useState(false);
  const [pendingReload, setPendingReload] = useState(false);
  const [reviewedDraftFingerprint, setReviewedDraftFingerprint] = useState<string | null>(null);
  const [verificationUncertain, setVerificationUncertain] = useState(false);
  // ProductCard holds controlled input state; a successful server
  // refresh must replace its inputs even when the selected ID is unchanged.
  const [serverSnapshotEpoch, setServerSnapshotEpoch] = useState(0);
  const [unappliedChanges, setUnappliedChanges] = useState(false);
  const [newProductFormDirty, setNewProductFormDirty] = useState(false);
  // Category title keystrokes belong to a third unsaved form. Treat them
  // as pending independently of the product and new-product inputs.
  const hasUnappliedInputs = unappliedChanges || newProductFormDirty ||
    newCategoryName.trim().length > 0;
  const reportUnappliedChanges = useCallback((hasChanges: boolean) => {
    setUnappliedChanges(hasChanges);
  }, []);
  const unappliedWarning = unappliedChanges
    ? "Primero pulsa «Aplicar al borrador» en el producto; hay datos editados sin aplicar."
    : newProductFormDirty
      ? "Tienes campos escritos en «Crear producto». Pulsa «Agregar al borrador» o borra esos datos antes de continuar."
      : "Tienes escrito el nombre de una nueva categoría. Pulsa «Crear categoría» o borra esos datos antes de continuar.";

  async function authenticate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    form.reset();
    setBusy(true);
    setErrorMessage("");
    try {
      const { data: auth, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !auth.user || auth.user.id !== config.restaurantId) {
        await client.auth.signOut();
        throw new Error("Es necesario iniciar sesión con la cuenta propietaria de esta sede en RC ORDERA.");
      }
      const snapshot = await loadSnapshot(client, config.restaurantId);
      setOriginal(snapshot.menu);
      setDraft(snapshot.menu);
      setRevision(snapshot.revision);
      setCategory(Object.keys(snapshot.menu)[0] ?? "");
      setNewCategoryName("");
      setProductSearch("");
      setProductId("");
      setServerSnapshotEpoch((value) => value + 1);
      setConnected(true);
      setNewProductFormDirty(false);
      setReviewedDraftFingerprint(null);
      setVerificationUncertain(false);
      setMessage("Conexión autorizada con RC ORDERA. Descarga la copia de seguridad antes de editar.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo autenticar la cuenta propietaria.");
      setConnected(false);
      setDraft(null);
      setOriginal(null);
      setRevision(null);
      setNewProductFormDirty(false);
      setReviewedDraftFingerprint(null);
      setVerificationUncertain(false);
      await client.auth.signOut().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  async function logout(force = false) {
    // Guard both unsaved form fields AND applied-but-unpublished menu edits.
    if (!force && (hasUnappliedInputs ||
      (original && draft && !areMenuSnapshotsEqual(original, draft)))) {
      setPendingLogout(true);
      return;
    }
    setPendingLogout(false);
    setUnappliedChanges(false);
    setNewProductFormDirty(false);
    setReviewedDraftFingerprint(null);
    setVerificationUncertain(false);
    setBusy(true);
    try {
      await client.auth.signOut();
    } finally {
      setConnected(false);
      setDraft(null);
      setOriginal(null);
      setRevision(null);
      setCategory("");
      setNewCategoryName("");
      setProductSearch("");
      setProductId("");
      setServerSnapshotEpoch((value) => value + 1);
      setMessage("");
      setBusy(false);
    }
  }

  async function reload(force = false) {
    if (!force && (hasUnappliedInputs ||
      (original && draft && !areMenuSnapshotsEqual(original, draft)))) {
      setPendingReload(true);
      return;
    }
    setPendingReload(false);
    setPendingRemoval(null);
    setBusy(true);
    setErrorMessage("");
    try {
      const current = await loadSnapshot(client, config.restaurantId);
      setOriginal(current.menu);
      setDraft(current.menu);
      setRevision(current.revision);
      setUnappliedChanges(false);
      setNewProductFormDirty(false);
      setReviewedDraftFingerprint(null);
      setVerificationUncertain(false);
      setProductId("");
      setCategory(Object.keys(current.menu)[0] ?? "");
      setNewCategoryName("");
      setProductSearch("");
      setServerSnapshotEpoch((value) => value + 1);
      setMessage("Menú actualizado con la versión más reciente de RC ORDERA.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo actualizar el menú.");
    } finally {
      setBusy(false);
    }
  }

  async function importDraftFile(file: File | undefined): Promise<void> {
    if (!file || !connected || !original || revision === null || busy) { return; }
    if (hasUnappliedInputs ||
      (draft && !areMenuSnapshotsEqual(original, draft))) {
      setErrorMessage("Primero guarda, descarta o aplica los cambios pendientes antes de recuperar otro borrador.");
      return;
    }
    if (verificationUncertain) {
      setErrorMessage("Hay un guardado no verificado. Recarga desde RC ORDERA antes de restaurar un borrador.");
      return;
    }
    if (file.size < 1 || file.size > 5 * 1024 * 1024) {
      setErrorMessage("El borrador debe ser un archivo JSON de máximo 5 MB.");
      return;
    }
    setBusy(true);
    setErrorMessage("");
    try {
      const raw = await file.text();
      const parsed: unknown = JSON.parse(raw);
      // Confirm the owner-scoped database snapshot has not advanced between
      // downloading the draft and restoring it, before any local edit occurs.
      const current = await loadSnapshot(client, config.restaurantId);
      if (current.revision !== revision ||
        !areMenuSnapshotsEqual(current.menu, original)) {
        throw new Error("RC ORDERA cambió desde la última consulta. Descarga el borrador y recarga el menú antes de recuperar.");
      }
      const restored = restoreUnpublishedMenuDraft(parsed, current.menu, current.revision, config.restaurantId);
      setOriginal(current.menu);
      setDraft(restored);
      setRevision(current.revision);
      setCategory(Object.keys(restored)[0] ?? "");
      setProductId("");
      setProductSearch("");
      setNewCategoryName("");
      setUnappliedChanges(false);
      setNewProductFormDirty(false);
      setServerSnapshotEpoch((epoch) => epoch + 1);
      setReviewedDraftFingerprint(null);
      setMessage("Borrador recuperado localmente. Revisa TODOS los cambios antes de confirmar y publicar en RC ORDERA.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo recuperar el borrador. No se cambió RC ORDERA.");
    } finally {
      setBusy(false);
    }
  }

  function createCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || !original || busy || !connected) { return; }
    // This form itself owns newCategoryName; only OTHER unsaved forms block
    // submitting it. The pending title is cleared on a successful addition.
    if (unappliedChanges || newProductFormDirty) { setErrorMessage(unappliedWarning); return; }
    try {
      const next = addMenuCategory(draft, newCategoryName);
      if (!isSafeMenuRevision(original, next)) {
        throw new Error("Sólo puedes añadir una categoría por guardado. Publica primero la anterior.");
      }
      const name = Object.keys(next).find((item) => !Object.hasOwn(draft, item));
      if (!name) { throw new Error("No se pudo determinar la nueva categoría."); }
      setDraft(next);
      setCategory(name);
      setProductId("");
      setNewCategoryName("");
      setErrorMessage("");
      setMessage("Categoría añadida al borrador. Agrega productos o guarda en RC ORDERA.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Categoría no válida.");
    }
  }

  function removeCategory() {
    if (!draft || !original || busy || !connected) { return; }
    if (hasUnappliedInputs) { setErrorMessage(unappliedWarning); return; }
    try {
      const next = removeEmptyMenuCategory(draft, activeCategory);
      if (!isSafeMenuRevision(original, next)) {
        throw new Error("Sólo se puede retirar una categoría vacía por guardado.");
      }
      setDraft(next);
      setCategory(Object.keys(next)[0] ?? "");
      setProductId("");
      setPendingRemoval(null);
      setErrorMessage("");
      setMessage("Categoría vacía retirada del borrador. No cambia RC ORDERA hasta guardar.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo retirar la categoría.");
    }
  }

  function addProduct(fields: {
    name: string;
    description: string;
    price: number;
    station: "kitchen" | "bar";
    translations: RcProductTranslationUpdates;
  }): boolean {
    if (!draft || !original || busy || !connected) {
      return false;
    }
    if (unappliedChanges) {
      setErrorMessage(unappliedWarning);
      return false;
    }
    try {
      const id = `prod-web-${crypto.randomUUID()}`;
      const candidate = addMenuProduct(draft, activeCategory, { ...fields, id });
      if (!isSafeMenuRevision(original, candidate)) {
        throw new Error("Máximo tres productos nuevos por guardado. Guarda los anteriores primero.");
      }
      setDraft(candidate);
      setProductId(id);
      setErrorMessage("");
      setMessage("Nuevo producto añadido al borrador. Revisa sus datos y guarda en RC ORDERA.");
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No fue posible agregar el producto.");
      return false;
    }
  }

  function duplicateProduct(product: RcMenuProduct): void {
    if (!draft || !original || !connected || busy) { return; }
    if (hasUnappliedInputs) { setErrorMessage(unappliedWarning); return; }
    if (verificationUncertain) {
      setErrorMessage("Hay un guardado sin verificar. Recarga RC ORDERA antes de duplicar productos.");
      return;
    }
    try {
      const newId = `prod-web-${crypto.randomUUID()}`;
      const candidate = duplicateMenuProductDraft(draft, activeCategory, product.id, newId);
      if (!isSafeMenuRevision(original, candidate)) {
        throw new Error("Límite de tres productos nuevos por guardado. Publica los pendientes antes de duplicar.");
      }
      // No write takes place: the copy is a NEW, unavailable product and
      // cannot be ordered until the owner explicitly reviews and publishes.
      setDraft(candidate);
      setProductId(newId);
      setServerSnapshotEpoch((epoch) => epoch + 1);
      setReviewedDraftFingerprint(null);
      setPendingRemoval(null);
      setMessage("Copia creada sólo en el borrador y marcada agotada. Cambia su nombre, fotografía, precio y traducciones; revisa y confirma antes de publicar.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo duplicar el plato.");
    }
  }

  function deleteProduct(product: RcMenuProduct): void {
    if (!draft || !original || busy || !connected) {
      return;
    }
    if (hasUnappliedInputs) {
      setErrorMessage(unappliedWarning);
      return;
    }
    setPendingRemoval(product.id);
  }

  function confirmRemoval(product: RcMenuProduct): void {
    if (!draft || !original || busy || !connected || pendingRemoval !== product.id) {
      return;
    }
    try {
      const candidate = removeMenuProduct(draft, activeCategory, product.id);
      if (!isSafeMenuRevision(original, candidate)) {
        throw new Error("Por seguridad, sólo se permite eliminar un producto por guardado.");
      }
      setDraft(candidate);
      setProductId("");
      setPendingRemoval(null);
      setMessage("Producto retirado del borrador local. Confirma con Guardar en RC ORDERA.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar el producto.");
    }
  }

  function undoProduct(categoryName: string, id: string): void {
    if (!original || !draft || busy || !connected) { return; }
    if (hasUnappliedInputs) { setErrorMessage(unappliedWarning); return; }
    try {
      const next = undoMenuProductChange(original, draft, categoryName, id);
      setDraft(next);
      setCategory(categoryName);
      setProductId(next[categoryName]?.some((item) => item.id === id) ? id : "");
      setServerSnapshotEpoch((value) => value + 1);
      setReviewedDraftFingerprint(null);
      setPendingRemoval(null);
      setMessage("Cambio deshecho sólo en el borrador. El resto de productos sigue intacto.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo deshacer el producto.");
    }
  }

  function toggleAvailability(categoryName: string, id: string): void {
    if (!original || !draft || busy || !connected) { return; }
    if (hasUnappliedInputs) { setErrorMessage(unappliedWarning); return; }
    if (verificationUncertain) {
      setErrorMessage("Recarga el menú desde RC ORDERA antes de editar: hay una publicación sin verificar.");
      return;
    }
    try {
      const current = draft[categoryName]?.find((item) => item.id === id);
      if (!current) { throw new Error("El producto ya no existe en esta categoría."); }
      // A stock toggle ONLY edits the owner-reviewed local draft; no RPC,
      // order mutation, payment, station or price change is made here.
      const next = updateProduct(draft, categoryName, id, { available: !current.available });
      if (!isSafeMenuRevision(original, next)) {
        throw new Error("RC ORDERA rechazó la estructura del borrador. Recarga antes de continuar.");
      }
      setDraft(next);
      setCategory(categoryName);
      setProductId(id);
      // Force a fresh ProductCard. Otherwise its controlled checkbox could
      // retain the OLD availability and accidentally undo the quick change.
      setServerSnapshotEpoch((epoch) => epoch + 1);
      setReviewedDraftFingerprint(null);
      setPendingRemoval(null);
      setErrorMessage("");
      setMessage(
        `«${current.name}» marcado como ${current.available ? "agotado" : "disponible"} sólo en el borrador. Revisa y confirma para publicar.`,
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo cambiar la disponibilidad.");
    }
  }

  function patchProduct(id: string, data: RcProductUpdate): boolean {
    if (!draft || busy) {
      return false;
    }
    try {
      // Use the actually displayed category; stale category state must never
      // redirect a draft edit to another product of the same ID.
      setDraft(updateProduct(draft, activeCategory, id, data));
      setMessage("Producto cambiado en el borrador local, aún no publicado.");
      setErrorMessage("");
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Producto inválido");
      return false;
    }
  }

  async function uploadImage(file: File, selectedProductId: string): Promise<string> {
    if (busy || !connected) {
      throw new Error("Espera a que termine la operación anterior.");
    }
    if (file.size === 0 || file.size > 2 * 1024 * 1024) {
      throw new Error("Imagen demasiado grande. Máximo 2 MB.");
    }
    // Lock all product selectors and actions while an upload is running.
    // Otherwise the user can select another product halfway through an
    // asynchronous upload and silently orphan or misapply its photo.
    setBusy(true);
    try {
      const mime = detectProductImageMime(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
      if (!mime) {
        throw new Error("La imagen no tiene una firma válida JPG, PNG o WebP.");
      }

      const extension = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
      const safeId = selectedProductId.replace(/[^a-z0-9_-]/gi, "-").slice(0, 90);
      const path = `${config.restaurantId}/products/${safeId}-${crypto.randomUUID()}.${extension}`;
      // Storage RLS: only the owner can insert to auth.uid()/products.
      const result = await client.storage.from("restaurant-media").upload(path, file, {
        contentType: mime,
        cacheControl: "31536000",
        upsert: false,
      });
      if (result.error) {
        throw new Error("Storage rechazó la imagen. Comprueba permisos de RC ORDERA.");
      }
      const url = client.storage.from("restaurant-media").getPublicUrl(path).data.publicUrl;
      if (!validProductImageUrl(url)) {
        throw new Error("Storage no devolvió una URL pública segura.");
      }
      return url;
    } finally {
      setBusy(false);
    }
  }

  function reviewSave() {
    if (!original || !draft || revision === null || busy || verificationUncertain) {
      setErrorMessage("Primero recarga el menú desde RC ORDERA para verificar su estado.");
      return;
    }
    if (hasUnappliedInputs) { setErrorMessage(unappliedWarning); return; }
    if (menuChanges.length > 100) {
      setErrorMessage("Hay más de 100 cambios. Publica primero un lote pequeño para revisar cada modificación.");
      return;
    }
    if (!isSafeMenuRevision(original, draft) || menuProductCount(draft) === 0) {
      setErrorMessage("Edición bloqueada: el menú tiene productos o categorías inválidos.");
      return;
    }
    if (areMenuSnapshotsEqual(original, draft)) {
      setMessage("No hay cambios pendientes de publicación.");
      return;
    }
    setReviewedDraftFingerprint(menuDraftFingerprint(draft, revision));
    setErrorMessage("");
    setMessage("Revisa el resumen de cambios. Confirma la publicación sólo cuando los datos sean correctos.");
  }

  async function save() {
    if (!original || !draft || revision === null || busy) {
      return;
    }
    if (verificationUncertain) {
      setErrorMessage("No se conoce el estado del último guardado. Recarga desde RC ORDERA antes de publicar de nuevo.");
      return;
    }
    if (!readyToPublish) {
      setErrorMessage("El borrador ha cambiado. Revisa de nuevo el resumen antes de publicar.");
      return;
    }
    if (hasUnappliedInputs) {
      setErrorMessage(unappliedWarning);
      return;
    }
    if (!isSafeMenuRevision(original, draft) || menuProductCount(draft) === 0) {
      setErrorMessage("Edición bloqueada: estructura o productos inválidos. Recarga el menú.");
      return;
    }
    if (areMenuSnapshotsEqual(original, draft)) {
      setMessage("No hay cambios pendientes de publicación.");
      return;
    }
    setBusy(true);
    setErrorMessage("");
    try {
      // A network failure or timeout can arrive AFTER the database commits.
      // Treat even an RPC error as provisional; never blindly repeat a write.
      // The existing owner-only RPC still verifies auth.uid() and menu_revision.
      setVerificationUncertain(true);
      let rpcError: string | null = null;
      try {
        const result = await client.rpc("save_current_restaurant_menu", {
          p_menu: draft,
          p_expected_revision: revision,
        });
        rpcError = result.error?.message ?? null;
      } catch {
        // Do not expose transport/server details to customers or repeat
        // an uncertain request without a fresh owner-scoped readback.
        rpcError = "NETWORK_UNCERTAIN";
      }

      let current: Snapshot;
      try {
        current = await loadSnapshot(client, config.restaurantId);
      } catch {
        throw new Error(
          "No se pudo verificar si RC ORDERA publicó el menú. No vuelvas a guardar: descarga el borrador y pulsa «Recargar desde RC ORDERA» cuando se restablezca la conexión.",
        );
      }

      const outcome = classifyMenuSaveOutcome(
        draft, revision, current.menu, current.revision,
      );
      if (outcome === "concurrent_change" ||
        rpcError?.includes("MENU_REVISION_CONFLICT")) {
        if (outcome !== "confirmed") {
          throw new Error(
            "El menú cambió en RC ORDERA desde otra sesión o el servidor guardó otros datos. Descarga el borrador y pulsa «Recargar desde RC ORDERA» antes de continuar.",
          );
        }
      }
      if (outcome !== "confirmed") {
        throw new Error(
          "RC ORDERA no confirmó este guardado. No intentes publicarlo otra vez sin recargar y comparar el menú; se mantiene bloqueado para evitar escrituras duplicadas.",
        );
      }

      setOriginal(current.menu);
      setDraft(current.menu);
      setRevision(current.revision);
      setReviewedDraftFingerprint(null);
      setVerificationUncertain(false);
      setServerSnapshotEpoch((value) => value + 1);
      setMessage(rpcError
        ? "RC ORDERA informó de un problema de conexión, pero el menú y la nueva revisión se verificaron guardados correctamente."
        : "Menú guardado y verificado en RC ORDERA. La web comercial puede tardar unos minutos en actualizar el catálogo público.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el menú.");
    } finally {
      setReviewedDraftFingerprint(null);
      setBusy(false);
    }
  }

  const categories = draft ? Object.keys(draft) : [];
  const activeCategory = categories.includes(category) ? category : categories[0] ?? "";
  const products = draft?.[activeCategory] ?? [];
  const selected = products.find((item) => item.id === productId) ?? products[0];
  const dirty = Boolean(original && draft && !areMenuSnapshotsEqual(original, draft));
  const menuChanges = original && draft ? summarizeMenuChanges(original, draft) : [];
  const currentDraftFingerprint = draft && revision !== null ? menuDraftFingerprint(draft, revision) : null;
  const readyToPublish = Boolean(currentDraftFingerprint && reviewedDraftFingerprint === currentDraftFingerprint);
  const matchingProducts = draft ? searchMenuProducts(draft, productSearch) : [];
  // Read-only, memoized audit. No additional calls or writes to RC ORDERA.
  const translationAudit = useMemo(() =>
    draft ? auditMenuTranslations(draft, 24, translationReviewPage * 24) : null,
    [draft, translationReviewPage],
  );
  // The unfinished count can shrink after editing the menu. Do not strand
  // the owner on a now-empty page of results.
  useEffect(() => {
    if (translationReviewLocale && translationAudit &&
      translationReviewPage > 0 &&
      translationAudit[translationReviewLocale].incompleteProducts <= translationReviewPage * 24) {
      setTranslationReviewPage(0);
    }
  }, [translationAudit, translationReviewLocale, translationReviewPage]);
  const publishedSelected = selected && original?.[activeCategory]?.find((item) => item.id === selected.id);
  const priceFormat = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });

  useEffect(() => {
    if (!dirty && !busy && !hasUnappliedInputs) {
      return;
    }
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Browsers choose their own generic dialog text.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty, busy, hasUnappliedInputs]);

  return (
    <section aria-labelledby="ordera-edit-title" className="mt-8 rounded-[2rem] border border-[#d9dfe9] bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-black uppercase tracking-widest text-[#123d73]">Doble autorización segura</p>
      <h2 id="ordera-edit-title" className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
        Editar productos directamente en RC ORDERA
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#62594f]">
        Este módulo no copia los pedidos ni comparte contraseñas entre proyectos.
        Inicia sesión con la cuenta propietaria de la sede en RC ORDERA.
        Se conserva la revisión original y todos los datos internos del menú.
        La sesión RC ORDERA no se almacena en este navegador.
      </p>

      {!connected ? (
        <form onSubmit={(event) => void authenticate(event)} className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold" htmlFor="ordera-owner-email">Correo de RC ORDERA</label>
            <input id="ordera-owner-email" name="email" type="email" required autoComplete="username" disabled={busy}
              className="mt-2 min-h-11 w-full rounded-xl border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-bold" htmlFor="ordera-owner-password">Contraseña de RC ORDERA</label>
            <input id="ordera-owner-password" name="password" type="password" required autoComplete="current-password" disabled={busy}
              className="mt-2 min-h-11 w-full rounded-xl border px-3 py-2" />
          </div>
          <button disabled={busy} type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#123d73] px-5 text-sm font-black text-white disabled:opacity-50 sm:col-span-2 sm:justify-self-start">
            {busy ? "Conectando…" : "Conectar cuenta propietaria"}
          </button>
        </form>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
              Cuenta propietaria conectada · revisión {revision}
            </span>
            <button type="button" disabled={busy} onClick={() => void reload()}
              className="min-h-11 rounded-full border border-[#123d73] px-5 text-sm font-bold text-[#123d73] disabled:opacity-50">
              Recargar desde RC ORDERA
            </button>
            {pendingReload ? (
              <div className="w-full rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="alert">
                <p className="font-bold">Hay cambios sin aplicar o sin guardar. Recargar los descartará.</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" disabled={busy} onClick={() => void reload(true)}
                    className="min-h-11 rounded-full bg-amber-800 px-5 font-bold text-white">
                    Sí, descartar borrador y recargar
                  </button>
                  <button type="button" onClick={() => setPendingReload(false)}
                    className="min-h-11 rounded-full border px-5 font-bold">
                    Seguir editando
                  </button>
                </div>
              </div>
            ) : null}
            <button type="button" disabled={busy} onClick={() => void logout()}
              className="min-h-11 rounded-full border px-5 text-sm font-bold disabled:opacity-50">
              Desconectar
            </button>
            {pendingLogout && (hasUnappliedInputs || dirty) ? (
              <div role="alert" className="w-full rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-bold">Hay modificaciones pendientes sin publicar.</p>
                <p className="mt-2">Desconectar ahora descartará los cambios del formulario y del borrador del menú.</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" disabled={busy}
                    onClick={() => void logout(true)}
                    className="min-h-11 rounded-full bg-red-800 px-5 font-bold text-white">
                    Sí, desconectar y descartar
                  </button>
                  <button type="button" onClick={() => setPendingLogout(false)}
                    className="min-h-11 rounded-full border px-5 font-bold">
                    Seguir editando
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#e4dccf] bg-[#fff8e4] p-4">
            <p className="text-sm font-bold">
              {menuProductCount(draft ?? {})} productos · {categories.length} categorías ·
              {hasUnappliedInputs ? " · campos sin aplicar" : dirty ? " cambios pendientes" : " sin cambios"}
            </p>
            <button type="button" disabled={!original || revision === null}
              onClick={() => original && revision !== null && downloadBackup(original, revision, config.restaurantId)}
              className="min-h-11 rounded-full bg-white px-4 text-sm font-black text-[#123d73]">
              Descargar copia del servidor
            </button>
            <button type="button" disabled={!dirty || hasUnappliedInputs || revision === null || busy}
              onClick={() => draft && revision !== null && downloadBackup(draft, revision, config.restaurantId, true)}
              className="min-h-11 rounded-full border-2 border-[#123d73] bg-white px-4 text-sm font-black text-[#123d73] disabled:cursor-not-allowed disabled:opacity-40">
              Descargar borrador sin publicar
            </button>
            <label htmlFor="ordera-import-draft" className="min-h-11 rounded-full border-2 border-[#123d73] bg-white px-4 py-3 text-sm font-black text-[#123d73]">
              Recuperar borrador JSON
            </label>
            <input id="ordera-import-draft" type="file" accept="application/json,.json"
              disabled={!connected || busy || hasUnappliedInputs || dirty || verificationUncertain}
              onChange={(event) => {
                const selected = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                void importDraftFile(selected);
              }}
              className="max-w-full rounded-xl border px-3 py-2 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#f7c600] file:px-3 file:py-2 file:font-bold disabled:opacity-40" />
            {hasUnappliedInputs ? (
              <p className="w-full text-xs font-bold text-amber-900" role="status">
                Aplica los campos escritos al borrador antes de descargarlo: el archivo JSON no puede incluir modificaciones todavía sin aplicar.
              </p>
            ) : null}
          </div>
          <form onSubmit={createCategory} className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-[#e4dccf] bg-white p-4">
            <div className="min-w-[min(100%,16rem)] flex-1">
              <label htmlFor="ordera-new-category" className="block text-sm font-bold">Nueva categoría del menú</label>
              <input id="ordera-new-category" type="text" maxLength={120} required value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                disabled={busy} placeholder="Por ejemplo: Entradas"
                className="mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
            <button type="submit" disabled={busy || !connected}
              className="min-h-11 rounded-xl bg-[#123d73] px-5 font-bold text-white disabled:opacity-50">
              + Crear categoría
            </button>
            <p className="w-full text-xs text-[#62594f]">Máximo una categoría nueva por guardado. Los cambios siguen siendo un borrador hasta publicarlos.</p>
          </form>
          <section aria-label="Buscar productos del menú" className="mt-6 rounded-2xl border border-[#d9dfe9] bg-[#f6f9ff] p-4 sm:p-5">
            <label htmlFor="ordera-search-product" className="block text-sm font-black text-[#123d73]">
              Buscar un plato en todas las categorías
            </label>
            <input id="ordera-search-product" type="search" maxLength={120}
              value={productSearch} disabled={busy}
              onChange={(event) => setProductSearch(event.target.value)}
              autoComplete="off" placeholder="Escribe bandeja, masato, bebida o un nombre en polaco…"
              className="mt-2 min-h-12 w-full rounded-xl border border-[#c8d4e4] bg-white px-4 py-2 text-sm"
            />
            {productSearch.trim() ? (
              <div className="mt-3" role="region" aria-label="Resultados de búsqueda">
                <p className="text-xs font-semibold text-[#62594f]">
                  {matchingProducts.length === 0 ? "No se encontraron productos." :
                    `Mostrando ${matchingProducts.length} coincidencias (máximo 24).`}
                </p>
                <ul className="mt-2 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                  {matchingProducts.map(({ category: foundCategory, product }) => (
                    <li key={product.id} className="grid gap-2">
                      <button type="button" disabled={busy}
                        onClick={() => {
                          if (hasUnappliedInputs) { setErrorMessage(unappliedWarning); return; }
                          setCategory(foundCategory);
                          setProductId(product.id);
                          setProductSearch("");
                          setPendingRemoval(null);
                          setErrorMessage("");
                        }}
                        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#d9dfe9] bg-white p-3 text-left text-sm hover:border-[#123d73] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73] disabled:opacity-50">
                        <span className="min-w-0"><strong className="block break-words">{product.name}</strong>
                          <span className="text-xs text-[#62594f]">{foundCategory}</span></span>
                        <span className="shrink-0 text-right font-bold text-[#123d73]">
                          {priceFormat.format(product.price)}
                          {!product.available ? <span className="block text-xs text-red-800">Agotado</span> : null}
                        </span>
                      </button>
                      <button type="button"
                        disabled={busy || hasUnappliedInputs || verificationUncertain}
                        onClick={() => toggleAvailability(foundCategory, product.id)}
                        aria-label={`${product.available ? "Marcar agotado" : "Marcar disponible"}: ${product.name}`}
                        className={`min-h-11 rounded-xl border-2 px-4 py-2 text-sm font-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73] disabled:cursor-not-allowed disabled:opacity-40 ${product.available
                          ? "border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100"
                          : "border-emerald-500 bg-emerald-50 text-emerald-950 hover:bg-emerald-100"}`}>
                        {product.available ? "Marcar agotado · borrador" : "Marcar disponible · borrador"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
          {translationAudit ? (
            <section aria-labelledby="ordera-translation-audit-title"
              className="mt-6 rounded-2xl border-2 border-[#123d73] bg-white p-4 sm:p-6">
              <h3 id="ordera-translation-audit-title" className="text-lg font-black text-[#123d73]">
                Revisión de traducciones del menú
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#62594f]">
                Revisa qué productos necesitan textos en polaco o inglés antes de publicar.
                El español es el texto original del producto. Los resultados proceden
                únicamente de tu borrador autorizado y no se traducen automáticamente.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(["pl", "en"] as const).map((locale) => {
                  const info = translationAudit[locale];
                  const complete = translationAudit.products - info.incompleteProducts;
                  return (
                    <div key={locale} className="rounded-xl border border-[#d9dfe9] bg-[#f5f9ff] p-4">
                      <p className="text-sm font-black">{locale === "pl" ? "Polaco (PL)" : "Inglés (EN)"}</p>
                      <p className="mt-1 text-sm">
                        <strong>{complete}/{translationAudit.products}</strong> productos con traducciones completas.
                      </p>
                      <p className="mt-1 text-xs text-[#62594f]">
                        {info.missingTitles} sin nombre · {info.missingDescriptions} sin descripción.
                      </p>
                      <button type="button"
                        aria-pressed={translationReviewLocale === locale}
                        disabled={busy || info.incompleteProducts === 0}
                        onClick={() => {
                          setTranslationReviewPage(0);
                          setTranslationReviewLocale((current) => current === locale ? null : locale);
                        }}
                        className="mt-3 min-h-11 w-full rounded-xl border-2 border-[#123d73] bg-white px-4 py-2 text-sm font-black text-[#123d73] hover:bg-[#f7c600]/20 disabled:opacity-40">
                        {translationReviewLocale === locale ? "Ocultar pendientes" :
                          `Revisar ${info.incompleteProducts} pendientes`}
                      </button>
                    </div>
                  );
                })}
              </div>
              {translationReviewLocale ? (
                <div className="mt-4" role="region" aria-label="Productos pendientes de traducción">
                  <p className="text-sm font-bold text-[#123d73]">
                    {translationAudit[translationReviewLocale].incompleteProducts} productos pendientes
                    {translationAudit[translationReviewLocale].incompleteProducts > 0
                      ? ` · mostrando ${translationReviewPage * 24 + 1}–${Math.min(
                        (translationReviewPage + 1) * 24,
                        translationAudit[translationReviewLocale].incompleteProducts,
                      )} de ${translationAudit[translationReviewLocale].incompleteProducts}`
                      : ""}
                  </p>
                  <ul className="mt-3 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
                    {translationAudit[translationReviewLocale].issues.map((item) => (
                      <li key={item.productId}>
                        <button type="button" disabled={busy || hasUnappliedInputs}
                          onClick={() => {
                            if (hasUnappliedInputs) { setErrorMessage(unappliedWarning); return; }
                            setCategory(item.category);
                            setProductId(item.productId);
                            setProductSearch("");
                            setPendingRemoval(null);
                            setTranslationReviewLocale(null);
                            setErrorMessage("");
                            // Use the already-authorized, local draft. No remote write.
                          }}
                          className="min-h-14 w-full rounded-xl border border-[#d9dfe9] bg-white p-3 text-left text-sm hover:border-[#123d73] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73] disabled:opacity-40">
                          <strong className="block break-words text-[#123d73]">{item.productName}</strong>
                          <span className="block text-xs text-[#62594f]">{item.category}</span>
                          <span className="mt-1 block text-xs font-semibold text-amber-800">
                            {item.missingTitle ? "Sin nombre traducido" : ""}
                            {item.missingTitle && item.missingDescription ? " · " : ""}
                            {item.missingDescription ? "Sin descripción traducida" : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {translationAudit[translationReviewLocale].incompleteProducts > 24 ? (
                    <nav aria-label="Páginas de traducciones pendientes"
                      className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <button type="button" disabled={busy || translationReviewPage === 0}
                        onClick={() => setTranslationReviewPage((current) => Math.max(0, current - 1))}
                        className="min-h-11 rounded-full border border-[#123d73] px-4 text-sm font-bold text-[#123d73] disabled:opacity-40">
                        ← 24 anteriores
                      </button>
                      <span className="text-sm font-semibold text-[#123d73]">
                        Página {translationReviewPage + 1} de {Math.ceil(
                          translationAudit[translationReviewLocale].incompleteProducts / 24)}
                      </span>
                      <button type="button"
                        disabled={busy || (translationReviewPage + 1) * 24 >=
                          translationAudit[translationReviewLocale].incompleteProducts}
                        onClick={() => setTranslationReviewPage((current) => current + 1)}
                        className="min-h-11 rounded-full border border-[#123d73] px-4 text-sm font-bold text-[#123d73] disabled:opacity-40">
                        24 siguientes →
                      </button>
                    </nav>
                  ) : null}
                </div>
              ) : null}
              <p className="mt-3 text-xs text-[#62594f]">
                Las traducciones sólo se publican con el mismo proceso de revisión
                y confirmación que protege los precios y el menú de RC ORDERA.
              </p>
            </section>
          ) : null}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold" htmlFor="ordera-category">Categoría</label>
              <select id="ordera-category" value={activeCategory} disabled={busy}
                onChange={(event) => {
                  if (hasUnappliedInputs) {
                    setErrorMessage(unappliedWarning);
                    return;
                  }
                  setCategory(event.target.value);
                  setProductId("");
                  setPendingRemoval(null);
                }}
                className="mt-2 min-h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm">
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold" htmlFor="ordera-product">Producto</label>
              <select id="ordera-product" value={selected?.id ?? ""} disabled={busy || !selected}
                onChange={(event) => {
                  if (hasUnappliedInputs) {
                    setErrorMessage(unappliedWarning);
                    return;
                  }
                  setProductId(event.target.value);
                  setPendingRemoval(null);
                }}
                className="mt-2 min-h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm">
                {products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
          </div>
          {products.length === 0 && categories.length > 1 ? (
            <button type="button" disabled={busy} onClick={removeCategory}
              className="mt-4 min-h-11 rounded-xl border border-red-300 px-4 text-sm font-bold text-red-800 disabled:opacity-50">
              Retirar categoría vacía «{activeCategory}» del borrador
            </button>
          ) : null}
          {hasUnappliedInputs ? (
            <p role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-950">
              {unappliedWarning}
            </p>
          ) : null}
          {selected ? (
            <>
              <section aria-label="Vista previa del borrador seleccionado" className="mt-6 rounded-2xl border-2 border-[#f7c600] bg-[#fffbea] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-wider text-[#123d73]">Vista previa · borrador local</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${selected.available ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>
                    {selected.available ? "Disponible" : "No disponible"}
                  </span>
                </div>
                <h3 className="mt-3 break-words text-xl font-extrabold text-[#171717]">{selected.name}</h3>
                <p className="mt-2 text-2xl font-extrabold text-[#123d73]">{priceFormat.format(selected.price)}</p>
                {selected.description ? <p className="mt-2 whitespace-pre-wrap break-words text-sm">{selected.description}</p> : null}
                <p className="mt-3 text-xs text-[#62594f]">
                  {publishedSelected
                    ? (publishedSelected.price !== selected.price || publishedSelected.available !== selected.available
                      ? `Antes de editar: ${priceFormat.format(publishedSelected.price)} · ${publishedSelected.available ? "Disponible" : "No disponible"}`
                      : "Precio y disponibilidad coinciden con la última versión consultada.")
                    : "Producto nuevo: no existe en la última versión consultada de RC ORDERA."}
                </p>
                {selected.imageUrl && validProductImageUrl(selected.imageUrl) ? (
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <Image src={selected.imageUrl} alt={`Imagen del borrador: ${selected.name}`}
                      width={180} height={136} unoptimized loading="lazy" referrerPolicy="no-referrer"
                      className="h-auto max-h-40 w-auto max-w-full rounded-xl border border-[#e4dccf] bg-white object-contain" />
                    <a href={selected.imageUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center text-sm font-bold text-[#123d73] underline underline-offset-4">
                      Ver fotografía a tamaño completo ↗
                    </a>
                  </div>
                ) : null}
                <div className="mt-5" aria-label="Vista previa de las tres traducciones">
                  <h4 className="text-sm font-black text-[#123d73]">Comprueba los textos en los tres idiomas</h4>
                  <p className="mt-1 text-xs text-[#62594f]">
                    Es una revisión del borrador, no una traducción automática ni un guardado en RC ORDERA.
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {([
                      { locale: "pl", label: "Polski" },
                      { locale: "es", label: "Español" },
                      { locale: "en", label: "English" },
                    ] as const).map(({ locale, label }) => {
                      const preview = getMenuLocalePreview(selected, locale);
                      return (
                        <section key={locale} lang={locale} className="min-w-0 rounded-xl border border-[#d9dfe9] bg-white p-3">
                          <p className="text-xs font-black uppercase tracking-wider text-[#123d73]">{label}</p>
                          <p className="mt-2 break-words text-sm font-bold">{preview.name}</p>
                          {preview.description ? (
                            <p className="mt-2 whitespace-pre-wrap break-words text-xs text-[#62594f]">{preview.description}</p>
                          ) : null}
                          {!preview.translated ? (
                            <p className="mt-2 text-xs font-bold text-amber-800">
                              Sin nombre traducido: se muestra el original.
                            </p>
                          ) : preview.descriptionMissing ? (
                            <p className="mt-2 text-xs font-bold text-amber-800">
                              Falta descripción traducida.
                            </p>
                          ) : (
                            <p className="mt-2 text-xs font-bold text-emerald-800">
                              Traducción del título disponible.
                            </p>
                          )}
                        </section>
                      );
                    })}
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-[#655a38]">
                  Esta vista no publica cambios: aplica el formulario y después pulsa «Guardar en RC ORDERA».
                </p>
              </section>
              <ProductCard
                key={`${activeCategory}:${selected.id}:${serverSnapshotEpoch}`}
                product={selected}
                busy={busy}
                onApply={(patch) => patchProduct(selected.id, patch)}
                onUpload={(file) => uploadImage(file, selected.id)}
                onUnappliedChange={reportUnappliedChanges}
              />
              <div className="mt-3 flex flex-wrap justify-end gap-3">
                <button type="button" onClick={() => duplicateProduct(selected)}
                  disabled={busy || hasUnappliedInputs || verificationUncertain ||
                    (selected.station !== "kitchen" && selected.station !== "bar")}
                  aria-label={`Duplicar como producto nuevo no disponible: ${selected.name}`}
                  className="min-h-11 rounded-full border-2 border-[#123d73] bg-white px-5 text-sm font-black text-[#123d73] hover:bg-[#edf1f7] disabled:cursor-not-allowed disabled:opacity-40">
                  Duplicar plato · borrador agotado
                </button>
                <button type="button" disabled={busy} onClick={() => deleteProduct(selected)}
                  className="min-h-11 rounded-full border border-red-300 px-5 text-sm font-bold text-red-800 hover:bg-red-50 disabled:opacity-50">
                  Retirar «{selected.name}» del menú
                </button>
              </div>
              {pendingRemoval === selected.id ? (
                <div role="alert" className="mt-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-950">
                  <p className="font-bold">¿Confirmas retirar «{selected.name}»?</p>
                  <p className="mt-2">Primero descarga una copia del menú. No se eliminará de RC ORDERA hasta guardar.</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button type="button" disabled={busy} onClick={() => confirmRemoval(selected)}
                      className="min-h-11 rounded-full bg-red-800 px-5 font-bold text-white">
                      Confirmar retirada
                    </button>
                    <button type="button" onClick={() => setPendingRemoval(null)}
                      className="min-h-11 rounded-full border px-5 font-bold">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : <p className="mt-5 text-sm text-[#62594f]">No hay productos en esta categoría.</p>}
          <details className="mt-7 rounded-2xl border border-[#e4dccf] bg-white p-5">
            <summary className="cursor-pointer text-base font-black text-[#123d73]">
              + Crear un producto en «{activeCategory}»
            </summary>
            <p className="mt-3 text-sm text-[#62594f]">
              Los nuevos productos se crean con un ID único. Puedes añadir las
              traducciones al polaco, español e inglés en este mismo formulario
              y revisar cómo se mostrarán antes de publicar el menú en RC ORDERA.
            </p>
            <AddProductForm key={`${activeCategory}:${serverSnapshotEpoch}`}
              busy={busy} onCreate={addProduct} onUnappliedChange={setNewProductFormDirty} />
          </details>
          {dirty && menuChanges.length > 0 ? (
            <section aria-label="Cambios pendientes de publicación" className="mt-6 rounded-2xl border-2 border-[#123d73] bg-[#f5f9ff] p-4 sm:p-6">
              <h3 className="text-xl font-black text-[#123d73]">Revisa los cambios antes de guardar</h3>
              <p className="mt-2 text-sm text-[#62594f]">
                {menuChanges.length} modificaciones pendientes. Nada de esta lista se ha publicado todavía en RC ORDERA.
                {menuChanges.length > 100 ? " Se muestran las primeras 100; publica cambios por lotes pequeños." : ""}
              </p>
              <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto">
                {menuChanges.slice(0, 100).map((item, index) => (
                  <li key={`${item.kind}:${item.category}:${item.productId ?? index}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#d9dfe9] bg-white p-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-black">{item.productName}</p>
                      <p className="mt-1 text-xs text-[#62594f]">{item.category} · {
                        item.kind === "category_added" ? "Nueva categoría" :
                        item.kind === "category_removed" ? "Categoría vacía retirada" :
                        item.kind === "product_added" ? "Nuevo producto" :
                        item.kind === "product_removed" ? "Producto retirado" :
                        `Producto editado: ${item.fields.join(", ")}`
                      }</p>
                      {(item.fields.includes("Precio") ||
                        item.kind === "product_added" || item.kind === "product_removed") ? (
                        <p className="mt-1 text-xs font-bold text-[#123d73]">
                          {item.previousPrice === undefined ? "Nuevo" : priceFormat.format(item.previousPrice)}
                          {" → "}
                          {item.nextPrice === undefined ? "Retirado" : priceFormat.format(item.nextPrice)}
                        </p>
                      ) : null}
                    </div>
                    {item.productId ? (
                      <button type="button" disabled={busy || hasUnappliedInputs}
                        onClick={() => undoProduct(item.category, item.productId ?? "")}
                        className="min-h-11 rounded-full border border-[#123d73] px-4 text-xs font-black text-[#123d73] hover:bg-[#eef3ff] disabled:opacity-40">
                        Deshacer sólo este producto
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
              {readyToPublish ? (
                <p role="status" className="mt-4 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-950">
                  Resumen revisado. La siguiente confirmación escribirá el menú en RC ORDERA con la cuenta propietaria.
                </p>
              ) : null}
            </section>
          ) : null}
          {verificationUncertain ? (
            <p role="alert" className="mt-4 rounded-xl border border-amber-500 bg-amber-50 p-4 text-sm font-bold text-amber-950">
              No se pudo verificar la última publicación. Descarga una copia y consulta «Recargar desde RC ORDERA» antes de intentar otro guardado.
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
            <button type="button" disabled={!dirty || hasUnappliedInputs || busy || verificationUncertain || menuChanges.length > 100}
              onClick={() => readyToPublish ? void save() : reviewSave()}
              className="inline-flex min-h-12 items-center rounded-full bg-[#f7c600] px-6 text-sm font-black text-[#12100e] disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? "Guardando…" : readyToPublish ? "Confirmar y guardar en RC ORDERA" : "Revisar antes de guardar en RC ORDERA"}
            </button>
            <button type="button" disabled={(!dirty && !hasUnappliedInputs) || busy}
              onClick={() => {
                setDraft(original);
                setProductId("");
                setNewCategoryName("");
                setUnappliedChanges(false);
                setNewProductFormDirty(false);
                setReviewedDraftFingerprint(null);
                // A previous RPC may already have persisted this menu: only a
                // successful server reload can resolve unknown publication.
                setServerSnapshotEpoch((value) => value + 1);
                setMessage("Borrador local descartado.");
              }}
              className="inline-flex min-h-12 items-center rounded-full border px-6 text-sm font-bold disabled:opacity-50">
              Descartar borrador
            </button>
          </div>
          <p className="mt-3 text-xs leading-6 text-[#62594f]">
            Puedes crear categorías y retirar únicamente categorías vacías;
            ninguna categoría con productos se puede eliminar desde este panel.
            Los productos existentes conservan identificadores, traducciones,
            modificadores y estaciones de cocina. Hasta tres altas y una baja por guardado.
            Una fotografía subida no aparece en pedidos hasta guardar el menú.
          </p>
        </>
      )}
      {message ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{message}</p> : null}
      {errorMessage ? <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-900">{errorMessage}</p> : null}
    </section>
  );
}
