"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import type {
  AppLocale,
} from "@/i18n/config";

import { getCommercialInquiryIntent } from "@/components/rincon-ai/commercial-intents";


// Keep a predictable number of chat nodes in mobile browsers, regardless
// of how often visitors ask questions. Messages stay entirely local.
const MAX_VISIBLE_CHAT_MESSAGES = 40;

interface RinconAiWidgetProps {
  readonly locale:
    AppLocale;

  readonly orderHref:
    string;

  readonly contactHref:
    string;
}


interface ChatMessage {
  readonly id:
    string;

  readonly role:
    "assistant" | "user";

  readonly text:
    string;

  readonly href?:
    string;

  readonly actionLabel?:
    string;
}


interface WidgetCopy {
  readonly title:
    string;

  readonly status:
    string;

  readonly welcome:
    string;

  readonly placeholder:
    string;

  readonly send:
    string;

  readonly open:
    string;

  readonly close:
    string;

  readonly menu:
    string;

  readonly order:
    string;

  readonly events:
    string;

  readonly locations:
    string;

  readonly contact:
    string;

  readonly menuAnswer:
    string;

  readonly orderAnswer:
    string;

  readonly eventsAnswer:
    string;

  readonly hoursAnswer:
    string;

  readonly locationsAnswer:
    string;

  readonly rewardsAnswer:
    string;

  readonly allergyAnswer:
    string;

  readonly fallbackAnswer:
    string;

  readonly viewMenu:
    string;

  readonly startOrder:
    string;

  readonly viewEvents:
    string;

  readonly viewLocations:
    string;

  readonly contactTeam:
    string;

  readonly safety:
    string;
}


const widgetCopy:
  Readonly<
    Record<
      AppLocale,
      WidgetCopy
    >
  > = {
    pl: {
      title:
        "Rincón AI",

      status:
        "Asystent Rincón • beta",

      welcome:
        "Cześć! Jestem Rincón AI. Pomogę Ci znaleźć menu, złożyć zamówienie lub skontaktować się z nami w sprawie cateringu i wydarzeń.",

      placeholder:
        "Napisz pytanie…",

      send:
        "Wyślij",

      open:
        "Otwórz Rincón AI",

      close:
        "Zamknij Rincón AI",

      menu:
        "Menu",

      order:
        "Zamów",

      events:
        "Catering",

      locations:
        "Lokale",

      contact:
        "Kontakt",

      menuAnswer:
        "Zajrzyj do naszego menu, by poznać dostępne dania i ceny. Dostępność potwierdzisz podczas zamawiania.",

      orderAnswer:
        "Chcesz zamówić? Otwórz nasze zamówienia online i wybierz ulubione dania.",

      eventsAnswer:
        "Rincón obsługuje catering, wydarzenia, urodziny, firmy, rodziny, śniadania, niespodzianki i dekoracje. Najbezpieczniej przejść do kontaktu i opisać wydarzenie.",

      hoursAnswer:
        "Godziny otwarcia restauracji przy ul. Czapelskiej 33 znajdziesz w sekcji Lokale. Brzeska 10 jest w przygotowaniu i jeszcze nie jest otwarta.",

      locationsAnswer:
        "Informacje o lokalach Rincón znajdziesz w sekcji Lokale.",

      rewardsAnswer:
        "Program punktów i nagród nie jest jeszcze aktywny. O aktualnych promocjach zapytaj nasz zespół.",

      allergyAnswer:
        "W przypadku alergii lub poważnych ograniczeń żywieniowych nie polegaj wyłącznie na czacie. Skontaktuj się bezpośrednio z personelem restauracji przed zamówieniem.",

      fallbackAnswer:
        "Mogę pomóc Ci znaleźć menu, złożyć zamówienie lub skontaktować się z naszym zespołem. W innych sprawach napisz do nas bezpośrednio.",

      viewMenu:
        "Zobacz menu",

      startOrder:
        "Przejdź do zamówienia",

      viewEvents:
        "Zapytaj o wydarzenie",

      viewLocations:
        "Zobacz lokale",

      contactTeam:
        "Skontaktuj się z zespołem",

      safety:
        "Rincón AI nie zastępuje personelu w sprawach alergii, płatności ani reklamacji wymagających weryfikacji.",
    },

    es: {
      title:
        "Rincón AI",

      status:
        "Asistente Rincón • beta",

      welcome:
        "¡Hola! Soy Rincón AI. Te ayudo a encontrar el menú, hacer un pedido o contactar con nuestro equipo para catering y eventos.",

      placeholder:
        "Escribe tu pregunta…",

      send:
        "Enviar",

      open:
        "Abrir Rincón AI",

      close:
        "Cerrar Rincón AI",

      menu:
        "Menú",

      order:
        "Pedir",

      events:
        "Catering",

      locations:
        "Restaurantes",

      contact:
        "Contacto",

      menuAnswer:
        "Descubre nuestros platos y precios en el menú. La disponibilidad final se confirma al realizar el pedido.",

      orderAnswer:
        "¿Te apetece algo colombiano? Abre nuestros pedidos en línea y elige tus platos favoritos.",

      eventsAnswer:
        "Rincón atiende catering, eventos, cumpleaños, empresas, familias, desayunos, sorpresas y decoración. Lo más seguro es contactar al equipo y describir lo que necesitas.",

      hoursAnswer:
        "Consulta los horarios de nuestra sede de Czapelska 33 en la sección Restaurantes. Brzeska 10 abrirá próximamente y todavía no está atendiendo.",

      locationsAnswer:
        "Puedes consultar la información de nuestros restaurantes en la sección Restaurantes.",

      rewardsAnswer:
        "El programa de puntos y recompensas todavía no está activo. Pregunta a nuestro equipo por las promociones disponibles.",

      allergyAnswer:
        "Si tienes alergias o restricciones alimentarias importantes, no dependas solamente del chat. Confirma directamente con el personal del restaurante antes de hacer el pedido.",

      fallbackAnswer:
        "Puedo ayudarte a consultar el menú, realizar pedidos y contactar con nuestro equipo. Si necesitas algo más, estaremos encantados de atenderte.",

      viewMenu:
        "Ver menú",

      startOrder:
        "Ir a pedir",

      viewEvents:
        "Consultar evento",

      viewLocations:
        "Ver restaurantes",

      contactTeam:
        "Contactar al equipo",

      safety:
        "Rincón AI no sustituye al personal en alergias, pagos o reclamaciones que requieran verificación.",
    },

    en: {
      title:
        "Rincón AI",

      status:
        "Rincón assistant • beta",

      welcome:
        "Hi! I'm Rincón AI. I can help you explore our menu, order online or contact the team about catering and events.",

      placeholder:
        "Type your question…",

      send:
        "Send",

      open:
        "Open Rincón AI",

      close:
        "Close Rincón AI",

      menu:
        "Menu",

      order:
        "Order",

      events:
        "Catering",

      locations:
        "Locations",

      contact:
        "Contact",

      menuAnswer:
        "Explore our menu for dishes and prices. Final availability is confirmed when you place your order.",

      orderAnswer:
        "Ready for a taste of Colombia? Open our online ordering page and pick your favourites.",

      eventsAnswer:
        "Rincón supports catering, events, birthdays, companies, families, breakfasts, surprises and table decoration. The safest next step is to contact the team and describe what you need.",

      hoursAnswer:
        "Find the opening hours for Czapelska 33 under Locations. Brzeska 10 is coming soon and is not open yet.",

      locationsAnswer:
        "You can find our restaurant information in the Locations section.",

      rewardsAnswer:
        "Our points and rewards programme isn't active yet. Ask our team about current promotions.",

      allergyAnswer:
        "For allergies or important dietary restrictions, do not rely on chat alone. Confirm directly with restaurant staff before ordering.",

      fallbackAnswer:
        "I can help you find the menu, place an order or contact our team. For anything else, please get in touch with us directly.",

      viewMenu:
        "View menu",

      startOrder:
        "Start order",

      viewEvents:
        "Ask about an event",

      viewLocations:
        "View locations",

      contactTeam:
        "Contact the team",

      safety:
        "Rincón AI does not replace staff for allergies, payments or complaints that require verification.",
    },
  };


function normalizeMessage(
  value:
    string,
): string {
  return value
    .trim()
    .toLocaleLowerCase();
}


function includesAny(
  value:
    string,
  terms:
    readonly string[],
): boolean {
  return terms.some(
    (term) =>
      value.includes(
        term,
      ),
  );
}


export function RinconAiWidget({
  locale,
  orderHref,
  contactHref,
}: RinconAiWidgetProps) {
  const copy =
    widgetCopy[
      locale
    ];

  const [
    isOpen,
    setIsOpen,
  ] =
    useState(
      false,
    );

  const [
    input,
    setInput,
  ] =
    useState(
      "",
    );

  const launcherRef =
    useRef<HTMLButtonElement>(null);

  const widgetRef =
    useRef<HTMLDivElement>(null);

  const closeButtonRef =
    useRef<HTMLButtonElement>(null);

  // A nonmodal floating assistant must still support keyboard exit and
  // deliberate focus management. Focus the close button rather than the
  // textarea so phone keyboards do not unexpectedly cover page content.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        launcherRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // This assistant is a nonmodal helper. On phones, leaving it open while
  // using a menu link or another page control can cover the destination.
  // Dismiss on genuine interactions outside the widget, without swallowing
  // the pointer event or preventing the visitor's intended navigation.
  // Keyboard users can also Tab away without leaving a floating panel open.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function dismissIfOutside(event: Event): void {
      const target = event.target;
      if (
        target instanceof Node &&
        !widgetRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", dismissIfOutside);
    document.addEventListener("focusin", dismissIfOutside);

    return () => {
      document.removeEventListener("pointerdown", dismissIfOutside);
      document.removeEventListener("focusin", dismissIfOutside);
    };
  }, [isOpen]);


  const [
    messages,
    setMessages,
  ] =
    useState<ChatMessage[]>([
      {
        id:
          "welcome",

        role:
          "assistant",

        text:
          copy.welcome,
      },
    ]);

  // Scroll only the conversation region, not the document or the phone
  // viewport. Otherwise fresh answers appear below the visible transcript
  // after a customer has asked several questions.
  const messagesPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const panel = messagesPanelRef.current;
    if (panel) {
      panel.scrollTop = panel.scrollHeight;
    }
  }, [isOpen, messages]);


  // Keep React keys unique even after the last 40 messages have been
  // retained and many rapid questions arrive within the same millisecond.
  // Allocate outside React state updater callbacks (which may be replayed).
  const nextMessageSequence = useRef(0);

  function nextMessageId(role: "assistant" | "user"): string {
    nextMessageSequence.current += 1;
    return `${role}-${nextMessageSequence.current}`;
  }


  function addAssistantMessage(
    text:
      string,
    href?:
      string,
    actionLabel?:
      string,
  ): void {
    const messageId = nextMessageId("assistant");

    setMessages(
      (
        current,
      ) => [
        ...current,
        {
          id:
            messageId,

          role:
            "assistant" as const,

          text,

          ...(href
            ? {
                href,
              }
            : {}),

          ...(actionLabel
            ? {
                actionLabel,
              }
            : {}),
        },
      ].slice(-MAX_VISIBLE_CHAT_MESSAGES),
    );
  }


  function handleQuestion(
    rawQuestion:
      string,
  ): void {
    const question =
      normalizeMessage(
        rawQuestion,
      );

    if (
      question.length ===
      0
    ) {
      return;
    }

    const messageId = nextMessageId("user");

    setMessages(
      (
        current,
      ) => [
        ...current,
        {
          id:
            messageId,

          role:
            "user" as const,

          text:
            rawQuestion.trim(),
        },
      ].slice(-MAX_VISIBLE_CHAT_MESSAGES),
    );

    if (
      includesAny(
        question,
        [
          "alerg",
          "allerg",
          "gluten",
          "orzech",
          "nuez",
          "nuts",
          "lakto",
          "lact",
        ],
      )
    ) {
      addAssistantMessage(
        copy.allergyAnswer,
        contactHref,
        copy.contactTeam,
      );

      return;
    }

    // Visitors often ask about prices and opening hours without using
    // the words "menu" or "restaurant". Use the published sections;
    // never invent live opening status, stock or commercial prices.
    const commercialIntent = getCommercialInquiryIntent(question, locale);
    if (commercialIntent === "hours") {
      addAssistantMessage(
        copy.hoursAnswer,
        "#locations",
        copy.viewLocations,
      );
      return;
    }
    if (commercialIntent === "prices") {
      addAssistantMessage(
        copy.menuAnswer,
        "#menu",
        copy.viewMenu,
      );
      return;
    }

    if (
      includesAny(
        question,
        [
          "menu",
          "menú",
          "carta",
          "dish",
          "food",
          "jedzenie",
        ],
      )
    ) {
      addAssistantMessage(
        copy.menuAnswer,
        "#menu",
        copy.viewMenu,
      );

      return;
    }

    if (
      includesAny(
        question,
        [
          "pedido",
          "pedir",
          "order",
          "zamów",
          "zamow",
          "dostaw",
          "delivery",
          "domicilio",
        ],
      )
    ) {
      addAssistantMessage(
        copy.orderAnswer,
        orderHref,
        copy.startOrder,
      );

      return;
    }

    if (
      includesAny(
        question,
        [
          "catering",
          "evento",
          "event",
          "urodzin",
          "cumple",
          "birthday",
          "empresa",
          "firm",
          "corporate",
          "desayuno",
          "breakfast",
          "śniadan",
          "sniadan",
          "decor",
          "sorpresa",
          "surprise",
        ],
      )
    ) {
      addAssistantMessage(
        copy.eventsAnswer,
        contactHref,
        copy.viewEvents,
      );

      return;
    }

    if (
      includesAny(
        question,
        [
          "dirección",
          "direccion",
          "address",
          "lokal",
          "location",
          "restaurante",
          "restaurant",
          "brzeska",
          "czapelska",
        ],
      )
    ) {
      addAssistantMessage(
        copy.locationsAnswer,
        "#locations",
        copy.viewLocations,
      );

      return;
    }

    if (
      includesAny(
        question,
        [
          "recompensa",
          "promoción",
          "promocion",
          "promocje",
          "promocja",
          "promotion",
          "discount",
          "descuento",
          "rabat",
          "oferta",
          "oferty",
          "reward",
          "nagrod",
          "refer",
          "polec",
          "qr",
          "token",
          "puntos",
          "points",
        ],
      )
    ) {
      // The loyalty program is not active yet. The answer explicitly
      // invites visitors to ask our team about current promotions.
      // Do not label an inactive rewards section as "Contact the team".
      addAssistantMessage(
        copy.rewardsAnswer,
        contactHref,
        copy.contactTeam,
      );

      return;
    }

    addAssistantMessage(
      copy.fallbackAnswer,
      contactHref,
      copy.contactTeam,
    );
  }


  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    const question =
      input;

    setInput(
      "",
    );

    handleQuestion(
      question,
    );
  }


  return (
    <div
      ref={widgetRef}
      className={`
        fixed
        right-3
        z-50
        sm:right-6
        sm:bottom-6
        ${isOpen
          ? "bottom-[max(1rem,env(safe-area-inset-bottom))]"
          : "bottom-[max(5rem,env(safe-area-inset-bottom))]"}
      `}
    >
      {
        isOpen
          ? (
              <section
                id="rincon-ai-panel"
                role="dialog"
                aria-label={copy.title}
                className="
                  mb-3
                  flex
                  h-[min(34rem,calc(100dvh-7rem))]
                  w-[min(24rem,calc(100vw-2rem))]
                  flex-col
                  overflow-hidden
                  rounded-[1.75rem]
                  border
                  border-black/10
                  bg-white
                  shadow-2xl
                "
              >
                <header
                  className="
                    flex
                    items-center
                    gap-3
                    bg-[#123d73]
                    px-4
                    py-3
                    text-white
                  "
                >
                  <div
                    className="
                      grid
                      size-12
                      shrink-0
                      place-items-center
                      rounded-2xl
                      bg-[#f7c600]
                      shadow-sm
                    "
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 64 64"
                      className="size-10"
                      fill="none"
                    >
                      <rect
                        x="13"
                        y="16"
                        width="38"
                        height="34"
                        rx="13"
                        fill="#ffffff"
                        stroke="#12100e"
                        strokeWidth="3"
                      />

                      <path
                        d="M32 16V10"
                        stroke="#12100e"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      <circle
                        cx="32"
                        cy="8"
                        r="4"
                        fill="#c92d39"
                      />

                      <circle
                        cx="25"
                        cy="31"
                        r="3"
                        fill="#123d73"
                      />

                      <circle
                        cx="39"
                        cy="31"
                        r="3"
                        fill="#123d73"
                      />

                      <path
                        d="M24 40C26.5 43 29 44 32 44C35 44 37.5 43 40 40"
                        stroke="#c92d39"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      <path
                        d="M13 27H8M56 27H51"
                        stroke="#12100e"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <p
                      className="
                        font-serif
                        text-lg
                        font-bold
                      "
                    >
                      {copy.title}
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-xs
                        text-white/75
                      "
                    >
                      {copy.status}
                    </p>
                  </div>

                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      launcherRef.current?.focus();
                    }}
                    className="
                      grid
                      size-9
                      place-items-center
                      rounded-full
                      border
                      border-white/20
                      text-lg
                      hover:bg-white/10
                    "
                    aria-label={copy.close}
                  >
                    ×
                  </button>
                </header>

                <div
                  className="
                    flex-1
                    space-y-3
                    overflow-y-auto
                    bg-[#faf9f6]
                    p-4
                  "
                  ref={messagesPanelRef}
                  role="log"
                  aria-live="polite"
                  aria-relevant="additions"
                  aria-atomic="false"
                >
                  {
                    messages.map(
                      (
                        message,
                      ) => (
                        <div
                          key={
                            message.id
                          }
                          className={
                            message.role ===
                            "user"
                              ? "ml-auto max-w-[88%]"
                              : "mr-auto max-w-[92%]"
                          }
                        >
                          <div
                            className={
                              message.role ===
                              "user"
                                ? "rounded-2xl rounded-br-md bg-[#123d73] px-4 py-3 text-sm leading-6 text-white"
                                : "rounded-2xl rounded-bl-md border border-black/5 bg-white px-4 py-3 text-sm leading-6 text-[#2d2925] shadow-sm"
                            }
                          >
                            {message.text}
                          </div>

                          {
                            message.href &&
                            message.actionLabel
                              ? (
                                  <a
                                    href={
                                      message.href
                                    }
                                    onClick={() => setIsOpen(false)}
                                    className="
                                      mt-2
                                      inline-flex
                                      min-h-9
                                      items-center
                                      rounded-full
                                      bg-[#f7c600]
                                      px-4
                                      py-2
                                      text-xs
                                      font-black
                                      text-[#12100e]
                                      shadow-sm
                                      hover:brightness-95
                                    "
                                  >
                                    {
                                      message.actionLabel
                                    }
                                  </a>
                                )
                              : null
                          }
                        </div>
                      ),
                    )
                  }
                </div>

                <div
                  className="
                    border-t
                    border-black/5
                    bg-white
                    p-3
                  "
                >
                  <div
                    className="
                      mb-3
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    <a
                      href="#menu"
                      onClick={() => setIsOpen(false)}
                      className="
                        rounded-full
                        border
                        border-black/10
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        text-[#2d2925]
                        hover:bg-[#faf9f6]
                      "
                    >
                      {copy.menu}
                    </a>

                    <a
                      href={orderHref}
                      onClick={() => setIsOpen(false)}
                      className="
                        rounded-full
                        border
                        border-black/10
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        text-[#2d2925]
                        hover:bg-[#faf9f6]
                      "
                    >
                      {copy.order}
                    </a>

                    <a
                      href={contactHref}
                      onClick={() => setIsOpen(false)}
                      className="
                        rounded-full
                        border
                        border-black/10
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        text-[#2d2925]
                        hover:bg-[#faf9f6]
                      "
                    >
                      {copy.events}
                    </a>

                    <a
                      href="#locations"
                      onClick={() => setIsOpen(false)}
                      className="
                        rounded-full
                        border
                        border-black/10
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        text-[#2d2925]
                        hover:bg-[#faf9f6]
                      "
                    >
                      {copy.locations}
                    </a>
                  </div>

                  <form
                    onSubmit={
                      handleSubmit
                    }
                    className="
                      flex
                      items-end
                      gap-2
                    "
                  >
                    <label
                      className="
                        sr-only
                      "
                      htmlFor="rincon-ai-question"
                    >
                      {copy.placeholder}
                    </label>

                    <textarea
                      id="rincon-ai-question"
                      value={input}
                      onChange={
                        (
                          event,
                        ) =>
                          setInput(
                            event.target.value,
                          )
                      }
                      rows={1}
                      maxLength={600}
                      placeholder={
                        copy.placeholder
                      }
                      className="
                        min-h-11
                        max-h-28
                        flex-1
                        resize-y
                        rounded-2xl
                        border
                        border-black/10
                        bg-[#faf9f6]
                        px-4
                        py-3
                        text-sm
                        text-[#12100e]
                        outline-none
                        transition
                        placeholder:text-[#857b70]
                        focus:border-[#123d73]
                        focus:ring-2
                        focus:ring-[#123d73]/15
                      "
                    />

                    <button
                      type="submit"
                      disabled={
                        input
                          .trim()
                          .length ===
                        0
                      }
                      className="
                        min-h-11
                        rounded-2xl
                        bg-[#c92d39]
                        px-4
                        py-3
                        text-sm
                        font-black
                        text-white
                        shadow-sm
                        transition
                        hover:brightness-95
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      {copy.send}
                    </button>
                  </form>

                  <p
                    className="
                      mt-2
                      text-[0.68rem]
                      leading-4
                      text-[#756b61]
                    "
                  >
                    {copy.safety}
                  </p>
                </div>
              </section>
            )
          : null
      }

      <button
        ref={launcherRef}
        type="button"
        aria-controls="rincon-ai-panel"
        onClick={
          () =>
            setIsOpen(
              (
                open,
              ) =>
                !open,
            )
        }
        className="
          group
          flex
          min-h-14
          items-center
          gap-3
          rounded-full
          border
          border-black/10
          bg-white
          p-1
          sm:min-h-16
          sm:p-2
          sm:pr-5
          shadow-2xl
          transition
          hover:-translate-y-0.5
        "
        aria-expanded={isOpen}
        aria-label={
          isOpen
            ? copy.close
            : copy.open
        }
      >
        <span
          className="
            relative
            grid
            size-12
            place-items-center
            rounded-full
            bg-[#f7c600]
            ring-4
            ring-white
          "
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 64 64"
            className="
              size-10
              transition
              group-hover:scale-105
            "
            fill="none"
          >
            <rect
              x="13"
              y="16"
              width="38"
              height="34"
              rx="13"
              fill="#ffffff"
              stroke="#12100e"
              strokeWidth="3"
            />

            <path
              d="M32 16V10"
              stroke="#12100e"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <circle
              cx="32"
              cy="8"
              r="4"
              fill="#c92d39"
            />

            <circle
              cx="25"
              cy="31"
              r="3"
              fill="#123d73"
            />

            <circle
              cx="39"
              cy="31"
              r="3"
              fill="#123d73"
            />

            <path
              d="M24 40C26.5 43 29 44 32 44C35 44 37.5 43 40 40"
              stroke="#c92d39"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          <span
            className="
              absolute
              right-0
              bottom-0
              size-3
              rounded-full
              border-2
              border-white
              bg-emerald-500
            "
          />
        </span>

        <span
          className="
            hidden
            text-left
            sm:block
          "
        >
          <span
            className="
              block
              text-sm
              font-black
              text-[#12100e]
            "
          >
            {copy.title}
          </span>

          <span
            className="
              block
              text-[0.68rem]
              font-semibold
              text-[#756b61]
            "
          >
            {copy.status}
          </span>
        </span>
      </button>
    </div>
  );
}
