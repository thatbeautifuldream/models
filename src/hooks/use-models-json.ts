import { useQuery } from "@tanstack/react-query";
import type { TModelsJsonResponse } from "@/types/models-json";

async function fetchModelsJson(): Promise<TModelsJsonResponse> {
  const response = await fetch("/models.json");

  if (!response.ok) {
    throw new Error(`Failed to fetch models.json: ${response.statusText}`);
  }

  const parsed = (await response.json()) as TModelsJsonResponse;

  if (!parsed || !Array.isArray(parsed.data)) {
    throw new Error("Invalid models.json shape. Expected { data: [] }.");
  }

  return parsed;
}

export function useModelsJson() {
  return useQuery({
    queryKey: ["models-json"],
    queryFn: fetchModelsJson,
    staleTime: 1000 * 60 * 10,
  });
}
