import { Suspense } from "react";
import { ModelsClient } from "./page.client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-sm text-muted-foreground">Loading models…</div>
        </div>
      }
    >
      <ModelsClient />
    </Suspense>
  );
}
