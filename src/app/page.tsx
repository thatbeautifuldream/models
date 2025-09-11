import React, { Suspense } from "react";
import { ModelsClient } from "./page.client";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading models…</div>}>
      <ModelsClient />
    </Suspense>
  );
}
