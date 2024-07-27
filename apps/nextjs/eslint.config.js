import baseConfig, { restrictEnvAccess } from "@dict/eslint-config/base";
import nextjsConfig from "@dict/eslint-config/nextjs";
import reactConfig from "@dict/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
