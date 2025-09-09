"use client"

import Link from "next/link";
import { ModelCard } from "@/components/model-card";
import { models } from "@/data/models";

export default function ModelsPage() {
  const modelEntries = Object.entries(models).flatMap(
    ([providerKey, provider]) =>
      Object.entries(provider.models).map(([modelKey, model]) => ({
        model,
        provider,
        providerKey,
        modelKey,
        uniqueKey: `${providerKey}/${modelKey}`,
      }))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance mb-2">
          AI Language Models
        </h1>
        <p className="text-muted-foreground text-pretty">
          Comprehensive database of AI model specifications, pricing, and
          features. Data gathered from{" "}
          <Link
            href="https://models.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            models.dev
          </Link>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Showing {modelEntries.length} models
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
        {modelEntries.map((entry) => (
          <ModelCard key={entry.uniqueKey} {...entry} />
        ))}
      </div>
    </div>
  );
}
