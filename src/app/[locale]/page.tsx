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
} from "@/lib/cms/public-content";


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
        "Smak, kultura i społeczność. Wszystko w jednym Rincón.",

      description:
        "Rincón Colombiano to nie tylko restauracja. Tworzymy cyfrowy dom naszej marki: gastronomię, zamówienia, wydarzenia, catering, społeczność, nagrody, historie i inteligentną obsługę klienta.",

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
        "Strona Rincón Colombiano jest centralnym punktem kontaktu z marką. Każda usługa może być zarządzana później z prywatnego panelu administracyjnego bez zmiany kodu.",

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
        "Zamawianie bez oddawania relacji z klientem pośrednikom.",

      description:
        "Nasza strona prowadzi klienta bezpośrednio do własnego systemu zamówień Rincón Colombiano.",

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
            "Odbiór osobisty lub dostawa poprzez ekosystem RC ORDERA.",
        },
        {
          title:
            "Wracaj",

          description:
            "Konto, historia, społeczność i program nagród budują długą relację.",
        },
      ],
    },

    menu: {
      eyebrow:
        "Kuchnia kolumbijska",

      title:
        "Smaki, z których powstał Rincón Colombiano.",

      description:
        "Ceny i dostępność będą pobierane bezpośrednio z RC ORDERA, dzięki czemu strona nie będzie utrzymywać drugiej, niespójnej kopii menu.",

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
        "Ta przestrzeń będzie zasilana z prywatnego panelu: zdjęcia, filmy, historie, wydarzenia, produkty i materiały naszej społeczności.",

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
        "Budujemy własną przestrzeń społecznościową powiązaną z gastronomią, kulturą i doświadczeniem klienta.",

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
        "Nie publikujemy wymyślonych ocen. Zweryfikowane opinie klientów będą mogły być moderowane i publikowane w tej sekcji.",

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
        "Program lojalnościowy jest projektowany jako część jednego konta klienta i będzie połączony z realnymi zakupami w RC ORDERA.",

      purchaseTitle:
        "Nagrody za zakupy",

      purchaseDescription:
        "Kwalifikujące zakupy mogą dodawać punkty lub inne korzyści zgodnie z aktualnymi zasadami programu.",

      referralTitle:
        "Poleć znajomego",

      referralDescription:
        "Po pierwszym kwalifikującym zakupie zaproszonej osoby system może przyznać nagrodę osobie polecającej zgodnie z aktualnym progiem programu.",

      tokenTitle:
        "Bezpieczny QR / token",

      tokenDescription:
        "Kod jest walidowany przez backend, może zostać wykorzystany tylko zgodnie z zasadami programu i nie opiera się wyłącznie na obrazie QR.",

      action:
        "Zobacz nagrody",
    },

    ai: {
      eyebrow:
        "Rincón AI",

      title:
        "Pomoc klientowi wtedy, kiedy jej potrzebuje.",

      description:
        "Asystent będzie korzystać z rzeczywistych danych Rincón Colombiano zamiast wymyślać informacje operacyjne.",

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
        "Każdy lokal posiada własną stabilną tożsamość w systemie, dzięki czemu menu, godziny, zamówienia i SEO mogą działać niezależnie.",

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
        "Instagram, TikTok, Facebook, WhatsApp i kolejne kanały pozostają ważne, ale centrum relacji z klientem jest nasza własna strona.",
    },

    legal: {
      eyebrow:
        "Zaufanie i zgodność",

      title:
        "Prywatność, cookies i jasne zasady od początku.",

      description:
        "System prawny będzie wersjonowany według kraju, języka i rodzaju usługi, zamiast opierać się na jednym niezmiennym dokumencie.",

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
            "Tak. Strona została zaprojektowana tak, aby kierować klientów do własnego systemu RC ORDERA.",
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
            "Moduł rezerwacji jest częścią architektury i będzie połączony z kontem klienta i konkretnym lokalem.",
        },
        {
          question:
            "Jak działa program nagród?",

          answer:
            "Nagrody będą wynikały z rzeczywistych zakupów i zweryfikowanych poleceń, a zasady pozostaną konfigurowalne.",
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
        "Sabor, cultura y comunidad. Todo vive en Rincón.",

      description:
        "Rincón Colombiano es mucho más que un restaurante. Estamos construyendo el hogar digital de nuestra marca: gastronomía, pedidos, eventos, catering, comunidad, recompensas, historias y atención inteligente.",

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
        "La web de Rincón Colombiano será el centro de contacto con la marca. Cada servicio podrá administrarse desde una pantalla privada sin tener que cambiar código.",

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
        "Pedidos propios sin regalar la relación con nuestros clientes.",

      description:
        "Nuestra web lleva al cliente directamente al ecosistema de pedidos de Rincón Colombiano.",

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
            "Recogida o entrega mediante el ecosistema RC ORDERA.",
        },
        {
          title:
            "Vuelve",

          description:
            "Cuenta, historial, comunidad y recompensas construyen una relación duradera.",
        },
      ],
    },

    menu: {
      eyebrow:
        "Cocina colombiana",

      title:
        "Los sabores que construyeron Rincón Colombiano.",

      description:
        "Los precios y la disponibilidad se obtendrán directamente de RC ORDERA para evitar tener dos menús diferentes y desactualizados.",

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
        "Este espacio se alimentará desde el panel privado con fotos, videos, historias, eventos, productos y contenido de comunidad.",

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
        "Construimos una red propia conectada con gastronomía, cultura y experiencia del cliente.",

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
        "No vamos a inventar testimonios ni puntuaciones. Las opiniones reales podrán revisarse, moderarse y publicarse desde el sistema.",

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
        "El sistema de fidelización formará parte de una sola cuenta de cliente y se conectará con las compras reales de RC ORDERA.",

      purchaseTitle:
        "Recompensas por compras",

      purchaseDescription:
        "Las compras que cumplan las reglas del programa podrán generar puntos, beneficios o recompensas.",

      referralTitle:
        "Refiere a un amigo",

      referralDescription:
        "Cuando la persona referida complete su primera compra válida, el sistema podrá otorgar una recompensa al referente según el mínimo configurado del programa.",

      tokenTitle:
        "QR / token seguro",

      tokenDescription:
        "El código se valida en backend, tiene controles contra reutilización y no depende solamente de mostrar una imagen QR.",

      action:
        "Ver recompensas",
    },

    ai: {
      eyebrow:
        "Rincón AI",

      title:
        "Ayuda al cliente cuando realmente la necesita.",

      description:
        "El asistente utilizará datos reales del restaurante, el menú, pedidos, reservas y recompensas, sin inventar información operativa.",

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
        "Cada restaurante tendrá identidad estable dentro del sistema para administrar menú, horarios, pedidos y SEO de forma independiente.",

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
        "Instagram, TikTok, Facebook y WhatsApp siguen siendo importantes, pero la relación principal con el cliente vive en nuestra propia plataforma.",
    },

    legal: {
      eyebrow:
        "Confianza y cumplimiento",

      title:
        "Privacidad, cookies y reglas claras desde el inicio.",

      description:
        "Los documentos legales estarán versionados según país, idioma y servicio, en lugar de depender de un único documento estático.",

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
            "Sí. La plataforma está diseñada para llevar el pedido directamente al ecosistema RC ORDERA.",
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
            "La arquitectura incluye reservas vinculadas al usuario y al restaurante correspondiente.",
        },
        {
          question:
            "¿Cómo funcionarán las recompensas?",

          answer:
            "Se basarán en compras y referidos realmente validados, con reglas configurables desde el sistema.",
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
        "Contacto, sugerencias, colaboraciones, catering y atención al cliente tendrán procesos claros en lugar de terminar todos en un solo formulario.",

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
        "Flavor, culture and community. Everything lives in Rincón.",

      description:
        "Rincón Colombiano is more than a restaurant. We are building the digital home of our brand: food, ordering, events, catering, community, rewards, stories and intelligent customer care.",

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
        "The Rincón Colombiano website is becoming the central relationship point for the brand. Services will be manageable from a private admin interface without changing code.",

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
        "Own the ordering experience and the customer relationship.",

      description:
        "Our website connects customers directly with the Rincón Colombiano ordering ecosystem.",

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
            "Pickup or delivery through the RC ORDERA ecosystem.",
        },
        {
          title:
            "Return",

          description:
            "Account history, community and rewards create a lasting relationship.",
        },
      ],
    },

    menu: {
      eyebrow:
        "Colombian food",

      title:
        "The flavors that built Rincón Colombiano.",

      description:
        "Prices and availability will come directly from RC ORDERA so the website never maintains an outdated duplicate menu.",

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
        "This area will be powered from the private admin panel with photos, video, stories, events, products and community content.",

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
        "We are creating our own social space connected to food, culture and customer experience.",

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
        "We will not invent testimonials or ratings. Genuine reviews can be reviewed, moderated and published through the platform.",

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
        "The loyalty system will live inside one customer account and connect directly to validated RC ORDERA purchases.",

      purchaseTitle:
        "Purchase rewards",

      purchaseDescription:
        "Eligible purchases can generate points, benefits or rewards according to the current program rules.",

      referralTitle:
        "Refer a friend",

      referralDescription:
        "After a referred customer completes a qualifying first purchase, the system can grant the referrer a reward according to the configured program threshold.",

      tokenTitle:
        "Secure QR / token",

      tokenDescription:
        "Tokens are validated by the backend, protected against improper reuse and never rely only on displaying a QR image.",

      action:
        "Explore rewards",
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
        "Each location has a stable system identity so menu, opening hours, ordering and SEO can evolve independently.",

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
        "Instagram, TikTok, Facebook and WhatsApp remain important, while our website becomes the primary home of the customer relationship.",
    },

    legal: {
      eyebrow:
        "Trust and compliance",

      title:
        "Privacy, cookies and clear rules from the beginning.",

      description:
        "Legal content will be versioned by jurisdiction, language and service instead of relying on one static global document.",

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
            "Yes. The platform is designed to connect orders directly with the RC ORDERA ecosystem.",
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
            "Reservation architecture is included and will connect each booking to the customer and location.",
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
        "We are building food, brand and technology. We want people who want to grow with Rincón Colombiano.",

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
  ] =
    await Promise.all([
      getBrandOpenGraphImage(),
      getPrimaryBrandLogo(),
    ]);

  const socialImage =
    openGraphImage ??
    primaryBrandLogo;

  return buildRouteMetadata(
    "home",
    rawLocale,
    {
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
    publishedHero,
  ] =
    await Promise.all([
      getRcOrderaPublicCatalog(
        "czapelska",
      ),

      getPrimaryBrandLogo(),

      getBrandHeroImage(),

      getPublishedCmsTextContent(
        "home_hero",
        locale,
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
  const validPublishedHero =
    publishedHero &&
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
  const copy:
    HomeCopy =
    validPublishedHero
      ? {
          ...baseCopy,

          hero: {
            ...baseCopy.hero,

            title:
              validPublishedHero.title,

            description:
              validPublishedHero.body,
          },
        }
      : baseCopy;

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
                Warszawa
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
                            Community
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
            <span>Restaurant</span>
            <span>•</span>
            <span>Catering</span>
            <span>•</span>
            <span>Events</span>
            <span>•</span>
            <span>Community</span>
            <span>•</span>
            <span>Rewards</span>
            <span>•</span>
            <span>Rincón AI</span>
          </div>
        </div>


        {/* ==================================================
            SERVICES
            ================================================== */}

        <section
          id="services"
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
                  "
                >
                  {copy.services.title}
                </h2>
              </div>

              <p
                className="
                  max-w-2xl
                  self-end
                  text-lg
                  leading-8
                  text-[#62594f]
                "
              >
                {copy.services.description}
              </p>
            </div>

            <div
              className="
                mt-12
                grid
                gap-4
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
                      key={
                        service.title
                      }
                      className={`
                        group
                        min-h-64
                        rounded-3xl
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
                          Story
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
              <SocialLinks />
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
                    Email
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
                Careers
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
                Info
              </strong>

              <a href="#locations">
                {copy.nav.locations}
              </a>

              <a href="#legal">
                Legal
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
