"use client";

import {
  useState,
  type FormEvent,
} from "react";

import type {
  AppLocale,
} from "@/i18n/config";


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
        "Cześć! Jestem Rincón AI. Mogę pomóc w menu, zamówieniach, cateringu, wydarzeniach, lokalach i kontakcie. Na tym etapie korzystam wyłącznie ze sprawdzonych działań dostępnych na stronie.",

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
        "Aktualne menu znajdziesz w sekcji Menu. Gdy połączenie z RC ORDERA jest aktywne, strona korzysta z bieżącego katalogu restauracji.",

      orderAnswer:
        "Mogę skierować Cię bezpośrednio do systemu zamówień RC ORDERA.",

      eventsAnswer:
        "Rincón obsługuje catering, wydarzenia, urodziny, firmy, rodziny, śniadania, niespodzianki i dekoracje. Najbezpieczniej przejść do kontaktu i opisać wydarzenie.",

      locationsAnswer:
        "Informacje o lokalach Rincón znajdziesz w sekcji Lokale.",

      rewardsAnswer:
        "Program Rincón Rewards jest rozwijany wokół zweryfikowanych zakupów i poleceń. Nagrody będą walidowane przez system, a nie wyłącznie przez obraz kodu QR.",

      allergyAnswer:
        "W przypadku alergii lub poważnych ograniczeń żywieniowych nie polegaj wyłącznie na czacie. Skontaktuj się bezpośrednio z personelem restauracji przed zamówieniem.",

      fallbackAnswer:
        "Mogę teraz pomóc w menu, zamówieniach, cateringu, lokalach, nagrodach albo skierować Cię do zespołu Rincón. Pełne odpowiedzi AI oparte na danych restauracji zostaną podłączone jako kolejna warstwa.",

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
        "¡Hola! Soy Rincón AI. Puedo ayudarte con menú, pedidos, catering, eventos, restaurantes y contacto. En esta etapa utilizo únicamente acciones verificadas disponibles en la web.",

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
        "Puedes consultar el menú actual en la sección Menú. Cuando la conexión con RC ORDERA está activa, la web utiliza el catálogo vigente del restaurante.",

      orderAnswer:
        "Puedo llevarte directamente al sistema propio de pedidos RC ORDERA.",

      eventsAnswer:
        "Rincón atiende catering, eventos, cumpleaños, empresas, familias, desayunos, sorpresas y decoración. Lo más seguro es contactar al equipo y describir lo que necesitas.",

      locationsAnswer:
        "Puedes consultar la información de nuestros restaurantes en la sección Restaurantes.",

      rewardsAnswer:
        "Rincón Rewards se está construyendo alrededor de compras y referidos realmente validados. Las recompensas se validarán en el sistema y no solamente mostrando una imagen QR.",

      allergyAnswer:
        "Si tienes alergias o restricciones alimentarias importantes, no dependas solamente del chat. Confirma directamente con el personal del restaurante antes de hacer el pedido.",

      fallbackAnswer:
        "Ahora puedo ayudarte con menú, pedidos, catering, restaurantes, recompensas o conectarte con el equipo de Rincón. La capa completa de IA basada en datos reales del restaurante se conectará como siguiente etapa.",

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
        "Hi! I’m Rincón AI. I can help with the menu, ordering, catering, events, locations and contact. At this stage I only use verified actions available on the website.",

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
        "You can view the current menu in the Menu section. When the RC ORDERA connection is active, the website uses the restaurant’s current catalog.",

      orderAnswer:
        "I can take you directly to the RC ORDERA ordering system.",

      eventsAnswer:
        "Rincón supports catering, events, birthdays, companies, families, breakfasts, surprises and table decoration. The safest next step is to contact the team and describe what you need.",

      locationsAnswer:
        "You can find our restaurant information in the Locations section.",

      rewardsAnswer:
        "Rincón Rewards is being built around verified purchases and referrals. Rewards will be validated by the system rather than by simply showing a QR image.",

      allergyAnswer:
        "For allergies or important dietary restrictions, do not rely on chat alone. Confirm directly with restaurant staff before ordering.",

      fallbackAnswer:
        "I can currently help with menu, ordering, catering, locations, rewards or connect you with the Rincón team. The full AI layer grounded in live restaurant data will be connected as the next stage.",

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


  function addAssistantMessage(
    text:
      string,
    href?:
      string,
    actionLabel?:
      string,
  ): void {
    setMessages(
      (
        current,
      ) => [
        ...current,
        {
          id:
            `assistant-${Date.now()}-${current.length}`,

          role:
            "assistant",

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
      ],
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

    setMessages(
      (
        current,
      ) => [
        ...current,
        {
          id:
            `user-${Date.now()}-${current.length}`,

          role:
            "user",

          text:
            rawQuestion.trim(),
        },
      ],
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
      addAssistantMessage(
        copy.rewardsAnswer,
        "#rewards",
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
      className="
        fixed
        right-4
        bottom-4
        z-50
        sm:right-6
        sm:bottom-6
      "
    >
      {
        isOpen
          ? (
              <section
                role="dialog"
                aria-label={copy.title}
                className="
                  mb-3
                  flex
                  h-[min(34rem,calc(100vh-7rem))]
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
                    type="button"
                    onClick={
                      () =>
                        setIsOpen(
                          false,
                        )
                    }
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
                  aria-live="polite"
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
        type="button"
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
          min-h-16
          items-center
          gap-3
          rounded-full
          border
          border-black/10
          bg-white
          p-2
          pr-5
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
            text-left
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
