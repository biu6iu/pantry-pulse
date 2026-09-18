import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Prevent frontend from accessing anything below the API layer
  {
    files: ["src/app/**/*.{ts,tsx}"],
    ignores: ["src/app/api/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/container", "@/lib/services/*"],
              message:
                "Frontend code must not call the service layer directly. Use @/lib/api/server (Server Components) or @/lib/api/client (Client Components) instead.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
