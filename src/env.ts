import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    GA_ID: z.string(),
  },
  client: {
    NEXT_PUBLIC_CLARITY: z.string().optional(),
  },
  runtimeEnv: {
    GA_ID: process.env.GA_ID,
    NEXT_PUBLIC_CLARITY: process.env.NEXT_PUBLIC_CLARITY,
  },
});
