"use client";

import { useMemo, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  detectProductImageMime,
  isSafeMenuRevision,
  menuProductCount,
  normalizeMenu,
  updateProduct,
  validProductImageUrl,
  type RcEditableMenu,
  type RcMenuProduct,
  type RcProductUpdate,
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
}: {
  readonly product: RcMenuProduct;
  readonly busy: boolean;
  readonly onApply: (patch: RcProductUpdate) => void;
  readonly onUpload: (file: File) => Promise<string>;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(String(product.price));
  const [available, setAvailable] = useState(product.available);
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(price.replace(",", "."));
    if (!name.trim() || name.length > 160 ||
      description.length > 3000 ||
      !Number.isFinite(value) || value < 0 || value > 9999 ||
      Math.round(value * 100) !== value * 100 ||
      !validProductImageUrl(imageUrl.trim())) {
      setUploadMessage("Revisa nombre, precio, descripción y dirección HTTPS de la fotografía.");
      return;
    }
    onApply({
      name: name.trim(),
      description,
      price: value,
      available,
      imageUrl: imageUrl.trim(),
    });
    setUploadMessage("Cambios aplicados al borrador. Falta publicar con «Guardar en RC ORDERA».");
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

/**
 * Two separate authorization domains:
 * 1) Next.js server requires an approved Web administrator.
 * 2) RC ORDERA directly authenticates its own restaurant OWNER,
 *    and the existing database RLS and RPC verify ownership.
 *
 * No shared secret/service_role; no cross-project token substitution.
 */
export default function RcOrderaMenuManager({ config }: { readonly config: EditorConfig }) {
  const client = useMemo(
    () => createEphemeralClient(config),
    [config.supabaseUrl, config.anonKey],
  );
  const [connected, setConnected] = useState(false);
  const [original, setOriginal] = useState<RcEditableMenu | null>(null);
  const [draft, setDraft] = useState<RcEditableMenu | null>(null);
  const [revision, setRevision] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [productId, setProductId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
      setMessage("");
      setBusy(false);
    }
  }

  async function reload() {
    setBusy(true);
    setErrorMessage("");
    try {
      const current = await loadSnapshot(client, config.restaurantId);
      setOriginal(current.menu);
      setDraft(current.menu);
      setRevision(current.revision);
      setProductId("");
      setCategory(Object.keys(current.menu)[0] ?? "");
      setMessage("Menú actualizado con la versión más reciente de RC ORDERA.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo actualizar el menú.");
    } finally {
      setBusy(false);
    }
  }

  function patchProduct(id: string, data: RcProductUpdate) {
    if (!draft || busy) {
      return;
    }
    try {
      setDraft(updateProduct(draft, category, id, data));
      setMessage("Producto cambiado en el borrador local, aún no publicado.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Producto inválido");
    }
  }

  async function uploadImage(file: File, selectedProductId: string): Promise<string> {
    if (busy || !connected || file.size === 0 || file.size > 2 * 1024 * 1024) {
      throw new Error("Imagen demasiado grande. Máximo 2 MB.");
    }
    const mime = detectProductImageMime(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
    if (!mime) {
      throw new Error("La imagen no tiene una firma válida JPG, PNG o WebP.");
    }

    const extension = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
    const safeId = selectedProductId.replace(/[^a-z0-9_-]/gi, "-").slice(0, 90);
    const path = `${config.restaurantId}/products/${safeId}-${crypto.randomUUID()}.${extension}`;
    // Storage RLS: a restaurant owner can INSERT only under auth.uid()/...
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
            <ProductCard
              key={`${activeCategory}:${selected.id}`}
              product={selected}
              busy={busy}
              onApply={(patch) => patchProduct(selected.id, patch)}
              onUpload={(file) => uploadImage(file, selected.id)}
            />
          ) : <p className="mt-5 text-sm text-[#62594f]">No hay productos en esta categoría.</p>}
          <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
            <button type="button" disabled={!dirty || busy} onClick={() => void save()}
              className="inline-flex min-h-12 items-center rounded-full bg-[#f7c600] px-6 text-sm font-black text-[#12100e] disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? "Guardando…" : "Guardar en RC ORDERA"}
            </button>
            <button type="button" disabled={!dirty || busy}
              onClick={() => { setDraft(original); setProductId(""); setMessage("Borrador local descartado."); }}
              className="inline-flex min-h-12 items-center rounded-full border px-6 text-sm font-bold disabled:opacity-50">
              Descartar borrador
            </button>
          </div>
          <p className="mt-3 text-xs leading-6 text-[#62594f]">
            Cambia productos existentes sin eliminar categorías ni ID. Las traducciones,
            modificadores y estaciones de cocina se mantienen intactos.
            Una fotografía subida no aparece en pedidos hasta guardar el menú.
          </p>
        </>
      )}
      {message ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{message}</p> : null}
      {errorMessage ? <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-900">{errorMessage}</p> : null}
    </section>
  );
}
