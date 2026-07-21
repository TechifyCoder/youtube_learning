// import * as dotenv from "dotenv";
// dotenv.config({ path: ".env.local" });

// import { defineConfig } from "drizzle-kit";

// export default defineConfig({
//   schema: './lib/db/schema.ts',
//   out:    './lib/db/migrations',
//   dialect: 'postgresql',
//   dbCredentials: {
//     url: process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'] ?? '',
//   },
//   verbose: true,
//   strict: true,
// })


import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});