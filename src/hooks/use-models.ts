import { useQuery } from "@tanstack/react-query";
import type { TModelsApiResponse } from "@/types/api";

async function fetchModels(): Promise<TModelsApiResponse> {
  const response = await fetch("/api/models");

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }

  return response.json();
}

export function useModels() {
  return useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
  });
}
