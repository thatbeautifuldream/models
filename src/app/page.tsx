import React, { Suspense } from "react";
import { ModelsClient } from "./page.client";

export default function Page() {
  return (
    <Suspense>
      <ModelsClient />
    </Suspense>
  );
}
