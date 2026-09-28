/**
 * ============================================================
 * RINCÓN COLOMBIANO WEB
 * ESLint Configuration
 * ============================================================
 *
 * Objetivos:
 * - Detectar errores antes de producción.
 * - Mantener un estándar uniforme de código.
 * - Proteger rendimiento y accesibilidad.
 * - Aplicar reglas oficiales de Next.js.
 * - Aplicar reglas TypeScript.
 * - Impedir prácticas inseguras o descuidadas.
 *
 * Este archivo forma parte de la barrera de calidad del
 * proyecto antes de aceptar código en producción.
 */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  /**
   * ----------------------------------------------------------
   * NEXT.JS
   * ----------------------------------------------------------
   *
   * Incluye las reglas recomendadas de Next.js y las reglas
   * relacionadas con Core Web Vitals.
   */
  ...nextVitals,

  /**
   * ----------------------------------------------------------
   * TYPESCRIPT
   * ----------------------------------------------------------
   */
  ...nextTypeScript,

  /**
   * ----------------------------------------------------------
   * REGLAS GENERALES DEL PROYECTO
   * ----------------------------------------------------------
   */
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],

    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },

    rules: {
      /**
       * ======================================================
       * CALIDAD DE CÓDIGO
       * ======================================================
       */

      "eqeqeq": ["error", "always"],

      "curly": ["error", "all"],

      "prefer-const": "error",

      "no-var": "error",

      "object-shorthand": ["error", "always"],

      "prefer-template": "error",

      "no-useless-concat": "error",

      "no-duplicate-imports": "error",

      /**
       * ======================================================
       * ERRORES Y DEBUGGING
       * ======================================================
       */

      "no-debugger": "error",

      /**
       * console.log no debe terminar repartido por producción.
       *
       * Permitimos warn/error porque posteriormente los
       * reemplazaremos gradualmente por nuestro sistema de
       * logging estructurado.
       */
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],

      /**
       * ======================================================
       * SEGURIDAD
       * ======================================================
       */

      "no-eval": "error",

      "no-implied-eval": "error",

      "no-new-func": "error",

      "no-script-url": "error",

      /**
       * alert(), confirm() y prompt() no deben formar parte
       * de la experiencia profesional del sitio.
       */
      "no-alert": "error",

      /**
       * ======================================================
       * CONTROL DE FLUJO
       * ======================================================
       */

      "no-else-return": [
        "error",
        {
          allowElseIf: false,
        },
      ],

      "no-lonely-if": "error",

      "no-unneeded-ternary": "error",

      /**
       * ======================================================
       * PROMESAS / ASYNC
       * ======================================================
       */

      "no-return-await": "error",

      /**
       * ======================================================
       * ESTILO ESTRUCTURAL
       * ======================================================
       */

      "dot-notation": "error",

      "no-multi-assign": "error",

      "no-sequences": "error",

      "no-with": "error"
    },
  },

  /**
   * ----------------------------------------------------------
   * ARCHIVOS DE CONFIGURACIÓN
   * ----------------------------------------------------------
   *
   * En scripts de configuración sí permitimos console,
   * porque puede ser necesario durante CI/CD.
   */
  {
    files: [
      "*.config.js",
      "*.config.mjs",
      "*.config.cjs",
      "*.config.ts",
      "scripts/**/*.{js,mjs,cjs,ts}",
    ],

    rules: {
      "no-console": "off",
    },
  },

  /**
   * ----------------------------------------------------------
   * ARCHIVOS IGNORADOS GLOBALMENTE
   * ----------------------------------------------------------
   */
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "node_modules/**",

    ".vercel/**",
    ".turbo/**",
    ".cache/**",

    "playwright-report/**",
    "test-results/**",
    "blob-report/**",

    "storybook-static/**",

    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
