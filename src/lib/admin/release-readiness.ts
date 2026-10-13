/**
 * Release gate for the CEO dashboard. Pure/deterministic so CI can verify
 * that a successful build is never misreported as a production launch.
 */
export type GateState = "ready" | "attention" | "blocked";

export interface LaunchSignals {
  readonly officialDomain: "ready" | "not-published" | "unavailable";
  readonly rcOrderaStatus:
    | "ready"
    | "not-configured"
    | "restaurant-not-found"
    | "unavailable";
  readonly productCount: number;
  readonly publishedBrandSlots: readonly string[];
  readonly publishedCampaignLocales: readonly string[];
}

export interface LaunchGate {
  readonly id: "domain" | "catalog" | "brand" | "photos" | "campaigns" | "sumup" | "orders";
  readonly title: string;
  readonly description: string;
  readonly state: GateState;
  readonly href?: "/admin/brand" | "/admin/menu" | "/admin/marketing";
}

export function evaluateLaunchReadiness(signals: LaunchSignals): readonly LaunchGate[] {
  const brand = new Set(signals.publishedBrandSlots);
  const languages = new Set(signals.publishedCampaignLocales);
  const brandReady = brand.has("logo_primary") && brand.has("favicon");
  const photoCount = ["hero_primary", "food_featured_1", "food_featured_2", "food_featured_3"]
    .filter((slot) => brand.has(slot)).length;

  return [
    {
      id: "domain",
      title: "Web oficial y administración Windows",
      description: signals.officialDomain === "ready"
        ? "El dominio oficial entrega el manifiesto PWA y la misma revisión Git que ejecuta este panel."
        : signals.officialDomain === "not-published"
          ? "El dominio oficial no entrega el panel Next.js con la misma revisión Git y el manifiesto PWA esperado. No aprobar el corte de dominio."
          : "No fue posible verificar el dominio oficial; no es una certificación de despliegue.",
      state: signals.officialDomain === "ready" ? "ready" : "blocked",
    },
    {
      id: "catalog",
      title: "Menú público integrado con RC ORDERA",
      description: signals.rcOrderaStatus === "ready" && signals.productCount > 0
        ? `Catálogo accesible: ${signals.productCount} productos. Guardados reales requieren la cuenta propietaria.`
        : signals.rcOrderaStatus === "not-configured"
          ? "Faltan las variables de conexión pública RC_ORDERA_SUPABASE_URL y RC_ORDERA_SUPABASE_ANON_KEY."
          : "El catálogo no pudo validarse. No iniciar pedidos sin comprobar esta conexión.",
      state: signals.rcOrderaStatus === "ready" && signals.productCount > 0
        ? "ready" : "blocked",
      href: "/admin/menu",
    },
    {
      id: "brand",
      title: "Identidad colombiana publicada",
      description: brandReady
        ? "Logo principal y favicon disponibles."
        : "Publica el logo y favicon para que la marca sea consistente en todas las páginas.",
      state: brandReady ? "ready" : "attention",
      href: "/admin/brand",
    },
    {
      id: "photos",
      title: "Fotografías comerciales",
      description: `${photoCount} de 4 espacios de portada y platos publicados. ${photoCount === 4
        ? "Galería gastronómica completa." : "Sube y publica imágenes reales de tus platos."}`,
      state: photoCount === 4 ? "ready" : "attention",
      href: "/admin/brand",
    },
    {
      id: "campaigns",
      title: "Publicidad ES · PL · EN",
      description: `${languages.size} de 3 idiomas con campaña publicada. ${languages.size === 3
        ? "Campaña multilingüe lista." : "La web funciona sin campaña, pero faltan publicaciones publicitarias."}`,
      state: ["pl", "es", "en"].every((locale) => languages.has(locale))
        ? "ready" : "attention",
      href: "/admin/marketing",
    },
    {
      id: "sumup",
      title: "SumUp · Cobros online de Rincón Colombiano",
      description: "RC ORDERA contiene un adaptador de pago alojado, pero el cobro no está certificado. Faltan configurar claves y comercio en Supabase de RC ORDERA, aplicar y validar el libro contable en staging, desplegar Edge Functions y probar captura, devolución y conciliación reales. No cambiar a SumUp hasta aprobar estas pruebas; la web no guarda ni solicita claves de pago.",
      state: "blocked",
    },
    {
      id: "orders",
      title: "Pedido, pago, entrega y recuperación",
      description: "Pendiente de prueba manual de extremo a extremo en el entorno desplegado: pedido de cliente, cobro, cocina, reparto, ticket y reembolso.",
      state: "blocked",
    },
  ];
}

export function isLaunchCertified(gates: readonly LaunchGate[]): boolean {
  // Automated infrastructure signals alone do not certify transactions.
  return gates.length > 0 && gates.every((gate) => gate.state === "ready");
}
