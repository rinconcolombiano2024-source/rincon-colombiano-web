"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  addMenuProduct,
  removeMenuProduct,
  detectProductImageMime,
  getProductTranslation,
  hasUnappliedProductChanges,
  isSafeMenuRevision,
  menuProductCount,
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

function downloadBackup(menu: RcEditableMenu, revision: number, restaurantId: string): void {
  const backup = JSON.stringify({
    restaurantId,
    menuRevision: revision,
    exportedAt: new Date().toISOString(),
    menu,
  }, null, 2);
  const blob = new Blob([backup], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rc-ordera-menu-backup-revision-${revision}.json`;
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

function AddProductForm({
  busy,
  onCreate,
}: {
  readonly busy: boolean;
  readonly onCreate: (fields: {
    name: string;
    description: string;
    price: number;
    station: "kitchen" | "bar";
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
    });
    if (success) {
      form.reset();
    }
  }

  return (
    <form onSubmit={create} className="mt-4 grid gap-3 rounded-2xl bg-[#faf9f6] p-5 sm:grid-cols-2">
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
  const [productId, setProductId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const [pendingReload, setPendingReload] = useState(false);
  // ProductCard holds controlled input state; a successful server
  // refresh must replace its inputs even when the selected ID is unchanged.
  const [serverSnapshotEpoch, setServerSnapshotEpoch] = useState(0);
  const [unappliedChanges, setUnappliedChanges] = useState(false);
  const reportUnappliedChanges = useCallback((hasChanges: boolean) => {
    setUnappliedChanges(hasChanges);
  }, []);
  const unappliedWarning =
    "Primero pulsa «Aplicar al borrador» en el producto; hay datos editados sin aplicar.";

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
      setProductId("");
      setServerSnapshotEpoch((value) => value + 1);
      setConnected(true);
      setMessage("Conexión autorizada con RC ORDERA. Descarga la copia de seguridad antes de editar.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo autenticar la cuenta propietaria.");
      setConnected(false);
      setDraft(null);
      setOriginal(null);
      setRevision(null);
      await client.auth.signOut().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await client.auth.signOut();
    } finally {
      setConnected(false);
      setDraft(null);
      setOriginal(null);
      setRevision(null);
      setCategory("");
      setProductId("");
      setServerSnapshotEpoch((value) => value + 1);
      setMessage("");
      setBusy(false);
    }
  }

  async function reload(force = false) {
    if (!force && original && draft && JSON.stringify(original) !== JSON.stringify(draft)) {
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
      setProductId("");
      setCategory(Object.keys(current.menu)[0] ?? "");
      setServerSnapshotEpoch((value) => value + 1);
      setMessage("Menú actualizado con la versión más reciente de RC ORDERA.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo actualizar el menú.");
    } finally {
      setBusy(false);
    }
  }

  function addProduct(fields: {
    name: string;
    description: string;
    price: number;
    station: "kitchen" | "bar";
  }): boolean {
    if (!draft || !original || busy || !connected) {
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

  function deleteProduct(product: RcMenuProduct): void {
    if (!draft || !original || busy || !connected) {
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

  function patchProduct(id: string, data: RcProductUpdate): boolean {
    if (!draft || busy) {
      return false;
    }
    try {
      setDraft(updateProduct(draft, category, id, data));
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

  async function save() {
    if (!original || !draft || revision === null || busy) {
      return;
    }
    if (!isSafeMenuRevision(original, draft) || menuProductCount(draft) === 0) {
      setErrorMessage("Edición bloqueada: estructura o productos inválidos. Recarga el menú.");
      return;
    }
    if (JSON.stringify(original) === JSON.stringify(draft)) {
      setMessage("No hay cambios pendientes de publicación.");
      return;
    }
    setBusy(true);
    setErrorMessage("");
    try {
      // The owner-only RPC checks auth.uid(), role and menu_revision inside
      // an atomic transaction, and refuses accidental empty-menu erasure.
      const { error } = await client.rpc("save_current_restaurant_menu", {
        p_menu: draft,
        p_expected_revision: revision,
      });
      if (error) {
        if (error.message.includes("MENU_REVISION_CONFLICT")) {
          throw new Error("Otro dispositivo cambió el menú. Descarga un respaldo y pulsa «Recargar» antes de continuar.");
        }
        throw new Error("RC ORDERA rechazó los cambios. Revisa la sesión propietaria y vuelve a consultar el menú.");
      }
      const current = await loadSnapshot(client, config.restaurantId);
      setOriginal(current.menu);
      setDraft(current.menu);
      setRevision(current.revision);
      setServerSnapshotEpoch((value) => value + 1);
      setMessage("Menú guardado en RC ORDERA. La web comercial puede tardar unos minutos en actualizar el catálogo público.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el menú.");
    } finally {
      setBusy(false);
    }
  }

  const categories = draft ? Object.keys(draft) : [];
  const activeCategory = categories.includes(category) ? category : categories[0] ?? "";
  const products = draft?.[activeCategory] ?? [];
  const selected = products.find((item) => item.id === productId) ?? products[0];
  const dirty = Boolean(original && draft && JSON.stringify(original) !== JSON.stringify(draft));

  useEffect(() => {
    if (!dirty && !busy) {
      return;
    }
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Browsers choose their own generic dialog text.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty, busy]);

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
                <p className="font-bold">Hay cambios sin guardar. Recargar los descartará.</p>
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
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#e4dccf] bg-[#fff8e4] p-4">
            <p className="text-sm font-bold">
              {menuProductCount(draft ?? {})} productos · {categories.length} categorías ·
              {dirty ? " cambios pendientes" : " sin cambios"}
            </p>
            <button type="button" disabled={!original || revision === null}
              onClick={() => original && revision !== null && downloadBackup(original, revision, config.restaurantId)}
              className="min-h-11 rounded-full bg-white px-4 text-sm font-black text-[#123d73]">
              Descargar copia de seguridad JSON
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold" htmlFor="ordera-category">Categoría</label>
              <select id="ordera-category" value={activeCategory} disabled={busy}
                onChange={(event) => { setCategory(event.target.value); setProductId(""); }}
                className="mt-2 min-h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm">
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold" htmlFor="ordera-product">Producto</label>
              <select id="ordera-product" value={selected?.id ?? ""} disabled={busy || !selected}
                onChange={(event) => setProductId(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm">
                {products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
          </div>
          {selected ? (
            <>
              <ProductCard
                key={`${activeCategory}:${selected.id}:${serverSnapshotEpoch}`}
                product={selected}
                busy={busy}
                onApply={(patch) => patchProduct(selected.id, patch)}
                onUpload={(file) => uploadImage(file, selected.id)}
                onUnappliedChange={reportUnappliedChanges}
              />
              <div className="mt-3 flex justify-end">
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
              Los nuevos productos se crean con un ID único. Completa traducciones
              adicionales en RC ORDERA cuando estén disponibles.
              Se incorporarán al menú sólo cuando guardes el borrador.
            </p>
            <AddProductForm busy={busy} onCreate={addProduct} />
          </details>
          <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
            <button type="button" disabled={!dirty || busy} onClick={() => void save()}
              className="inline-flex min-h-12 items-center rounded-full bg-[#f7c600] px-6 text-sm font-black text-[#12100e] disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? "Guardando…" : "Guardar en RC ORDERA"}
            </button>
            <button type="button" disabled={!dirty || busy}
              onClick={() => {
                setDraft(original);
                setProductId("");
                setServerSnapshotEpoch((value) => value + 1);
                setMessage("Borrador local descartado.");
              }}
              className="inline-flex min-h-12 items-center rounded-full border px-6 text-sm font-bold disabled:opacity-50">
              Descartar borrador
            </button>
          </div>
          <p className="mt-3 text-xs leading-6 text-[#62594f]">
            Puedes modificar, crear o retirar productos sin borrar categorías.
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
