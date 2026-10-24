import { loadEnvConfig } from "@next/env";
import { defineConfig, env } from "prisma/config";

// Load the same .env files as Next.js, including .env.local, without printing values.
loadEnvConfig(process.cwd(), process.env.NODE_ENV === "development");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
