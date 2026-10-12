import {
  RinconAiWidget,
} from "@/components/rincon-ai/RinconAiWidget";

import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  buildRouteMetadata,
} from "@/config/seo";

import {
  buildRoutePath,
} from "@/config/routes";

import {
  siteConfig,
} from "@/config/site";

import {
  getBrandHeroImage,
  getBrandOpenGraphImage,
  getPrimaryBrandLogo,
  getPublishedBrandAsset,
} from "@/lib/brand/public-brand";

import {
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type AppLocale,
} from "@/i18n/config";

import {
  buildRcOrderaOrderUrl,
} from "@/integrations/rc-ordera/config";

import {
  getRcOrderaPublicCatalog,
} from "@/integrations/rc-ordera/public-catalog";

import {
  getPublishedCmsTextContent,
  getPublishedCmsTextBatch,
} from "@/lib/cms/public-content";

import {
  HOME_EDITABLE_KEYS,
  HOME_EDITABLE_SECTIONS,
  validHomeCmsCopy,
} from "@/config/home-cms";


import FoodGallery from "@/components/commercial/FoodGallery";

import { SocialLinks } from "@/components/social/SocialLinks";


/* ============================================================
   TYPES
   ============================================================ */

interface ServiceCopy {
  readonly eyebrow:
    string;

  readonly title:
    string;

  readonly description:
    string;

  readonly tone:
    "yellow" | "blue" | "red";
}


interface MenuItemCopy {
  readonly title:
    string;

  readonly description:
    string;
}


interface StepCopy {
  readonly title:
    string;

  readonly description:
    string;
}


interface FaqCopy {
  readonly question:
    string;

  readonly answer:
    string;
}


interface HomeCopy {
  readonly languageLabel:
    string;

  readonly navigationLabel:
    string;

  readonly nav: {
    readonly menu:
      string;

    readonly services:
      string;

    readonly stories:
      string;

    readonly community:
      string;

    readonly rewards:
      string;

    readonly locations:
      string;

    readonly order:
      string;
  };

  readonly announcement:
    string;

  readonly hero: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly primaryAction:
      string;

    readonly secondaryAction:
      string;

    readonly highlights:
      readonly string[];
  };

  readonly services: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly items:
      readonly ServiceCopy[];
  };

  readonly ordering: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly action:
      string;

    readonly secondaryAction:
      string;

    readonly steps:
      readonly StepCopy[];
  };

  readonly menu: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly action:
      string;

    readonly items:
      readonly MenuItemCopy[];
  };

  readonly stories: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly labels:
      readonly string[];
  };

  readonly community: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly features:
      readonly string[];

    readonly action:
      string;
  };

  readonly reviews: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly action:
      string;

    readonly suggestionAction:
      string;
  };

  readonly rewards: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly purchaseTitle:
      string;

    readonly purchaseDescription:
      string;

    readonly referralTitle:
      string;

    readonly referralDescription:
      string;

    readonly tokenTitle:
      string;

    readonly tokenDescription:
      string;

    readonly action:
      string;
  };

  readonly ai: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly features:
      readonly string[];

    readonly action:
      string;
  };

  readonly events: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly categories:
      readonly string[];

    readonly action:
      string;
  };

  readonly locations: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly open:
      string;

    readonly comingSoon:
      string;

    readonly directions:
      string;
  };

  readonly social: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;
  };

  readonly legal: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly items:
      readonly string[];
  };

  readonly faq: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly items:
      readonly FaqCopy[];
  };

  readonly contact: {
    readonly eyebrow:
      string;

    readonly title:
      string;

    readonly description:
      string;

    readonly contactAction:
      string;

    readonly careersTitle:
      string;

    readonly careersDescription:
      string;

    readonly careersAction:
      string;
  };

  readonly footer: {
    readonly description:
      string;

    readonly rights:
      string;
  };
}


/* ============================================================
   CONTENT
   ============================================================ */

const homeContent:
  Readonly<
    Record<
      AppLocale,
      HomeCopy
    >
  > = {

  /* ========================================================
     POLISH
     ======================================================== */

  pl: {
    languageLabel:
      "Wybierz język",

    navigationLabel:
      "Główna nawigacja",

    nav: {
      menu:
        "Menu",

      services:
        "Usługi",

      stories:
        "Historie",

      community:
        "Społeczność",

      rewards:
        "Nagrody",

      locations:
        "Lokale",

      order:
        "Zamów",
    },

    announcement:
      "Kolumbijska gastronomia • Warszawa • Catering • Wydarzenia • RC ORDERA",

    hero: {
      eyebrow:
        "Kolumbia w sercu Warszawy",

      title:
        "Smak Kolumbii w sercu Warszawy.",

      description:
        "Odkryj autentyczne kolumbijskie potrawy, zamów jedzenie online lub zapytaj o catering na rodzinną uroczystość, spotkanie firmowe czy wydarzenie w Warszawie.",

      primaryAction:
        "Zamów online",

      secondaryAction:
        "Poznaj Rincón",

      highlights: [
        "Autentyczna kuchnia kolumbijska",
        "Catering i wydarzenia",
        "Społeczność Rincón",
        "PL • ES • EN",
      ],
    },

    services: {
      eyebrow:
        "Wszystko w jednym miejscu",

      title:
        "Od rodzinnego obiadu po duże wydarzenie.",

      description:
        "Wspólne obiady, urodziny i firmowe spotkania smakują lepiej z Kolumbią. Przygotujemy tradycyjne dania i catering dopasowany do Twojego wydarzenia.",

      items: [
        {
          eyebrow:
            "01",

          title:
            "Catering",

          description:
            "Kolumbijskie menu na wydarzenia prywatne, firmowe i kulturalne.",

          tone:
            "yellow",
        },
        {
          eyebrow:
            "02",

          title:
            "Urodziny",

          description:
            "Jedzenie, atmosfera i rozwiązania dla wyjątkowych celebracji.",

          tone:
            "red",
        },
        {
          eyebrow:
            "03",

          title:
            "Dla firm",

          description:
            "Catering, spotkania, integracje i oferty dla zespołów.",

          tone:
            "blue",
        },
        {
          eyebrow:
            "04",

          title:
            "Dla rodzin",

          description:
            "Kolumbijskie doświadczenia stworzone do wspólnego stołu.",

          tone:
            "yellow",
        },
        {
          eyebrow:
            "05",

          title:
            "Śniadania",

          description:
            "Kolumbijskie śniadania i specjalne zestawy na wyjątkowe okazje.",

          tone:
            "blue",
        },
        {
          eyebrow:
            "06",

          title:
            "Niespodzianki",

          description:
            "Prezenty gastronomiczne i doświadczenia przygotowane dla bliskich.",

          tone:
            "red",
        },
        {
          eyebrow:
            "07",

          title:
            "Dekoracje stołów",

          description:
            "Kompozycje i dodatkowe elementy tworzące wyjątkowy moment.",

          tone:
            "yellow",
        },
        {
          eyebrow:
            "08",

          title:
            "Piekarnia",

          description:
            "Kolumbijskie wypieki, przekąski i produkty tworzone przez Rincón.",

          tone:
            "blue",
        },
      ],
    },

    ordering: {
      eyebrow:
        "RC ORDERA",

      title:
        "Zamów kolumbijskie jedzenie wygodnie online.",

      description:
        "Wybierz ulubione dania, złóż zamówienie i sprawdź dostępne opcje odbioru lub dostawy.",

      action:
        "Przejdź do zamówienia",

      secondaryAction:
        "Zobacz jak to działa",

      steps: [
        {
          title:
            "Wybierz",

          description:
            "Odkryj aktualne menu i produkty dostępne w danym lokalu.",
        },
        {
          title:
            "Zamów",

          description:
            "Wybierz odbiór osobisty lub dostawę, jeśli jest dostępna.",
        },
        {
          title:
            "Wracaj",

          description:
            "Wracaj po ulubione kolumbijskie smaki i odkrywaj nasze nowości.",
        },
      ],
    },

    menu: {
      eyebrow:
        "Kuchnia kolumbijska",

      title:
        "Smaki, z których powstał Rincón Colombiano.",

      description:
        "Sprawdź aktualne menu, ceny i dostępność kolumbijskich dań oraz napojów.",

      action:
        "Zobacz aktualne menu",

      items: [
        {
          title:
            "Bandeja Paisa",

          description:
            "Jedno z najbardziej rozpoznawalnych dań kuchni kolumbijskiej.",
        },
        {
          title:
            "Lechona",

          description:
            "Kolumbijska klasyka przygotowywana w stylu Rincón.",
        },
        {
          title:
            "Empanadas",

          description:
            "Chrupiące przekąski, które są częścią naszej codziennej historii.",
        },
        {
          title:
            "Tamal Tolimense",

          description:
            "Tradycyjny smak związany z kolumbijską kulturą i rodziną.",
        },
        {
          title:
            "Dorada",

          description:
            "Ryba podawana w naszej kolumbijskiej interpretacji.",
        },
        {
          title:
            "Buñuelos",

          description:
            "Kolumbijski klasyk idealny do kawy, śniadania lub na wydarzenia.",
        },
      ],
    },

    stories: {
      eyebrow:
        "Foto • Video • Historie",

      title:
        "Rincón opowiedziany przez ludzi, jedzenie i wydarzenia.",

      description:
        "Poznaj historię Rincón Colombiano, smaki naszej kuchni i wydarzenia, które łączą ludzi.",

      labels: [
        "Nasza kuchnia",
        "Za kulisami",
        "Wydarzenia",
        "Historie klientów",
      ],
    },

    community: {
      eyebrow:
        "Rincón Community",

      title:
        "Nie tylko obserwujący. Prawdziwa społeczność wokół marki.",

      description:
        "Śledź nasze wydarzenia, zdjęcia i historie, a także dziel się radością z kolumbijskiej kuchni.",

      features: [
        "Profile użytkowników",
        "Posty, zdjęcia i filmy",
        "Komentarze i reakcje",
        "Historie i zapisane treści",
        "Obserwowanie profili",
        "Wydarzenia i kultura",
      ],

      action:
        "Poznaj społeczność",
    },

    reviews: {
      eyebrow:
        "Opinie i sugestie",

      title:
        "Słuchamy klientów i pokazujemy prawdziwe doświadczenia.",

      description:
        "Twoja opinia pomaga nam się rozwijać. Podziel się doświadczeniem lub napisz, co możemy poprawić.",

      action:
        "Zostaw opinię",

      suggestionAction:
        "Wyślij sugestię",
    },

    rewards: {
      eyebrow:
        "Rincón Rewards",

      title:
        "Każda relacja z marką może dawać więcej.",

      description:
        "Przygotowujemy program dla stałych gości. Punkty i nagrody nie są jeszcze aktywne — o zasadach poinformujemy przed uruchomieniem.",

      purchaseTitle:
        "Nagrody za zakupy",

      purchaseDescription:
        "W przyszłości poinformujemy o korzyściach dostępnych dla stałych gości. Obecne zakupy nie zbierają punktów.",

      referralTitle:
        "Poleć znajomego",

      referralDescription:
        "Zaproś znajomych na kolumbijskie jedzenie. Program poleceń i jego warunki jeszcze nie obowiązują.",

      tokenTitle:
        "Bezpieczny QR / token",

      tokenDescription:
        "Wszystkie zasady promocji i ewentualne kody ogłosimy przed uruchomieniem programu.",

      action:
        "Zapytaj o przyszłe oferty",
    },

    ai: {
      eyebrow:
        "Rincón AI",

      title:
        "Pomoc klientowi wtedy, kiedy jej potrzebuje.",

      description:
        "Masz pytanie o menu, zamówienia lub catering? Zapytaj naszego asystenta albo skontaktuj się z obsługą.",

      features: [
        "Menu i dostępność",
        "Zamówienia",
        "Rezerwacje",
        "Catering i wydarzenia",
        "Nagrody i konto",
        "Przekazanie rozmowy człowiekowi",
      ],

      action:
        "Zapytaj Rincón AI",
    },

    events: {
      eyebrow:
        "Celebracje i biznes",

      title:
        "Powiedz nam, co planujesz. Rincón zajmie się doświadczeniem.",

      description:
        "Jedno miejsce do zapytań dotyczących cateringu, firm, rodzin, urodzin, śniadań, niespodzianek, dekoracji i wydarzeń.",

      categories: [
        "Catering",
        "Firmy",
        "Rodziny",
        "Urodziny",
        "Śniadania",
        "Niespodzianki",
        "Dekoracje",
        "Wydarzenia",
      ],

      action:
        "Skontaktuj się w sprawie wydarzenia",
    },

    locations: {
      eyebrow:
        "Warszawa",

      title:
        "Rincón coraz bliżej naszej społeczności.",

      description:
        "Odwiedź nas przy ul. Czapelskiej 33 w Warszawie. O nowym lokalu na Pradze Północ poinformujemy po otwarciu.",

      open:
        "Otwarte",

      comingSoon:
        "Wkrótce",

      directions:
        "Jak dojechać",
    },

    social: {
      eyebrow:
        "Social",

      title:
        "Internet prowadzi do Rincón. Rincón prowadzi dalej.",

      description:
        "Odkryj nowe dania, wydarzenia i wiadomości z restauracji na naszych profilach społecznościowych.",
    },

    legal: {
      eyebrow:
        "Zaufanie i zgodność",

      title:
        "Prywatność, cookies i jasne zasady od początku.",

      description:
        "Dbamy o jasne zasady zamawiania, kontaktu i ochrony danych osobowych naszych gości.",

      items: [
        "Polityka prywatności",
        "Cookies i zgody",
        "Regulamin strony",
        "Warunki sprzedaży",
        "Zasady społeczności",
        "Program lojalnościowy",
        "Reklamacje",
        "Dostępność",
      ],
    },

    faq: {
      eyebrow:
        "FAQ",

      title:
        "Najczęściej zadawane pytania.",

      items: [
        {
          question:
            "Czy mogę zamówić online?",

          answer:
            "Tak. Kliknij „Zamów online”, wybierz dania i sprawdź dostępne sposoby odbioru lub dostawy.",
        },
        {
          question:
            "Czy organizujecie catering?",

          answer:
            "Tak. Obsługujemy zapytania prywatne, rodzinne, firmowe i wydarzenia specjalne.",
        },
        {
          question:
            "Czy mogę zarezerwować stolik?",

          answer:
            "Skontaktuj się z nami przed wizytą, aby zapytać o dostępność stolików.",
        },
        {
          question:
            "Jak działa program nagród?",

          answer:
            "Program jest w przygotowaniu. Obecnie nie przyznajemy punktów ani nagród za polecenia.",
        },
        {
          question:
            "Czy mogę dołączyć do zespołu?",

          answer:
            "Tak. Kandydaci będą mogli przesyłać zgłoszenia przez sekcję Pracuj z nami.",
        },
      ],
    },

    contact: {
      eyebrow:
        "Kontakt",

      title:
        "Masz pomysł, pytanie lub wydarzenie? Porozmawiajmy.",

      description:
        "Kontakt, sugestie, współpraca, catering i sprawy klientów będą kierowane do odpowiedniego procesu zamiast trafiać do jednego chaotycznego formularza.",

      contactAction:
        "Skontaktuj się",

      careersTitle:
        "Pracuj z nami",

      careersDescription:
        "Budujemy markę, gastronomię i technologię. Szukamy ludzi, którzy chcą rosnąć razem z Rincón Colombiano.",

      careersAction:
        "Zobacz możliwości",
    },

    footer: {
      description:
        "Kolumbijska gastronomia, kultura, społeczność i technologia z Warszawy.",

      rights:
        "Wszelkie prawa zastrzeżone.",
    },
  },


  /* ========================================================
     SPANISH
     ======================================================== */

  es: {
    languageLabel:
      "Elegir idioma",

    navigationLabel:
      "Navegación principal",

    nav: {
      menu:
        "Menú",

      services:
        "Servicios",

      stories:
        "Historias",

      community:
        "Comunidad",

      rewards:
        "Recompensas",

      locations:
        "Restaurantes",

      order:
        "Pedir",
    },

    announcement:
      "Gastronomía colombiana • Varsovia • Catering • Eventos • RC ORDERA",

    hero: {
      eyebrow:
        "Colombia en el corazón de Varsovia",

      title:
        "El auténtico sabor de Colombia en Varsovia.",

      description:
        "Disfruta nuestros platos tradicionales, haz tu pedido en línea o descubre nuestro catering para celebraciones familiares, reuniones de empresa y eventos en Varsovia.",

      primaryAction:
        "Pedir online",

      secondaryAction:
        "Descubre Rincón",

      highlights: [
        "Gastronomía colombiana",
        "Catering y eventos",
        "Comunidad Rincón",
        "PL • ES • EN",
      ],
    },

    services: {
      eyebrow:
        "Todo en un solo lugar",

      title:
        "Desde una comida familiar hasta un gran evento.",

      description:
        "Llevamos el sabor y la tradición de Colombia a tus celebraciones, reuniones familiares y eventos empresariales en Varsovia. Cuéntanos qué estás preparando.",

      items: [
        {
          eyebrow:
            "01",

          title:
            "Catering",

          description:
            "Gastronomía colombiana para eventos privados, empresariales y culturales.",

          tone:
            "yellow",
        },
        {
          eyebrow:
            "02",

          title:
            "Cumpleaños",

          description:
            "Comida, ambiente y experiencias para celebrar momentos importantes.",

          tone:
            "red",
        },
        {
          eyebrow:
            "03",

          title:
            "Empresas",

          description:
            "Catering, reuniones, integraciones y soluciones para equipos.",

          tone:
            "blue",
        },
        {
          eyebrow:
            "04",

          title:
            "Familias",

          description:
            "Experiencias colombianas diseñadas para compartir alrededor de la mesa.",

          tone:
            "yellow",
        },
        {
          eyebrow:
            "05",

          title:
            "Desayunos",

          description:
            "Desayunos colombianos y experiencias especiales para regalar o compartir.",

          tone:
            "blue",
        },
        {
          eyebrow:
            "06",

          title:
            "Sorpresas",

          description:
            "Regalos gastronómicos y momentos preparados para personas especiales.",

          tone:
            "red",
        },
        {
          eyebrow:
            "07",

          title:
            "Decoración de mesas",

          description:
            "Detalles que complementan celebraciones, desayunos y eventos.",

          tone:
            "yellow",
        },
        {
          eyebrow:
            "08",

          title:
            "Panadería",

          description:
            "Productos colombianos, horneados y preparaciones propias de Rincón.",

          tone:
            "blue",
        },
      ],
    },

    ordering: {
      eyebrow:
        "RC ORDERA",

      title:
        "Pide tus platos colombianos favoritos en línea.",

      description:
        "Explora el menú, elige tus platos y consulta las opciones disponibles para recoger o recibir tu pedido.",

      action:
        "Ir a pedir",

      secondaryAction:
        "Cómo funciona",

      steps: [
        {
          title:
            "Elige",

          description:
            "Consulta el menú y la disponibilidad real del restaurante.",
        },
        {
          title:
            "Pide",

          description:
            "Elige recogida en el restaurante o entrega cuando esté disponible.",
        },
        {
          title:
            "Vuelve",

          description:
            "Vuelve a disfrutar nuestros sabores y descubre las novedades de Rincón Colombiano.",
        },
      ],
    },

    menu: {
      eyebrow:
        "Cocina colombiana",

      title:
        "Los sabores que construyeron Rincón Colombiano.",

      description:
        "Descubre nuestros platos colombianos y consulta el menú, los precios y la disponibilidad actualizados para hacer tu pedido.",

      action:
        "Ver menú actual",

      items: [
        {
          title:
            "Bandeja Paisa",

          description:
            "Uno de los platos más reconocidos de la gastronomía colombiana.",
        },
        {
          title:
            "Lechona",

          description:
            "Una preparación colombiana tradicional con el estilo de Rincón.",
        },
        {
          title:
            "Empanadas",

          description:
            "Crujientes, colombianas y parte de nuestra historia cotidiana.",
        },
        {
          title:
            "Tamal Tolimense",

          description:
            "Tradición, familia y una parte importante de la cultura del Tolima.",
        },
        {
          title:
            "Dorada",

          description:
            "Pescado preparado con nuestra interpretación colombiana.",
        },
        {
          title:
            "Buñuelos",

          description:
            "Un clásico colombiano para café, desayuno y eventos.",
        },
      ],
    },

    stories: {
      eyebrow:
        "Fotos • Videos • Historias",

      title:
        "Rincón contado por nuestra comida, nuestra gente y nuestros eventos.",

      description:
        "Descubre nuestra historia, los platos que nos representan y las celebraciones que compartimos en Varsovia.",

      labels: [
        "Nuestra cocina",
        "Detrás de Rincón",
        "Eventos",
        "Historias de clientes",
      ],
    },

    community: {
      eyebrow:
        "Rincón Community",

      title:
        "No queremos solamente seguidores. Queremos comunidad.",

      description:
        "Comparte tu pasión por la gastronomía colombiana y acompáñanos en nuestros encuentros y actividades.",

      features: [
        "Perfiles de usuarios",
        "Publicaciones, fotos y videos",
        "Comentarios y reacciones",
        "Historias y guardados",
        "Seguir perfiles",
        "Eventos y cultura",
      ],

      action:
        "Explorar comunidad",
    },

    reviews: {
      eyebrow:
        "Opiniones y sugerencias",

      title:
        "Escuchamos a nuestros clientes y mostramos experiencias reales.",

      description:
        "Tu opinión nos ayuda a mejorar. Cuéntanos cómo fue tu visita o qué podemos hacer mejor.",

      action:
        "Déjanos tu opinión",

      suggestionAction:
        "Enviar sugerencia",
    },

    rewards: {
      eyebrow:
        "Rincón Rewards",

      title:
        "Cada relación con Rincón puede generar más valor.",

      description:
        "Estamos preparando un programa para nuestros clientes frecuentes. Los puntos y recompensas todavía no están activos; anunciaremos sus condiciones antes del lanzamiento.",

      purchaseTitle:
        "Recompensas por compras",

      purchaseDescription:
        "Cuando lancemos el programa, publicaremos sus beneficios. Por ahora, las compras no acumulan puntos.",

      referralTitle:
        "Refiere a un amigo",

      referralDescription:
        "Invita a tus amigos a disfrutar nuestra comida. El programa de referidos aún no está activo.",

      tokenTitle:
        "QR / token seguro",

      tokenDescription:
        "Las condiciones de cualquier promoción futura se anunciarán antes de habilitar códigos de recompensa.",

      action:
        "Consultar próximas promociones",
    },

    ai: {
      eyebrow:
        "Rincón AI",

      title:
        "Ayuda al cliente cuando realmente la necesita.",

      description:
        "Pregunta por nuestros platos, la ubicación o el catering. Para confirmar detalles de un pedido, comunícate directamente con el restaurante.",

      features: [
        "Menú y disponibilidad",
        "Pedidos",
        "Reservas",
        "Catering y eventos",
        "Cuenta y recompensas",
        "Escalamiento a una persona",
      ],

      action:
        "Preguntar a Rincón AI",
    },

    events: {
      eyebrow:
        "Celebraciones y empresas",

      title:
        "Cuéntanos qué estás planeando. Rincón construye la experiencia.",

      description:
        "Un punto central para solicitudes de catering, empresas, familias, cumpleaños, desayunos, sorpresas, decoración y eventos.",

      categories: [
        "Catering",
        "Empresas",
        "Familias",
        "Cumpleaños",
        "Desayunos",
        "Sorpresas",
        "Decoración",
        "Eventos",
      ],

      action:
        "Consultar evento",
    },

    locations: {
      eyebrow:
        "Varsovia",

      title:
        "Rincón cada vez más cerca de nuestra comunidad.",

      description:
        "Te esperamos en Czapelska 33, Varsovia. Pronto compartiremos más información sobre nuestra nueva sede.",

      open:
        "Abierto",

      comingSoon:
        "Próximamente",

      directions:
        "Cómo llegar",
    },

    social: {
      eyebrow:
        "Redes sociales",

      title:
        "Internet lleva a Rincón. Rincón lleva la relación más lejos.",

      description:
        "Síguenos para conocer nuevos platos, eventos, promociones y momentos especiales de Rincón Colombiano.",
    },

    legal: {
      eyebrow:
        "Confianza y cumplimiento",

      title:
        "Privacidad, cookies y reglas claras desde el inicio.",

      description:
        "Queremos que conozcas de forma clara nuestras condiciones de atención, pedidos y privacidad.",

      items: [
        "Política de privacidad",
        "Cookies y consentimientos",
        "Términos de uso",
        "Condiciones de venta",
        "Normas de comunidad",
        "Programa de recompensas",
        "Reclamaciones",
        "Accesibilidad",
      ],
    },

    faq: {
      eyebrow:
        "Preguntas frecuentes",

      title:
        "Lo que nuestros clientes necesitan saber.",

      items: [
        {
          question:
            "¿Puedo pedir online?",

          answer:
            "Sí. Pulsa «Pedir ahora», elige tus platos y consulta las opciones de recogida o entrega disponibles.",
        },
        {
          question:
            "¿Hacen catering?",

          answer:
            "Sí. Atendemos solicitudes privadas, familiares, empresariales y eventos especiales.",
        },
        {
          question:
            "¿Puedo reservar mesa?",

          answer:
            "Escríbenos para consultar la disponibilidad de mesas antes de tu visita.",
        },
        {
          question:
            "¿Cómo funcionarán las recompensas?",

          answer:
            "Estamos preparando el programa. Todavía no se acumulan puntos ni se entregan premios por referidos.",
        },
        {
          question:
            "¿Puedo trabajar con Rincón?",

          answer:
            "Sí. Tendremos un proceso específico para candidatos dentro de la sección Trabaja con nosotros.",
        },
      ],
    },

    contact: {
      eyebrow:
        "Contacto",

      title:
        "¿Tienes una idea, una pregunta o un evento? Hablemos.",

      description:
        "Estamos aquí para ayudarte con tus pedidos, propuestas de catering, colaboraciones y celebraciones.",

      contactAction:
        "Contáctanos",

      careersTitle:
        "Trabaja con nosotros",

      careersDescription:
        "Construimos gastronomía, marca y tecnología. Queremos personas que deseen crecer junto a Rincón Colombiano.",

      careersAction:
        "Ver oportunidades",
    },

    footer: {
      description:
        "Gastronomía, cultura, comunidad y tecnología colombiana desde Varsovia.",

      rights:
        "Todos los derechos reservados.",
    },
  },


  /* ========================================================
     ENGLISH
     ======================================================== */

  en: {
    languageLabel:
      "Choose language",

    navigationLabel:
      "Main navigation",

    nav: {
      menu:
        "Menu",

      services:
        "Services",

      stories:
        "Stories",

      community:
        "Community",

      rewards:
        "Rewards",

      locations:
        "Locations",

      order:
        "Order",
    },

    announcement:
      "Colombian food • Warsaw • Catering • Events • RC ORDERA",

    hero: {
      eyebrow:
        "Colombia in the heart of Warsaw",

      title:
        "Authentic Colombian flavours in Warsaw.",

      description:
        "Enjoy traditional Colombian dishes, order online or explore catering for birthdays, family celebrations and business events in Warsaw.",

      primaryAction:
        "Order online",

      secondaryAction:
        "Discover Rincón",

      highlights: [
        "Authentic Colombian food",
        "Catering and events",
        "Rincón community",
        "PL • ES • EN",
      ],
    },

    services: {
      eyebrow:
        "Everything in one place",

      title:
        "From a family meal to a major event.",

      description:
        "Bring Colombian flavour and tradition to your family celebrations, business meetings and special events in Warsaw. Tell us what you are planning.",

      items: [
        {
          eyebrow:
            "01",

          title:
            "Catering",

          description:
            "Colombian food for private, corporate and cultural events.",

          tone:
            "yellow",
        },
        {
          eyebrow:
            "02",

          title:
            "Birthdays",

          description:
            "Food, atmosphere and experiences for important celebrations.",

          tone:
            "red",
        },
        {
          eyebrow:
            "03",

          title:
            "Corporate",

          description:
            "Catering, meetings, team events and business experiences.",

          tone:
            "blue",
        },
        {
          eyebrow:
            "04",

          title:
            "Families",

          description:
            "Colombian experiences designed to be shared around the table.",

          tone:
            "yellow",
        },
        {
          eyebrow:
            "05",

          title:
            "Breakfasts",

          description:
            "Colombian breakfasts and special experiences to share or gift.",

          tone:
            "blue",
        },
        {
          eyebrow:
            "06",

          title:
            "Surprises",

          description:
            "Food gifts and memorable experiences for special people.",

          tone:
            "red",
        },
        {
          eyebrow:
            "07",

          title:
            "Table decoration",

          description:
            "Details that complement celebrations, breakfasts and events.",

          tone:
            "yellow",
        },
        {
          eyebrow:
            "08",

          title:
            "Bakery",

          description:
            "Colombian baked goods, snacks and Rincón products.",

          tone:
            "blue",
        },
      ],
    },

    ordering: {
      eyebrow:
        "RC ORDERA",

      title:
        "Order your favourite Colombian dishes online.",

      description:
        "Browse the menu, choose your dishes and check the available collection or delivery options.",

      action:
        "Start an order",

      secondaryAction:
        "How it works",

      steps: [
        {
          title:
            "Choose",

          description:
            "Explore the current menu and restaurant availability.",
        },
        {
          title:
            "Order",

          description:
            "Choose restaurant pickup or delivery when available.",
        },
        {
          title:
            "Return",

          description:
            "Come back for your Colombian favourites and discover what's new at Rincón Colombiano.",
        },
      ],
    },

    menu: {
      eyebrow:
        "Colombian food",

      title:
        "The flavors that built Rincón Colombiano.",

      description:
        "Discover our Colombian dishes, explore today's menu and check up-to-date prices and availability before ordering.",

      action:
        "View current menu",

      items: [
        {
          title:
            "Bandeja Paisa",

          description:
            "One of the most recognizable dishes in Colombian cuisine.",
        },
        {
          title:
            "Lechona",

          description:
            "A Colombian classic prepared in the Rincón style.",
        },
        {
          title:
            "Empanadas",

          description:
            "Crispy Colombian snacks that are part of our everyday story.",
        },
        {
          title:
            "Tamal Tolimense",

          description:
            "Tradition, family and a strong connection to Colombian culture.",
        },
        {
          title:
            "Dorada",

          description:
            "Fish served with our Colombian interpretation.",
        },
        {
          title:
            "Buñuelos",

          description:
            "A Colombian classic for coffee, breakfast and events.",
        },
      ],
    },

    stories: {
      eyebrow:
        "Photos • Video • Stories",

      title:
        "Rincón told through food, people and real experiences.",

      description:
        "Discover the story of Rincón Colombiano, the food we love and the celebrations that bring us together.",

      labels: [
        "Our kitchen",
        "Behind Rincón",
        "Events",
        "Customer stories",
      ],
    },

    community: {
      eyebrow:
        "Rincón Community",

      title:
        "Not just followers. A real community around the brand.",

      description:
        "Join our community of Colombian food lovers and follow our stories and events in Warsaw.",

      features: [
        "User profiles",
        "Posts, photos and video",
        "Comments and reactions",
        "Stories and saved content",
        "Following profiles",
        "Events and culture",
      ],

      action:
        "Explore community",
    },

    reviews: {
      eyebrow:
        "Reviews and suggestions",

      title:
        "We listen to customers and publish real experiences.",

      description:
        "Your feedback helps us improve. Tell us about your visit or share an idea with our team.",

      action:
        "Leave a review",

      suggestionAction:
        "Send a suggestion",
    },

    rewards: {
      eyebrow:
        "Rincón Rewards",

      title:
        "Every relationship with Rincón can create more value.",

      description:
        "We're preparing a loyalty programme for returning guests. Points and rewards are not active yet; we'll publish the rules before launch.",

      purchaseTitle:
        "Purchase rewards",

      purchaseDescription:
        "We'll announce any future loyalty benefits when the programme launches. Purchases do not earn points yet.",

      referralTitle:
        "Refer a friend",

      referralDescription:
        "Bring friends and family to enjoy Colombian food. The referral rewards programme is not active yet.",

      tokenTitle:
        "Secure QR / token",

      tokenDescription:
        "We'll publish clear terms before introducing any future promotional codes or rewards.",

      action:
        "Ask about upcoming offers",
    },

    ai: {
      eyebrow:
        "Rincón AI",

      title:
        "Customer support when it actually matters.",

      description:
        "The assistant will use real restaurant, menu, ordering, reservation and rewards data instead of inventing operational facts.",

      features: [
        "Menu and availability",
        "Orders",
        "Reservations",
        "Catering and events",
        "Account and rewards",
        "Human handoff",
      ],

      action:
        "Ask Rincón AI",
    },

    events: {
      eyebrow:
        "Celebrations and business",

      title:
        "Tell us what you are planning. Rincón builds the experience.",

      description:
        "One central point for catering, businesses, families, birthdays, breakfasts, surprises, decoration and events.",

      categories: [
        "Catering",
        "Corporate",
        "Families",
        "Birthdays",
        "Breakfasts",
        "Surprises",
        "Decoration",
        "Events",
      ],

      action:
        "Ask about an event",
    },

    locations: {
      eyebrow:
        "Warsaw",

      title:
        "Rincón closer to our community.",

      description:
        "Visit us at Czapelska 33 in Warsaw. We'll share updates about our next location when it's ready to open.",

      open:
        "Open",

      comingSoon:
        "Coming soon",

      directions:
        "Directions",
    },

    social: {
      eyebrow:
        "Social",

      title:
        "The internet leads to Rincón. Rincón takes the relationship further.",

      description:
        "Follow us for Colombian dishes, events, special offers and a little taste of home.",
    },

    legal: {
      eyebrow:
        "Trust and compliance",

      title:
        "Privacy, cookies and clear rules from the beginning.",

      description:
        "We want our ordering, contact and privacy information to be clear and easy to understand.",

      items: [
        "Privacy policy",
        "Cookies and consent",
        "Website terms",
        "Terms of sale",
        "Community rules",
        "Rewards program",
        "Complaints",
        "Accessibility",
      ],
    },

    faq: {
      eyebrow:
        "FAQ",

      title:
        "What customers need to know.",

      items: [
        {
          question:
            "Can I order online?",

          answer:
            "Yes. Select 'Order online', choose your dishes and check the available collection or delivery options.",
        },
        {
          question:
            "Do you provide catering?",

          answer:
            "Yes. We support private, family, corporate and special event inquiries.",
        },
        {
          question:
            "Can I reserve a table?",

          answer:
            "Contact us before visiting to ask about table availability.",
        },
        {
          question:
            "How will rewards work?",

          answer:
            "Rewards will be based on validated purchases and referrals with configurable program rules.",
        },
        {
          question:
            "Can I work with Rincón?",

          answer:
            "Yes. Candidates will have a dedicated recruitment process through the careers section.",
        },
      ],
    },

    contact: {
      eyebrow:
        "Contact",

      title:
        "Have an idea, question or event? Talk to us.",

      description:
        "Customer care, suggestions, collaboration, catering and business inquiries will follow clear processes rather than one generic inbox.",

      contactAction:
        "Contact us",

      careersTitle:
        "Work with us",

      careersDescription:
        "Love Colombian food and hospitality? Get in touch to learn about opportunities to work with our team.",

      careersAction:
        "Explore opportunities",
    },

    footer: {
      description:
        "Colombian food, culture, community and technology from Warsaw.",

      rights:
        "All rights reserved.",
    },
  },
};


/* ============================================================
   PROPS
   ============================================================ */

interface HomePageProps {
  readonly params:
    Promise<{
      readonly locale:
        string;
    }>;
}


/* ============================================================
   STATIC GENERATION
   ============================================================ */

/**
 * Next.js 16 expects generateStaticParams() to return
 * a mutable outer array.
 *
 * The locale property can remain readonly; only the array
 * container must satisfy the generated AppPageConfig contract.
 */
export function generateStaticParams():
  {
    readonly locale:
      AppLocale;
  }[] {
  return SUPPORTED_LOCALES.map(
    (
      locale,
    ) => ({
      locale,
    }),
  );
}


/* ============================================================
   METADATA
   ============================================================ */

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const {
    locale:
      rawLocale,
  } =
    await params;

  if (
    !isSupportedLocale(
      rawLocale,
    )
  ) {
    return {};
  }

  /*
   * Prioridad de identidad social:
   *
   * 1. open_graph publicado específicamente;
   * 2. logo_primary como fallback;
   * 3. metadata sin imagen si Supabase no está disponible.
   *
   * La ausencia temporal de Storage nunca debe impedir
   * renderizar ni indexar correctamente la página.
   */
  const [
    openGraphImage,
    primaryBrandLogo,
    seoDraft,
  ] =
    await Promise.all([
      getBrandOpenGraphImage(),
      getPrimaryBrandLogo(),
      getPublishedCmsTextContent("home_seo", rawLocale),
    ]);

  const socialImage =
    openGraphImage ??
    primaryBrandLogo;

  const seoCopy = seoDraft && validHomeCmsCopy("home_seo", seoDraft)
    ? seoDraft : null;

  return buildRouteMetadata(
    "home",
    rawLocale,
    {
      ...(seoCopy ? { title: seoCopy.title, description: seoCopy.body } : {}),
      ...(
        socialImage
          ? {
              images: [
                {
                  url:
                    socialImage
                      .publicUrl,

                  alt:
                    socialImage
                      .altText ||
                    "Rincón Colombiano",

                  type:
                    socialImage
                      .mimeType,
                },
              ],
            }
          : {}
      ),
    },
  );
}


/* ============================================================
   HELPERS
   ============================================================ */

function getWhatsappHref(
  value:
    string | undefined,
): string | null {
  if (!value) {
    return null;
  }

  if (
    value.startsWith(
      "http://",
    ) ||
    value.startsWith(
      "https://",
    )
  ) {
    return value;
  }

  const digits =
    value.replace(
      /\D/g,
      "",
    );

  return digits
    ? `https://wa.me/${digits}`
    : null;
}


function getPhoneHref(
  value:
    string | undefined,
): string | null {
  if (!value) {
    return null;
  }

  return `tel:${value.replace(
    /\s/g,
    "",
  )}`;
}


function getEmailHref(
  value:
    string | undefined,
): string | null {
  return value
    ? `mailto:${value}`
    : null;
}


/* ============================================================
   HOME
   ============================================================ */

export default async function HomePage({
  params,
}: HomePageProps) {
  const {
    locale:
      rawLocale,
  } =
    await params;

  if (
    !isSupportedLocale(
      rawLocale,
    )
  ) {
    notFound();
  }

  const locale:
    AppLocale =
    rawLocale;

  const baseCopy =
    homeContent[
      locale
    ];

  const [
    rcOrderaCatalog,
    primaryBrandLogo,
    heroBrandImage,
    publishedCopy,
    publishedCampaignImage,
  ] =
    await Promise.all([
      getRcOrderaPublicCatalog(
        "czapelska",
      ),

      getPrimaryBrandLogo(),

      getBrandHeroImage(),

      getPublishedCmsTextBatch(
        [...HOME_EDITABLE_KEYS, "home_campaign"],
        locale,
      ),

      getPublishedBrandAsset(
        "campaign_primary",
      ),
    ]);


  /* ============================================================
     CMS → HOME
     ============================================================ */

  /**
   * Solamente aplicamos el contenido CMS si además cumple
   * límites apropiados para un Hero.
   *
   * Que el CMS permita artículos largos no significa que
   * debamos permitir 50.000 caracteres dentro del encabezado.
   */
  const publishedHero = publishedCopy.get("home_hero");
  const publishedCampaign = publishedCopy.get("home_campaign");
  const validPublishedHero =
    publishedHero &&
    validHomeCmsCopy("home_hero", publishedHero) &&
    publishedHero.title.length <=
      160 &&
    publishedHero.body.length <=
      1500
      ? publishedHero
      : null;

  /**
   * El contenido escrito en código continúa siendo fallback.
   *
   * Si:
   *
   * - Supabase cae;
   * - falta configuración;
   * - el documento no existe;
   * - está corrupto;
   * - todavía no fue publicado;
   *
   * la página sigue funcionando normalmente.
   */
  const section = publishedCopy.get("home_services");
  const validSection = section && validHomeCmsCopy("home_services", section)
    ? section : null;

  const serviceKeys = HOME_EDITABLE_SECTIONS.slice(2, 10);
  const editorialServices = baseCopy.services.items.map((item, index) => {
    const key = serviceKeys[index]?.key;
    const published = key ? publishedCopy.get(key) : null;
    return published && key && validHomeCmsCopy(key, published)
      ? { ...item, title: published.title, description: published.body }
      : item;
  });

  const copy: HomeCopy = {
    ...baseCopy,
    hero: validPublishedHero
      ? {
          ...baseCopy.hero,
          title: validPublishedHero.title,
          description: validPublishedHero.body,
        }
      : baseCopy.hero,
    services: {
      ...baseCopy.services,
      title: validSection?.title ?? baseCopy.services.title,
      description: validSection?.body ?? baseCopy.services.description,
      items: editorialServices,
    },
  };

  /**
   * Una campaña únicamente aparece si un publicador autorizado
   * la publicó como promoción y los textos tienen longitud segura.
   * El resto de la web funciona sin datos CMS ni promociones.
   */
  const activeCampaign =
    publishedCampaign?.kind === "promotion" &&
    publishedCampaign.title.trim().length > 0 &&
    publishedCampaign.title.length <= 120 &&
    publishedCampaign.body.trim().length > 0 &&
    publishedCampaign.body.length <= 500
      ? publishedCampaign
      : null;

  const campaignLabels = {
    pl: { eyebrow: "Prosto z Kolumbii", action: "Zobacz menu" },
    es: { eyebrow: "Especial Rincón Colombiano", action: "Ver el menú" },
    en: { eyebrow: "Rincón Colombiano special", action: "Explore the menu" },
  } as const;

  const orderHref =
    buildRcOrderaOrderUrl(
      "czapelska",
    );

  const numberLocale =
    locale ===
    "pl"
      ? "pl-PL"
      : locale ===
          "es"
        ? "es-CO"
        : "en-GB";

  const liveMenuItems =
    rcOrderaCatalog
      ? rcOrderaCatalog
          .categories
          .flatMap(
            (
              category,
            ) =>
              category
                .products
                .filter(
                  (
                    product,
                  ) =>
                    product
                      .available,
                )
                .map(
                  (
                    product,
                  ) => {
                    const formattedPrice =
                      new Intl.NumberFormat(
                        numberLocale,
                        {
                          maximumFractionDigits:
                            2,
                        },
                      ).format(
                        product
                          .price,
                      );

                    const price =
                      rcOrderaCatalog
                        .settings
                        .currencyPosition ===
                      "before"
                        ? `${rcOrderaCatalog.settings.currencySymbol}${formattedPrice}`
                        : `${formattedPrice} ${rcOrderaCatalog.settings.currencySymbol}`;

                    return {
                      key:
                        product
                          .id ??
                        `${category.name}:${product.name}`,

                      title:
                        product
                          .name,

                      description:
                        product
                          .description,

                      category:
                        category
                          .name,

                      price,
                    };
                  },
                ),
          )
          .slice(
            0,
            6,
          )
      : [];

  const menuItems =
    liveMenuItems.length >
    0
      ? liveMenuItems
      : copy
          .menu
          .items
          .map(
            (
              item,
            ) => ({
              key:
                `fallback:${item.title}`,

              title:
                item.title,

              description:
                item.description,

              category:
                null,

              price:
                null,
            }),
          );

  const whatsappHref =
    getWhatsappHref(
      siteConfig
        .contact
        .whatsapp,
    );

  const phoneHref =
    getPhoneHref(
      siteConfig
        .contact
        .phone,
    );

  const emailHref =
    getEmailHref(
      siteConfig
        .contact
        .email,
    );

  const primaryContactHref =
    whatsappHref ??
    emailHref ??
    phoneHref ??
    "#contact";

  const serviceToneClass = {
    yellow:
      "border-t-[#f7c600]",

    blue:
      "border-t-[#123d73]",

    red:
      "border-t-[#c92d39]",
  } as const;


  return (
    <>
      {/* ====================================================
          ANNOUNCEMENT
          ==================================================== */}

      <div
        className="
          bg-[#12100e]
          px-4
          py-2.5
          text-center
          text-xs
          font-bold
          tracking-[0.14em]
          text-white
          uppercase
        "
      >
        {copy.announcement}
      </div>


      {/* ====================================================
          HEADER
          ==================================================== */}

      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-black/5
          bg-white/90
          backdrop-blur-xl
        "
      >
        <div
          className="
            site-container
            flex
            min-h-20
            items-center
            justify-between
            gap-5
          "
        >
          <a
            href="#top"
            className="
              flex
              shrink-0
              items-center
              gap-3
            "
            aria-label="Rincón Colombiano"
          >
            {
              primaryBrandLogo
                ? (
                    <span
                      className="
                        block
                        h-14
                        w-20
                        shrink-0
                        bg-contain
                        bg-center
                        bg-no-repeat
                        sm:w-24
                      "
                      style={{
                        backgroundImage:
                          `url("${primaryBrandLogo.publicUrl}")`,
                      }}
                      aria-hidden="true"
                    />
                  )
                : (
                    <span
                      className="
                        grid
                        size-11
                        shrink-0
                        place-items-center
                        rounded-full
                        bg-[#f7c600]
                        text-sm
                        font-black
                        text-[#12100e]
                        shadow-sm
                      "
                      aria-hidden="true"
                    >
                      RC
                    </span>
                  )
            }

            <span
              className="
                leading-none
              "
            >
              <span
                className="
                  block
                  font-serif
                  text-lg
                  font-bold
                  text-[#12100e]
                "
              >
                Rincón Colombiano
              </span>

              <span
                className="
                  mt-1
                  block
                  text-[0.62rem]
                  font-bold
                  tracking-[0.18em]
                  text-[#62594f]
                  uppercase
                "
              >
                {locale === "pl" ? "Warszawa" : locale === "es" ? "Varsovia" : "Warsaw"}
              </span>
            </span>
          </a>


          <nav
            aria-label={
              copy
                .navigationLabel
            }
            className="
              hidden
              items-center
              gap-5
              lg:flex
            "
          >
            <a
              href="#menu"
              className="text-sm font-semibold hover:text-[#123d73]"
            >
              {copy.nav.menu}
            </a>

            <a
              href="#services"
              className="text-sm font-semibold hover:text-[#123d73]"
            >
              {copy.nav.services}
            </a>

            <a
              href="#stories"
              className="text-sm font-semibold hover:text-[#123d73]"
            >
              {copy.nav.stories}
            </a>

            <a
              href="#community"
              className="text-sm font-semibold hover:text-[#123d73]"
            >
              {copy.nav.community}
            </a>

            <a
              href="#rewards"
              className="text-sm font-semibold hover:text-[#123d73]"
            >
              {copy.nav.rewards}
            </a>

            <a
              href="#locations"
              className="text-sm font-semibold hover:text-[#123d73]"
            >
              {copy.nav.locations}
            </a>
          </nav>


          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <div
              className="
                hidden
                items-center
                rounded-full
                border
                border-[#e7e1d7]
                bg-white
                p-1
                sm:flex
              "
              aria-label={
                copy
                  .languageLabel
              }
            >
              {siteConfig
                .locales
                .map(
                  (
                    language,
                  ) => (
                    <Link
                      key={
                        language.code
                      }
                      href={
                        buildRoutePath(
                          "home",
                          language.code,
                        )
                      }
                      aria-current={
                        language.code ===
                        locale
                          ? "page"
                          : undefined
                      }
                      className={`
                        rounded-full
                        px-2.5
                        py-1.5
                        text-xs
                        font-extrabold
                        transition
                        ${
                          language.code ===
                          locale
                            ? "bg-[#12100e] text-white"
                            : "text-[#62594f] hover:bg-[#f4f1eb]"
                        }
                      `}
                    >
                      {language.code
                        .toUpperCase()}
                    </Link>
                  ),
                )}
            </div>


            <a
              href={
                orderHref
              }
              target={
                siteConfig
                  .orderAppUrl
                  ? "_blank"
                  : undefined
              }
              rel={
                siteConfig
                  .orderAppUrl
                  ? "noopener noreferrer"
                  : undefined
              }
              className="
                hidden
                min-h-11
                items-center
                justify-center
                rounded-full
                bg-[#f7c600]
                px-5
                text-sm
                font-black
                text-[#12100e]
                transition
                hover:bg-[#dfb300]
                md:inline-flex
              "
            >
              {copy.nav.order}
            </a>


            <details
              className="
                relative
                lg:hidden
              "
            >
              <summary
                className="
                  grid
                  size-11
                  cursor-pointer
                  list-none
                  place-items-center
                  rounded-full
                  border
                  border-[#e7e1d7]
                  bg-white
                  font-black
                  [&::-webkit-details-marker]:hidden
                "
                aria-label={
                  copy
                    .navigationLabel
                }
              >
                ≡
              </summary>

              <div
                className="
                  absolute
                  right-0
                  top-14
                  w-[min(20rem,calc(100vw-2rem))]
                  rounded-3xl
                  border
                  border-[#e7e1d7]
                  bg-white
                  p-4
                  shadow-2xl
                "
              >
                <nav
                  className="
                    grid
                    gap-1
                  "
                >
                  {[
                    [
                      "#menu",
                      copy.nav.menu,
                    ],
                    [
                      "#services",
                      copy.nav.services,
                    ],
                    [
                      "#stories",
                      copy.nav.stories,
                    ],
                    [
                      "#community",
                      copy.nav.community,
                    ],
                    [
                      "#rewards",
                      copy.nav.rewards,
                    ],
                    [
                      "#locations",
                      copy.nav.locations,
                    ],
                  ].map(
                    (
                      [
                        href,
                        label,
                      ],
                    ) => (
                      <a
                        key={
                          href
                        }
                        href={
                          href
                        }
                        className="
                          rounded-xl
                          px-4
                          py-3
                          text-sm
                          font-bold
                          hover:bg-[#f4f1eb]
                        "
                      >
                        {label}
                      </a>
                    ),
                  )}
                </nav>

                <div
                  className="
                    mt-4
                    flex
                    gap-2
                    border-t
                    border-[#e7e1d7]
                    pt-4
                  "
                >
                  {SUPPORTED_LOCALES.map(
                    (
                      language,
                    ) => (
                      <Link
                        key={
                          language
                        }
                        href={
                          buildRoutePath(
                            "home",
                            language,
                          )
                        }
                        className="
                          flex-1
                          rounded-full
                          bg-[#f4f1eb]
                          px-3
                          py-2
                          text-center
                          text-xs
                          font-black
                        "
                      >
                        {language
                          .toUpperCase()}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>


      <main
        id="main-content"
        tabIndex={-1}
      >
        {/* ==================================================
            HERO
            ================================================== */}

        <section
          id="top"
          className="
            relative
            overflow-hidden
            bg-[#faf9f6]
            py-16
            sm:py-20
            lg:py-28
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-40
              -top-40
              size-[34rem]
              rounded-full
              bg-[#f7c600]/20
              blur-3xl
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-48
              -left-40
              size-[34rem]
              rounded-full
              bg-[#123d73]/10
              blur-3xl
            "
            aria-hidden="true"
          />

          <div
            className="
              site-container
              relative
              grid
              gap-12
              lg:grid-cols-[1.05fr_0.95fr]
              lg:items-center
            "
          >
            <div
              className="
                max-w-3xl
              "
            >
              <p
                className="
                  mb-5
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-[#c92d39]
                  uppercase
                "
              >
                {copy.hero.eyebrow}
              </p>

              <h1>
                {copy.hero.title}
              </h1>

              <p
                className="
                  mt-7
                  max-w-2xl
                  text-lg
                  leading-8
                  text-[#62594f]
                  sm:text-xl
                "
              >
                {copy.hero.description}
              </p>

              <div
                className="
                  mt-8
                  flex
                  flex-wrap
                  gap-3
                "
              >
                <a
                  href={
                    orderHref
                  }
                  target={
                    siteConfig
                      .orderAppUrl
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    siteConfig
                      .orderAppUrl
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="
                    inline-flex
                    min-h-13
                    items-center
                    justify-center
                    rounded-full
                    bg-[#f7c600]
                    px-7
                    text-sm
                    font-black
                    text-[#12100e]
                    shadow-lg
                    transition
                    hover:-translate-y-0.5
                    hover:bg-[#dfb300]
                  "
                >
                  {copy.hero.primaryAction}

                  <span
                    className="ml-2"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </a>

                <a
                  href="#services"
                  className="
                    inline-flex
                    min-h-13
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#d3cabd]
                    bg-white
                    px-7
                    text-sm
                    font-black
                    transition
                    hover:-translate-y-0.5
                    hover:bg-[#f4f1eb]
                  "
                >
                  {copy.hero.secondaryAction}
                </a>
              </div>

              <div
                className="
                  mt-10
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {copy
                  .hero
                  .highlights
                  .map(
                    (
                      item,
                    ) => (
                      <span
                        key={
                          item
                        }
                        className="
                          rounded-full
                          border
                          border-[#e7e1d7]
                          bg-white/80
                          px-4
                          py-2
                          text-xs
                          font-bold
                          text-[#494139]
                        "
                      >
                        {item}
                      </span>
                    ),
                  )}
              </div>
            </div>


            {
              heroBrandImage
                ? (
                    <div
                      role="img"
                      aria-label={
                        heroBrandImage.altText ||
                        "Rincón Colombiano — restaurante colombiano en Varsovia"
                      }
                      className="
                        relative
                        min-h-[31rem]
                        overflow-hidden
                        rounded-[2.5rem]
                        bg-[#12100e]
                        bg-cover
                        bg-center
                        bg-no-repeat
                        shadow-[0_30px_90px_rgba(18,16,14,0.24)]
                      "
                      style={{
                        backgroundImage:
                          `url("${heroBrandImage.publicUrl}")`,
                      }}
                    >
                      <div
                        className="
                          absolute
                          inset-x-0
                          top-0
                          h-2
                          bg-[linear-gradient(90deg,#f7c600_0_50%,#123d73_50%_75%,#c92d39_75%_100%)]
                        "
                        aria-hidden="true"
                      />

                      <div
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-black/25
                          via-transparent
                          to-transparent
                        "
                        aria-hidden="true"
                      />
                    </div>
                  )
                : (
                    <div
                      className="
                        relative
                        min-h-[31rem]
                        overflow-hidden
                        rounded-[2.5rem]
                        bg-[#12100e]
                        p-5
                        shadow-[0_30px_90px_rgba(18,16,14,0.24)]
                        sm:p-7
                      "
                    >
                      <div
                        className="
                          absolute
                          inset-x-0
                          top-0
                          h-2
                          bg-[linear-gradient(90deg,#f7c600_0_50%,#123d73_50%_75%,#c92d39_75%_100%)]
                        "
                      />

                      <div
                        className="
                          grid
                          h-full
                          min-h-[27rem]
                          grid-cols-2
                          gap-3
                        "
                      >
                        <div
                          className="
                            col-span-2
                            flex
                            min-h-44
                            flex-col
                            justify-end
                            rounded-[1.75rem]
                            bg-[#f7c600]
                            p-6
                          "
                        >
                          <span
                            className="
                              text-xs
                              font-black
                              tracking-[0.15em]
                              uppercase
                            "
                          >
                            Rincón
                          </span>

                          <strong
                            className="
                              mt-2
                              max-w-md
                              font-serif
                              text-3xl
                              leading-none
                            "
                          >
                            Gastronomía que cuenta una historia.
                          </strong>
                        </div>

                        <div
                          className="
                            flex
                            min-h-52
                            flex-col
                            justify-between
                            rounded-[1.75rem]
                            bg-[#123d73]
                            p-5
                            text-white
                          "
                        >
                          <span
                            className="
                              text-4xl
                              font-black
                              text-white/25
                            "
                            aria-hidden="true"
                          >
                            01
                          </span>

                          <strong
                            className="
                              text-xl
                              text-white
                            "
                          >
                            RC ORDERA
                          </strong>
                        </div>

                        <div
                          className="
                            flex
                            min-h-52
                            flex-col
                            justify-between
                            rounded-[1.75rem]
                            bg-[#c92d39]
                            p-5
                            text-white
                          "
                        >
                          <span
                            className="
                              text-4xl
                              font-black
                              text-white/25
                            "
                            aria-hidden="true"
                          >
                            02
                          </span>

                          <strong
                            className="
                              text-xl
                              text-white
                            "
                          >
                            {locale === "pl" ? "Społeczność" : locale === "es" ? "Comunidad" : "Community"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )
            }
          </div>
        </section>


        {/* ==================================================
            BRAND RAIL
            ================================================== */}

        <div
          className="
            overflow-hidden
            border-y
            border-black/5
            bg-white
          "
        >
          <div
            className="
              site-container
              flex
              flex-wrap
              justify-center
              gap-x-8
              gap-y-3
              py-5
              text-xs
              font-black
              tracking-[0.12em]
              text-[#62594f]
              uppercase
            "
          >
            {(locale === "pl"
              ? ["Restauracja", "Catering", "Wydarzenia", "Społeczność", "Promocje", "Rincón AI"]
              : locale === "es"
                ? ["Restaurante", "Catering", "Eventos", "Comunidad", "Promociones", "Rincón AI"]
                : ["Restaurant", "Catering", "Events", "Community", "Offers", "Rincón AI"]
            ).map((label, index) => (
              <span key={label} className="inline-flex items-center gap-6">
                {index > 0 ? <span aria-hidden="true">•</span> : null}
                {label}
              </span>
            ))}
          </div>
        </div>


        {activeCampaign ? (
          <section
            id="campaign"
            aria-labelledby="campaign-title"
            className="bg-[#f7c600] py-10 sm:py-14"
          >
            <div className="site-container">
              <div className="grid items-center gap-6 rounded-[2rem] bg-[#123d73] p-7 text-white shadow-xl sm:p-10 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.17em] text-[#f7c600]">
                    {campaignLabels[locale].eyebrow}
                  </p>
                  <h2 id="campaign-title" className="mt-3 font-serif text-2xl font-bold sm:text-4xl">
                    {activeCampaign.title}
                  </h2>
                  <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-white/85 sm:text-base">
                    {activeCampaign.body}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  {publishedCampaignImage ? (
                    <div
                      role="img"
                      aria-label={publishedCampaignImage.altText || activeCampaign.title}
                      className="h-40 w-full min-w-52 rounded-2xl bg-cover bg-center bg-no-repeat shadow-md sm:h-44 lg:w-64"
                      style={{ backgroundImage: `url("${publishedCampaignImage.publicUrl}")` }}
                    />
                  ) : null}
                  <Link
                    href={`/${locale}/menu`}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f7c600] px-7 text-sm font-black text-[#12100e] shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {campaignLabels[locale].action} →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <FoodGallery locale={locale} />

        {/* ==================================================
            SERVICES
            ================================================== */}

        <section
          id="services"
          className="
            scroll-mt-28
            bg-white
            py-12
            sm:py-20
          "
        >
          <div className="site-container">
            <div
              className="
                grid
                gap-8
                lg:grid-cols-[0.8fr_1.2fr]
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-black
                    tracking-[0.18em]
                    text-[#123d73]
                    uppercase
                  "
                >
                  {copy.services.eyebrow}
                </p>

                <h2
                  className="
                    mt-4
                    max-w-xl
                    text-3xl
                    leading-tight
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  {copy.services.title}
                </h2>
              </div>

              <p
                className="
                  max-w-2xl
                  self-end
                  text-base
                  leading-7
                  text-[#62594f]
                  sm:text-lg
                  sm:leading-8
                "
              >
                {copy.services.description}
              </p>
            </div>

            <div
              className="
                mt-8
                grid
                gap-4
                sm:mt-12
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              {copy
                .services
                .items
                .map(
                  (
                    service,
                  ) => (
                    <article
                      // CMS titles are editable and may accidentally repeat.
                      // Stable editorial positions prevent duplicate React keys.
                      key={
                        service.eyebrow
                      }
                      className={`
                        group
                        flex
                        min-h-56
                        flex-col
                        rounded-3xl
                        sm:min-h-64
                        border
                        border-[#e7e1d7]
                        border-t-4
                        bg-[#faf9f6]
                        p-6
                        transition
                        hover:-translate-y-1
                        hover:bg-white
                        hover:shadow-xl
                        ${
                          serviceToneClass[
                            service.tone
                          ]
                        }
                      `}
                    >
                      <span
                        className="
                          text-xs
                          font-black
                          tracking-[0.15em]
                          text-[#7f7569]
                        "
                      >
                        {service.eyebrow}
                      </span>

                      <h3
                        className="
                          mt-8
                          text-2xl
                        "
                      >
                        {service.title}
                      </h3>

                      <p
                        className="
                          mt-4
                          leading-7
                        "
                      >
                        {
                          service
                            .description
                        }
                      </p>
                      <a
                        href={service.eyebrow === "08" ? "#menu" : "#contact"}
                        aria-label={`${locale === "pl"
                          ? "Zapytaj o usługę"
                          : locale === "es"
                            ? "Consultar servicio"
                            : "Ask about this service"}: ${service.title}`}
                        className="
                          mt-auto
                          inline-flex
                          min-h-11
                          items-center
                          self-start
                          rounded-full
                          pt-5
                          text-sm
                          font-black
                          text-[#123d73]
                          underline
                          underline-offset-4
                          transition
                          hover:text-[#c92d39]
                          focus-visible:outline-2
                          focus-visible:outline-offset-2
                        "
                      >
                        {service.eyebrow === "08"
                          ? locale === "pl"
                            ? "Zobacz menu →"
                            : locale === "es"
                              ? "Ver menú →"
                              : "View menu →"
                          : locale === "pl"
                            ? "Zapytaj o szczegóły →"
                            : locale === "es"
                              ? "Consultar servicio →"
                              : "Enquire now →"}
                      </a>
                    </article>
                  ),
                )}
            </div>
          </div>
        </section>


        {/* ==================================================
            ORDER
            ================================================== */}

        <section
          id="order"
          className="
            scroll-mt-28
            bg-[#12100e]
            py-20
            text-white
            sm:py-28
          "
        >
          <div
            className="
              site-container
              grid
              gap-12
              lg:grid-cols-[1fr_1fr]
              lg:items-center
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-[#f7c600]
                  uppercase
                "
              >
                {copy.ordering.eyebrow}
              </p>

              <h2
                className="
                  mt-4
                  max-w-2xl
                  text-white
                "
              >
                {copy.ordering.title}
              </h2>

              <p
                className="
                  mt-6
                  max-w-xl
                  text-lg
                  leading-8
                  text-[#d3cabd]
                "
              >
                {
                  copy
                    .ordering
                    .description
                }
              </p>

              <div
                className="
                  mt-8
                  flex
                  flex-wrap
                  gap-3
                "
              >
                <a
                  href={
                    orderHref
                  }
                  target={
                    siteConfig
                      .orderAppUrl
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    siteConfig
                      .orderAppUrl
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    rounded-full
                    bg-[#f7c600]
                    px-6
                    text-sm
                    font-black
                    text-[#12100e]
                  "
                >
                  {
                    copy
                      .ordering
                      .action
                  }

                  <span
                    className="ml-2"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </a>

                <a
                  href="#menu"
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    rounded-full
                    border
                    border-white/20
                    px-6
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  {
                    copy
                      .ordering
                      .secondaryAction
                  }
                </a>
              </div>
            </div>

            <div
              className="
                grid
                gap-3
              "
            >
              {copy
                .ordering
                .steps
                .map(
                  (
                    step,
                    index,
                  ) => (
                    <article
                      key={
                        step.title
                      }
                      className="
                        grid
                        grid-cols-[3rem_1fr]
                        gap-4
                        rounded-3xl
                        border
                        border-white/10
                        bg-white/5
                        p-5
                      "
                    >
                      <span
                        className="
                          grid
                          size-12
                          place-items-center
                          rounded-full
                          bg-white/10
                          text-sm
                          font-black
                          text-[#f7c600]
                        "
                      >
                        {String(
                          index +
                            1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      <div>
                        <h3
                          className="
                            text-xl
                            text-white
                          "
                        >
                          {step.title}
                        </h3>

                        <p
                          className="
                            mt-2
                            leading-7
                            text-[#d3cabd]
                          "
                        >
                          {
                            step
                              .description
                          }
                        </p>
                      </div>
                    </article>
                  ),
                )}
            </div>
          </div>
        </section>


        {/* ==================================================
            MENU
            ================================================== */}

        <section
          id="menu"
          className="
            scroll-mt-28
            bg-[#faf9f6]
            py-20
            sm:py-28
          "
        >
          <div className="site-container">
            <div
              className="
                mx-auto
                max-w-3xl
                text-center
              "
            >
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-[#c92d39]
                  uppercase
                "
              >
                {copy.menu.eyebrow}
              </p>

              <h2 className="mt-4">
                {copy.menu.title}
              </h2>

              <p
                className="
                  mx-auto
                  mt-6
                  max-w-2xl
                  text-lg
                  leading-8
                "
              >
                {copy.menu.description}
              </p>
            </div>

            <div
              className="
                mt-12
                grid
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {menuItems.map(
                (
                  item,
                  index,
                ) => (
                  <article
                    key={
                      item.key
                    }
                    className="
                      relative
                      min-h-60
                      overflow-hidden
                      rounded-[2rem]
                      border
                      border-[#e7e1d7]
                      bg-white
                      p-7
                    "
                  >
                    <div
                      className={`
                        absolute
                        right-5
                        top-5
                        size-20
                        rounded-full
                        ${
                          index %
                            3 ===
                          0
                            ? "bg-[#f7c600]/20"
                            : index %
                                  3 ===
                                1
                              ? "bg-[#123d73]/10"
                              : "bg-[#c92d39]/10"
                        }
                      `}
                      aria-hidden="true"
                    />

                    <span
                      className="
                        relative
                        text-xs
                        font-black
                        text-[#a99e90]
                      "
                    >
                      {item.category ??
                        `RC/${String(
                          index +
                            1,
                        ).padStart(
                          2,
                          "0",
                        )}`}
                    </span>

                    <h3
                      className="
                        relative
                        mt-16
                        text-2xl
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                        relative
                        mt-3
                        leading-7
                      "
                    >
                      {
                        item
                          .description
                      }
                    </p>

                    {item.price ? (
                      <div
                        className="
                          relative
                          mt-6
                          inline-flex
                          rounded-full
                          bg-[#12100e]
                          px-4
                          py-2
                          text-sm
                          font-black
                          text-white
                        "
                      >
                        {item.price}
                      </div>
                    ) : null}
                  </article>
                ),
              )}
            </div>

            <div
              className="
                mt-10
                text-center
              "
            >
              <a
                href={
                  orderHref
                }
                target={
                  siteConfig
                    .orderAppUrl
                    ? "_blank"
                    : undefined
                }
                rel={
                  siteConfig
                    .orderAppUrl
                    ? "noopener noreferrer"
                    : undefined
                }
                className="
                  button-base
                  button-primary
                "
              >
                {copy.menu.action}
              </a>
            </div>
          </div>
        </section>


        {/* ==================================================
            STORIES / MEDIA
            ================================================== */}

        <section
          id="stories"
          className="
            scroll-mt-28
            bg-white
            py-20
            sm:py-28
          "
        >
          <div className="site-container">
            <div
              className="
                grid
                gap-8
                lg:grid-cols-[0.9fr_1.1fr]
                lg:items-end
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-black
                    tracking-[0.18em]
                    text-[#123d73]
                    uppercase
                  "
                >
                  {copy.stories.eyebrow}
                </p>

                <h2 className="mt-4">
                  {copy.stories.title}
                </h2>
              </div>

              <p
                className="
                  max-w-2xl
                  text-lg
                  leading-8
                "
              >
                {
                  copy
                    .stories
                    .description
                }
              </p>
            </div>

            <div
              className="
                mt-12
                grid
                auto-rows-[15rem]
                gap-4
                md:grid-cols-2
                lg:grid-cols-4
              "
            >
              {copy
                .stories
                .labels
                .map(
                  (
                    label,
                    index,
                  ) => (
                    <article
                      key={
                        label
                      }
                      className={`
                        relative
                        overflow-hidden
                        rounded-[2rem]
                        p-6
                        ${
                          index ===
                          0
                            ? "md:row-span-2 bg-[#f7c600]"
                            : index ===
                                1
                              ? "lg:col-span-2 bg-[#123d73] text-white"
                              : index ===
                                  2
                                ? "bg-[#c92d39] text-white"
                                : "bg-[#f4f1eb]"
                        }
                      `}
                    >
                      <span
                        className="
                          absolute
                          right-5
                          top-4
                          text-6xl
                          font-black
                          opacity-10
                        "
                        aria-hidden="true"
                      >
                        {String(
                          index +
                            1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      <div
                        className="
                          absolute
                          inset-x-6
                          bottom-6
                        "
                      >
                        <p
                          className={`
                            text-xs
                            font-black
                            tracking-[0.16em]
                            uppercase
                            ${
                              index ===
                                1 ||
                              index ===
                                2
                                ? "text-white/70"
                                : "text-[#62594f]"
                            }
                          `}
                        >
                          {locale === "pl" ? "Nasza historia" : locale === "es" ? "Nuestra historia" : "Our story"}
                        </p>

                        <h3
                          className={`
                            mt-2
                            text-2xl
                            ${
                              index ===
                                1 ||
                              index ===
                                2
                                ? "text-white"
                                : ""
                            }
                          `}
                        >
                          {label}
                        </h3>
                      </div>
                    </article>
                  ),
                )}
            </div>
          </div>
        </section>


        {/* ==================================================
            COMMUNITY + REVIEWS
            ================================================== */}

        <section
          id="community"
          className="
            scroll-mt-28
            bg-[#f4f1eb]
            py-20
            sm:py-28
          "
        >
          <div
            className="
              site-container
              grid
              gap-6
              xl:grid-cols-[1.15fr_0.85fr]
            "
          >
            <article
              className="
                rounded-[2.5rem]
                bg-[#123d73]
                p-7
                text-white
                sm:p-10
              "
            >
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-[#f7c600]
                  uppercase
                "
              >
                {
                  copy
                    .community
                    .eyebrow
                }
              </p>

              <h2
                className="
                  mt-4
                  max-w-3xl
                  text-white
                "
              >
                {
                  copy
                    .community
                    .title
                }
              </h2>

              <p
                className="
                  mt-6
                  max-w-2xl
                  text-lg
                  leading-8
                  text-white/75
                "
              >
                {
                  copy
                    .community
                    .description
                }
              </p>

              <div
                className="
                  mt-8
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >
                {copy
                  .community
                  .features
                  .map(
                    (
                      feature,
                    ) => (
                      <div
                        key={
                          feature
                        }
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-white/5
                          px-4
                          py-4
                          text-sm
                          font-bold
                        "
                      >
                        <span
                          className="
                            mr-2
                            text-[#f7c600]
                          "
                          aria-hidden="true"
                        >
                          +
                        </span>

                        {feature}
                      </div>
                    ),
                  )}
              </div>

              <a
                href="#stories"
                className="
                  mt-8
                  inline-flex
                  rounded-full
                  bg-white
                  px-6
                  py-3
                  text-sm
                  font-black
                  text-[#123d73]
                "
              >
                {
                  copy
                    .community
                    .action
                }
              </a>
            </article>


            <article
              id="reviews"
              className="
                rounded-[2.5rem]
                border
                border-[#e7e1d7]
                bg-white
                p-7
                sm:p-10
              "
            >
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-[#c92d39]
                  uppercase
                "
              >
                {
                  copy
                    .reviews
                    .eyebrow
                }
              </p>

              <h2
                className="
                  mt-4
                  text-4xl
                "
              >
                {
                  copy
                    .reviews
                    .title
                }
              </h2>

              <p
                className="
                  mt-6
                  leading-8
                "
              >
                {
                  copy
                    .reviews
                    .description
                }
              </p>

              <div
                className="
                  mt-8
                  grid
                  gap-3
                "
              >
                <a
                  href="#contact"
                  className="
                    rounded-2xl
                    bg-[#f7c600]
                    px-5
                    py-4
                    text-center
                    text-sm
                    font-black
                  "
                >
                  {
                    copy
                      .reviews
                      .action
                  }
                </a>

                <a
                  href="#contact"
                  className="
                    rounded-2xl
                    border
                    border-[#e7e1d7]
                    px-5
                    py-4
                    text-center
                    text-sm
                    font-black
                  "
                >
                  {
                    copy
                      .reviews
                      .suggestionAction
                  }
                </a>
              </div>
            </article>
          </div>
        </section>


        {/* ==================================================
            REWARDS
            ================================================== */}

        <section
          id="rewards"
          className="
            scroll-mt-28
            bg-white
            py-20
            sm:py-28
          "
        >
          <div
            className="
              site-container
              grid
              gap-12
              xl:grid-cols-[0.95fr_1.05fr]
              xl:items-center
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-[#c92d39]
                  uppercase
                "
              >
                {copy.rewards.eyebrow}
              </p>

              <h2
                className="
                  mt-4
                  max-w-2xl
                "
              >
                {copy.rewards.title}
              </h2>

              <p
                className="
                  mt-6
                  max-w-2xl
                  text-lg
                  leading-8
                "
              >
                {
                  copy
                    .rewards
                    .description
                }
              </p>

              <a
                href="#contact"
                className="
                  button-base
                  button-secondary
                  mt-8
                "
              >
                {copy.rewards.action}
              </a>
            </div>

            <div
              className="
                grid
                gap-4
                md:grid-cols-3
              "
            >
              {[
                {
                  number:
                    "01",

                  title:
                    copy
                      .rewards
                      .purchaseTitle,

                  description:
                    copy
                      .rewards
                      .purchaseDescription,
                },
                {
                  number:
                    "02",

                  title:
                    copy
                      .rewards
                      .referralTitle,

                  description:
                    copy
                      .rewards
                      .referralDescription,
                },
                {
                  number:
                    "03",

                  title:
                    copy
                      .rewards
                      .tokenTitle,

                  description:
                    copy
                      .rewards
                      .tokenDescription,
                },
              ].map(
                (
                  item,
                ) => (
                  <article
                    key={
                      item.number
                    }
                    className="
                      min-h-72
                      rounded-[2rem]
                      bg-[#faf9f6]
                      p-6
                    "
                  >
                    <span
                      className="
                        text-4xl
                        font-black
                        text-[#f7c600]
                      "
                      aria-hidden="true"
                    >
                      {item.number}
                    </span>

                    <h3
                      className="
                        mt-8
                        text-2xl
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                        mt-4
                        leading-7
                      "
                    >
                      {
                        item
                          .description
                      }
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>


        {/* ==================================================
            AI
            ================================================== */}

        <section
          id="ai"
          className="
            bg-[#f7c600]
            py-20
            sm:py-28
          "
        >
          <div
            className="
              site-container
              grid
              gap-10
              lg:grid-cols-[1fr_0.85fr]
              lg:items-center
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  uppercase
                "
              >
                {copy.ai.eyebrow}
              </p>

              <h2
                className="
                  mt-4
                  max-w-3xl
                "
              >
                {copy.ai.title}
              </h2>

              <p
                className="
                  mt-6
                  max-w-2xl
                  text-lg
                  leading-8
                  text-[#494139]
                "
              >
                {copy.ai.description}
              </p>

              <a
                href="#contact"
                className="
                  mt-8
                  inline-flex
                  rounded-full
                  bg-[#12100e]
                  px-6
                  py-3
                  text-sm
                  font-black
                  text-white
                "
              >
                {copy.ai.action}
              </a>
            </div>

            <div
              className="
                rounded-[2rem]
                bg-[#12100e]
                p-6
                shadow-2xl
              "
            >
              <div
                className="
                  mb-5
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    size-2.5
                    rounded-full
                    bg-[#c92d39]
                  "
                />

                <span
                  className="
                    size-2.5
                    rounded-full
                    bg-[#f7c600]
                  "
                />

                <span
                  className="
                    size-2.5
                    rounded-full
                    bg-[#177245]
                  "
                />
              </div>

              <div
                className="
                  grid
                  gap-3
                "
              >
                {copy
                  .ai
                  .features
                  .map(
                    (
                      feature,
                    ) => (
                      <div
                        key={
                          feature
                        }
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-white/5
                          px-5
                          py-4
                          text-sm
                          font-bold
                          text-white
                        "
                      >
                        <span
                          className="
                            mr-3
                            text-[#f7c600]
                          "
                          aria-hidden="true"
                        >
                          →
                        </span>

                        {feature}
                      </div>
                    ),
                  )}
              </div>
            </div>
          </div>
        </section>


        {/* ==================================================
            EVENTS
            ================================================== */}

        <section
          id="events"
          className="
            bg-[#faf9f6]
            py-20
            sm:py-28
          "
        >
          <div
            className="
              site-container
              rounded-[2.5rem]
              bg-[#c92d39]
              p-7
              text-white
              sm:p-10
              lg:p-14
            "
          >
            <div
              className="
                grid
                gap-8
                lg:grid-cols-[1fr_0.8fr]
                lg:items-end
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-black
                    tracking-[0.18em]
                    text-white/70
                    uppercase
                  "
                >
                  {copy.events.eyebrow}
                </p>

                <h2
                  className="
                    mt-4
                    max-w-3xl
                    text-white
                  "
                >
                  {copy.events.title}
                </h2>

                <p
                  className="
                    mt-6
                    max-w-2xl
                    text-lg
                    leading-8
                    text-white/80
                  "
                >
                  {
                    copy
                      .events
                      .description
                  }
                </p>
              </div>

              <div
                className="
                  lg:text-right
                "
              >
                <a
                  href={
                    primaryContactHref
                  }
                  target={
                    primaryContactHref.startsWith(
                      "http",
                    )
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    primaryContactHref.startsWith(
                      "http",
                    )
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="
                    inline-flex
                    rounded-full
                    bg-white
                    px-6
                    py-3
                    text-sm
                    font-black
                    text-[#c92d39]
                  "
                >
                  {copy.events.action}
                </a>
              </div>
            </div>

            <div
              className="
                mt-10
                flex
                flex-wrap
                gap-2
              "
            >
              {copy
                .events
                .categories
                .map(
                  (
                    category,
                  ) => (
                    <span
                      key={
                        category
                      }
                      className="
                        rounded-full
                        border
                        border-white/20
                        bg-white/10
                        px-4
                        py-2
                        text-sm
                        font-bold
                      "
                    >
                      {category}
                    </span>
                  ),
                )}
            </div>
          </div>
        </section>


        {/* ==================================================
            LOCATIONS
            ================================================== */}

        <section
          id="locations"
          className="
            scroll-mt-28
            bg-white
            py-20
            sm:py-28
          "
        >
          <div className="site-container">
            <div
              className="
                max-w-3xl
              "
            >
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-[#123d73]
                  uppercase
                "
              >
                {
                  copy
                    .locations
                    .eyebrow
                }
              </p>

              <h2 className="mt-4">
                {
                  copy
                    .locations
                    .title
                }
              </h2>

              <p
                className="
                  mt-6
                  text-lg
                  leading-8
                "
              >
                {
                  copy
                    .locations
                    .description
                }
              </p>
            </div>

            <div
              className="
                mt-12
                grid
                gap-5
                lg:grid-cols-2
              "
            >
              <article
                className="
                  rounded-[2.5rem]
                  border
                  border-[#e7e1d7]
                  bg-[#faf9f6]
                  p-7
                  sm:p-9
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <span
                      className="
                        rounded-full
                        bg-[#eaf7f0]
                        px-3
                        py-1.5
                        text-xs
                        font-black
                        text-[#177245]
                      "
                    >
                      {
                        copy
                          .locations
                          .open
                      }
                    </span>

                    <h3 className="mt-6">
                      Czapelska 33
                    </h3>

                    <p className="mt-2">
                      Praga-Południe,
                      Warszawa
                    </p>
                  </div>

                  <span
                    className="
                      text-5xl
                      font-black
                      text-[#f7c600]
                    "
                    aria-hidden="true"
                  >
                    01
                  </span>
                </div>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Czapelska+33+Warszawa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-8
                    inline-flex
                    text-sm
                    font-black
                    text-[#123d73]
                  "
                >
                  {
                    copy
                      .locations
                      .directions
                  }

                  <span
                    className="ml-2"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </a>
              </article>


              <article
                className="
                  rounded-[2.5rem]
                  bg-[#12100e]
                  p-7
                  text-white
                  sm:p-9
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <span
                      className="
                        rounded-full
                        bg-[#fff4df]
                        px-3
                        py-1.5
                        text-xs
                        font-black
                        text-[#a45d00]
                      "
                    >
                      {
                        copy
                          .locations
                          .comingSoon
                      }
                    </span>

                    <h3
                      className="
                        mt-6
                        text-white
                      "
                    >
                      Brzeska 10
                    </h3>

                    <p
                      className="
                        mt-2
                        text-white/65
                      "
                    >
                      Praga-Północ,
                      Warszawa
                    </p>
                  </div>

                  <span
                    className="
                      text-5xl
                      font-black
                      text-white/10
                    "
                    aria-hidden="true"
                  >
                    02
                  </span>
                </div>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Brzeska+10+Warszawa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-8
                    inline-flex
                    text-sm
                    font-black
                    text-[#f7c600]
                  "
                >
                  {
                    copy
                      .locations
                      .directions
                  }

                  <span
                    className="ml-2"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </a>
              </article>
            </div>
          </div>
        </section>


        {/* ==================================================
            SOCIAL
            ================================================== */}

        <section
          id="social"
          className="
            border-y
            border-[#e7e1d7]
            bg-[#faf9f6]
            py-20
          "
        >
          <div
            className="
              site-container
              grid
              gap-8
              lg:grid-cols-[1fr_auto]
              lg:items-center
            "
          >
            <div
              className="
                max-w-3xl
              "
            >
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-[#c92d39]
                  uppercase
                "
              >
                {copy.social.eyebrow}
              </p>

              <h2 className="mt-4">
                {copy.social.title}
              </h2>

              <p
                className="
                  mt-5
                  text-lg
                  leading-8
                "
              >
                {
                  copy
                    .social
                    .description
                }
              </p>
            </div>

            <div
              className="
                flex
                flex-wrap
                gap-2
                lg:max-w-sm
                lg:justify-end
              "
            >
              <SocialLinks locale={locale} />
            </div>
          </div>
        </section>


        {/* ==================================================
            LEGAL
            ================================================== */}

        <section
          id="legal"
          className="
            bg-white
            py-20
            sm:py-28
          "
        >
          <div
            className="
              site-container
              grid
              gap-10
              lg:grid-cols-[0.8fr_1.2fr]
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-[#123d73]
                  uppercase
                "
              >
                {copy.legal.eyebrow}
              </p>

              <h2 className="mt-4">
                {copy.legal.title}
              </h2>

              <p
                className="
                  mt-6
                  text-lg
                  leading-8
                "
              >
                {
                  copy
                    .legal
                    .description
                }
              </p>
            </div>

            <div
              className="
                grid
                gap-3
                sm:grid-cols-2
              "
            >
              {copy
                .legal
                .items
                .map(
                  (
                    item,
                  ) => (
                    <div
                      key={
                        item
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-2xl
                        border
                        border-[#e7e1d7]
                        bg-[#faf9f6]
                        px-5
                        py-4
                      "
                    >
                      <span
                        className="
                          text-sm
                          font-bold
                        "
                      >
                        {item}
                      </span>

                      <span
                        className="
                          text-[#a99e90]
                        "
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                  ),
                )}
            </div>
          </div>
        </section>


        {/* ==================================================
            FAQ
            ================================================== */}

        <section
          className="
            bg-[#f4f1eb]
            py-20
            sm:py-28
          "
        >
          <div
            className="
              content-container
            "
          >
            <div
              className="
                mx-auto
                max-w-3xl
                text-center
              "
            >
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-[#c92d39]
                  uppercase
                "
              >
                {copy.faq.eyebrow}
              </p>

              <h2 className="mt-4">
                {copy.faq.title}
              </h2>
            </div>

            <div
              className="
                mx-auto
                mt-10
                grid
                max-w-4xl
                gap-3
              "
            >
              {copy
                .faq
                .items
                .map(
                  (
                    item,
                  ) => (
                    <details
                      key={
                        item.question
                      }
                      className="
                        group
                        rounded-2xl
                        border
                        border-[#e7e1d7]
                        bg-white
                        p-5
                      "
                    >
                      <summary
                        className="
                          flex
                          cursor-pointer
                          list-none
                          items-center
                          justify-between
                          gap-5
                          font-bold
                          [&::-webkit-details-marker]:hidden
                        "
                      >
                        {
                          item.question
                        }

                        <span
                          className="
                            text-xl
                            text-[#123d73]
                          "
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </summary>

                      <p
                        className="
                          mt-4
                          max-w-3xl
                          leading-7
                        "
                      >
                        {
                          item.answer
                        }
                      </p>
                    </details>
                  ),
                )}
            </div>
          </div>
        </section>


        {/* ==================================================
            CONTACT + CAREERS
            ================================================== */}

        <section
          id="contact"
          className="
            scroll-mt-28
            bg-white
            py-20
            sm:py-28
          "
        >
          <div
            className="
              site-container
              grid
              gap-5
              lg:grid-cols-2
            "
          >
            <article
              className="
                rounded-[2.5rem]
                bg-[#f7c600]
                p-7
                sm:p-10
              "
            >
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  uppercase
                "
              >
                {copy.contact.eyebrow}
              </p>

              <h2
                className="
                  mt-4
                  text-4xl
                "
              >
                {copy.contact.title}
              </h2>

              <p
                className="
                  mt-6
                  max-w-xl
                  leading-8
                  text-[#494139]
                "
              >
                {
                  copy
                    .contact
                    .description
                }
              </p>

              <div
                className="
                  mt-8
                  flex
                  flex-wrap
                  gap-3
                "
              >
                <a
                  href={
                    primaryContactHref
                  }
                  target={
                    primaryContactHref.startsWith(
                      "http",
                    )
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    primaryContactHref.startsWith(
                      "http",
                    )
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="
                    rounded-full
                    bg-[#12100e]
                    px-6
                    py-3
                    text-sm
                    font-black
                    text-white
                  "
                >
                  {
                    copy
                      .contact
                      .contactAction
                  }
                </a>

                {emailHref ? (
                  <a
                    href={
                      emailHref
                    }
                    className="
                      rounded-full
                      border
                      border-black/20
                      px-6
                      py-3
                      text-sm
                      font-black
                    "
                  >
                    {locale === "pl" ? "E-mail" : locale === "es" ? "Correo electrónico" : "Email"}
                  </a>
                ) : null}
              </div>
            </article>


            <article
              className="
                rounded-[2.5rem]
                bg-[#123d73]
                p-7
                text-white
                sm:p-10
              "
            >
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-[#f7c600]
                  uppercase
                "
              >
                {locale === "pl" ? "Praca" : locale === "es" ? "Trabaja con nosotros" : "Careers"}
              </p>

              <h2
                className="
                  mt-4
                  text-4xl
                  text-white
                "
              >
                {
                  copy
                    .contact
                    .careersTitle
                }
              </h2>

              <p
                className="
                  mt-6
                  max-w-xl
                  leading-8
                  text-white/75
                "
              >
                {
                  copy
                    .contact
                    .careersDescription
                }
              </p>

              <a
                href={
                  emailHref ??
                  "#contact"
                }
                className="
                  mt-8
                  inline-flex
                  rounded-full
                  bg-white
                  px-6
                  py-3
                  text-sm
                  font-black
                  text-[#123d73]
                "
              >
                {
                  copy
                    .contact
                    .careersAction
                }
              </a>
            </article>
          </div>
        </section>
      </main>


      {/* ====================================================
          FOOTER
          ==================================================== */}

      <footer
        className="
          bg-[#12100e]
          text-white
        "
      >
        <div
          className="
            h-2
            bg-[linear-gradient(90deg,#f7c600_0_50%,#123d73_50%_75%,#c92d39_75%_100%)]
          "
        />

        <div
          className="
            site-container
            grid
            gap-10
            py-14
            lg:grid-cols-[1.2fr_0.8fr]
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              {
                primaryBrandLogo
                  ? (
                      <span
                        className="
                          block
                          h-16
                          w-28
                          shrink-0
                          bg-contain
                          bg-left
                          bg-no-repeat
                        "
                        style={{
                          backgroundImage:
                            `url("${primaryBrandLogo.publicUrl}")`,
                        }}
                        aria-hidden="true"
                      />
                    )
                  : (
                      <span
                        className="
                          grid
                          size-12
                          shrink-0
                          place-items-center
                          rounded-full
                          bg-[#f7c600]
                          text-sm
                          font-black
                          text-[#12100e]
                        "
                        aria-hidden="true"
                      >
                        RC
                      </span>
                    )
              }

              <strong
                className="
                  font-serif
                  text-2xl
                  text-white
                "
              >
                Rincón Colombiano
              </strong>
            </div>

            <p
              className="
                mt-5
                max-w-xl
                leading-7
                text-white/60
              "
            >
              {copy.footer.description}
            </p>

            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-2
              "
            >
              <span
                className="
                  rounded-full
                  border
                  border-white/10
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-white/70
                "
              >
                Czapelska 33
              </span>

              <span
                className="
                  rounded-full
                  border
                  border-white/10
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-white/70
                "
              >
                Brzeska 10
              </span>
            </div>
          </div>


          <div
            className="
              grid
              grid-cols-2
              gap-8
            "
          >
            <nav
              className="
                grid
                content-start
                gap-3
                text-sm
              "
            >
              <strong
                className="
                  mb-2
                  text-white
                "
              >
                Rincón
              </strong>

              <a href="#menu">
                {copy.nav.menu}
              </a>

              <a href="#services">
                {copy.nav.services}
              </a>

              <a href="#community">
                {copy.nav.community}
              </a>

              <a href="#rewards">
                {copy.nav.rewards}
              </a>
            </nav>

            <nav
              className="
                grid
                content-start
                gap-3
                text-sm
              "
            >
              <strong
                className="
                  mb-2
                  text-white
                "
              >
                {locale === "pl" ? "Informacje" : locale === "es" ? "Información" : "Information"}
              </strong>

              <a href="#locations">
                {copy.nav.locations}
              </a>

              <a href="#legal">
                {locale === "pl" ? "Zasady" : locale === "es" ? "Información legal" : "Legal"}
              </a>

              <a href="#contact">
                {
                  copy
                    .contact
                    .contactAction
                }
              </a>

              <a href="#stories">
                {copy.nav.stories}
              </a>
            </nav>
          </div>
        </div>

        <div
          className="
            border-t
            border-white/10
          "
        >
          <div
            className="
              site-container
              flex
              flex-col
              gap-3
              py-5
              text-xs
              text-white/45
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <span>
              © 2026 Rincón Colombiano.
              {" "}
              {copy.footer.rights}
            </span>

            <span>
              Warszawa • Polska
            </span>
          </div>
        </div>
      </footer>

      <RinconAiWidget
        locale={locale}
        orderHref={orderHref}
        contactHref={primaryContactHref}
      />
    </>
  );
}
