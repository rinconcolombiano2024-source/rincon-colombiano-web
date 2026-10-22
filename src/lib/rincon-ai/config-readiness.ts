/**
 * Security-safe CEO configuration readout for the already integrated Rincón AI
 * engine. This deliberately never returns tokens, keys or provider account
 * identities. A configured integration is NOT evidence of a successful model
 * response, paid-provider budget or deployment-wide rate limiting.
 */
export interface RinconAiConfigReadiness {
  readonly mode: "native" | "remote";
  readonly configured: boolean;
  readonly issue: "none" | "provider" | "remote-settings";
  readonly note: string;
}

export function inspectRinconAiConfiguration(
  env: Readonly<Record<string, string | undefined>>,
  nativeProviderConfigured: boolean,
): RinconAiConfigReadiness {
  if (env["RINCON_IA_MODE"] === "native") {
    return nativeProviderConfigured
      ? {
        mode: "native",
        configured: true,
        issue: "none",
        note: "Motor IA integrado y proveedor detectado. Falta confirmar respuestas reales, presupuesto y límites globales.",
      }
      : {
        mode: "native",
        configured: false,
        issue: "provider",
        note: "Modo IA nativo activado, pero sin proveedor generativo configurado. En Vercel añade de forma privada una clave válida de OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, GOOGLE_API_KEY, XAI_API_KEY o GROQ_API_KEY. Después despliega y prueba el chat.",
      };
  }

  const endpoint = env["RINCON_IA_CHAT_ENDPOINT"];
  const host = env["RINCON_IA_CHAT_HOST"];
  const token = env["RINCON_IA_CHAT_TOKEN"];
  let validRemote = false;
  if (endpoint && host && token && token.length >= 32) {
    try {
      const url = new URL(endpoint);
      validRemote = url.protocol === "https:" &&
        url.hostname === host &&
        url.pathname === "/api/restaurant-chat" &&
        !url.username && !url.password && !url.search && !url.hash;
    } catch {
      validRemote = false;
    }
  }

  return validRemote
    ? {
      mode: "remote", configured: true, issue: "none",
      note: "Puente HTTPS configurado. Falta probar que el servicio de IA responda correctamente; la clave no se expone.",
    }
    : {
      mode: "remote", configured: false, issue: "remote-settings",
      note: "El puente IA no tiene conexión HTTPS completa. Configura RINCON_IA_CHAT_ENDPOINT, RINCON_IA_CHAT_HOST y RINCON_IA_CHAT_TOKEN (mínimo 32 caracteres), o habilita RINCON_IA_MODE=native con un proveedor generativo privado.",
    };
}
