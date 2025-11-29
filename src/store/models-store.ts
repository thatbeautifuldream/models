import { create } from "zustand";
import type { TModelsApiResponse } from "@/types/api";
import { fetchModelsData } from "@/lib/api";
import { CACHE_DURATION_MS } from "@/lib/constants";
import { db } from "@/lib/db";

type TModelsStore = {
  models: TModelsApiResponse | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  initialized: boolean;
  initializeModels: () => Promise<void>;
  refreshModels: () => Promise<void>;
};

const CACHE_KEY = "models-data";

async function getCachedData(): Promise<{
  data: TModelsApiResponse;
  timestamp: number;
} | null> {
  try {
    const cached = await db.cache.get(CACHE_KEY);
    if (!cached) return null;
    return { data: cached.data, timestamp: cached.timestamp };
  } catch (error) {
    console.error("Error reading from IndexedDB:", error);
    return null;
  }
}

async function setCachedData(
  data: TModelsApiResponse,
  timestamp: number
): Promise<void> {
  try {
    await db.cache.put({
      id: CACHE_KEY,
      data,
      timestamp,
    });
  } catch (error) {
    console.error("Error writing to IndexedDB:", error);
  }
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION_MS;
}

export const useModelsStore = create<TModelsStore>((set, get) => ({
  models: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  initialized: false,

  initializeModels: async () => {
    const state = get();

    if (state.initialized || state.isLoading) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const cached = await getCachedData();

      if (cached && isCacheValid(cached.timestamp)) {
        set({
          models: cached.data,
          lastFetched: cached.timestamp,
          isLoading: false,
          initialized: true,
        });
        return;
      }

      const freshData = await fetchModelsData();
      const timestamp = Date.now();

      await setCachedData(freshData, timestamp);

      set({
        models: freshData,
        lastFetched: timestamp,
        isLoading: false,
        initialized: true,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load models data";

      const cached = await getCachedData();
      if (cached) {
        set({
          models: cached.data,
          lastFetched: cached.timestamp,
          isLoading: false,
          initialized: true,
          error: `${errorMessage} (using cached data)`,
        });
      } else {
        set({
          isLoading: false,
          initialized: true,
          error: errorMessage,
        });
      }
    }
  },

  refreshModels: async () => {
    set({ isLoading: true, error: null });

    try {
      const freshData = await fetchModelsData();
      const timestamp = Date.now();

      await setCachedData(freshData, timestamp);

      set({
        models: freshData,
        lastFetched: timestamp,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh models data";
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },
}));
