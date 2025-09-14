"use client";

import { env } from "@/env";
import clarity from "@microsoft/clarity";
import { useEffect } from "react";

export function ClarityProvider() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      clarity.init(env.NEXT_PUBLIC_CLARITY!);
    }
  }, []);

  return null;
}
