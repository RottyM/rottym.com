import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      // Default ignores of eslint-config-next:
      ".next/**",
      ".firebase/**",
      "scratch/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "public/pdf.worker.min.mjs",
    ],
  },
];

export default eslintConfig;
