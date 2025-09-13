import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    GA_ID: z.string(),
  },
  client: {},
  runtimeEnv: {
    GA_ID: process.env.GA_ID,
  },
});
