import type { TModelsApiResponse } from "@/types/api";
import { API_URL } from "./constants";

export async function fetchModelsData(): Promise<TModelsApiResponse> {
  const response = await fetch(API_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models data: ${response.statusText}`);
  }

  return response.json();
}
