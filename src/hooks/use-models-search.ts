"use client";

import { useDeferredValue, useMemo, useTransition } from "react";
import { useQueryState } from "nuqs";
import Fuse from "fuse.js";
import type {
  TModel as TApiModel,
  TProvider as TApiProvider,
} from "@/types/api";
import { useModels } from "./use-models";

export type TModel = TApiModel;
export type TProvider = TApiProvider;

export type TModelEntry = {
  model: TModel;
  provider: TProvider;
  providerKey: string;
  modelKey: string;
  uniqueKey: string;
};

export type TCapability =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "attachment"
  | "reasoning"
  | "tools"
  | "temperature";

const KNOWN_CAPABILITIES: readonly TCapability[] = [
  "text",
  "image",
  "audio",
  "video",
  "attachment",
  "reasoning",
  "tools",
  "temperature",
] as const;

const isValidCapability = (value: unknown): value is TCapability => {
  return (
    typeof value === "string" &&
    KNOWN_CAPABILITIES.includes(value as TCapability)
  );
};

const getModelCapabilities = (model: TModel): TCapability[] => {
  const capabilitiesSet = new Set<TCapability>();

  if (model.modalities?.input && Array.isArray(model.modalities.input)) {
    for (const modality of model.modalities.input) {
      if (isValidCapability(modality)) {
        capabilitiesSet.add(modality);
      } else if (process.env.NODE_ENV === "development") {
        console.warn(`Unknown input modality: ${modality}`);
      }
    }
  }

  if (model.modalities?.output && Array.isArray(model.modalities.output)) {
    for (const modality of model.modalities.output) {
      if (isValidCapability(modality)) {
        capabilitiesSet.add(modality);
      } else if (process.env.NODE_ENV === "development") {
        console.warn(`Unknown output modality: ${modality}`);
      }
    }
  }

  if (model.attachment) capabilitiesSet.add("attachment");
  if (model.reasoning) capabilitiesSet.add("reasoning");
  if (model.tool_call) capabilitiesSet.add("tools");
  if (model.temperature) capabilitiesSet.add("temperature");

  return Array.from(capabilitiesSet);
};

const modelCapabilitiesCache = new WeakMap<TModel, TCapability[]>();

const getCachedModelCapabilities = (model: TModel): TCapability[] => {
  if (modelCapabilitiesCache.has(model)) {
    return modelCapabilitiesCache.get(model)!;
  }
  const capabilities = getModelCapabilities(model);
  modelCapabilitiesCache.set(model, capabilities);
  return capabilities;
};

const filterByCapabilities = (
  models: TModelEntry[],
  selectedCapabilities: Set<TCapability>
): TModelEntry[] => {
  if (selectedCapabilities.size === 0) return models;

  return models.filter((entry) => {
    const modelCapabilities = getCachedModelCapabilities(entry.model);
    return Array.from(selectedCapabilities).every((cap) =>
      modelCapabilities.includes(cap)
    );
  });
};

export function useModelsSearch() {
  const [isPending, startTransition] = useTransition();
  const { data: models, isLoading, error } = useModels();

  const allModels: TModelEntry[] = useMemo(() => {
    if (!models) return [];

    return Object.entries(models).flatMap(([providerKey, provider]) =>
      Object.entries(provider.models).map(([modelKey, model]) => ({
        model,
        provider,
        providerKey,
        modelKey,
        uniqueKey: `${providerKey}/${modelKey}`,
      }))
    );
  }, [models]);

  const fuse = useMemo(() => {
    return new Fuse(allModels, {
      keys: [
        { name: "model.name", weight: 2 },
        { name: "model.id", weight: 1.5 },
        { name: "provider.name", weight: 1 },
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: false,
    });
  }, [allModels]);

  const [searchTerm, setSearchTermInternal] = useQueryState("search", {
    defaultValue: "",
    clearOnDefault: true,
  });

  const [capabilitiesParam, setCapabilitiesParamInternal] = useQueryState(
    "capabilities",
    {
      defaultValue: "",
      clearOnDefault: true,
    }
  );

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredCapabilitiesParam = useDeferredValue(capabilitiesParam);

  const selectedCapabilities = useMemo(() => {
    if (!deferredCapabilitiesParam) return new Set<TCapability>();

    const capabilitiesFromUrl = deferredCapabilitiesParam
      .split(",")
      .map((cap) => cap.trim())
      .filter((cap) => cap.length > 0)
      .filter(isValidCapability);

    return new Set(capabilitiesFromUrl);
  }, [deferredCapabilitiesParam]);

  const filteredModels = useMemo(() => {
    let filtered = allModels;

    if (deferredSearchTerm.trim()) {
      const searchResults = fuse.search(deferredSearchTerm.trim());
      filtered = searchResults.map((result) => result.item);
    }

    if (selectedCapabilities.size > 0) {
      filtered = filterByCapabilities(filtered, selectedCapabilities);
    }

    return filtered;
  }, [deferredSearchTerm, selectedCapabilities, allModels, fuse]);

  const setSearchTerm = (value: string) => {
    setSearchTermInternal(value);
  };

  const toggleCapability = (capability: TCapability) => {
    startTransition(() => {
      const currentCapabilities = capabilitiesParam
        ? new Set(
            capabilitiesParam
              .split(",")
              .map((cap) => cap.trim())
              .filter((cap) => cap.length > 0)
              .filter(isValidCapability)
          )
        : new Set<TCapability>();

      if (currentCapabilities.has(capability)) {
        currentCapabilities.delete(capability);
      } else {
        currentCapabilities.add(capability);
      }

      const newParam = Array.from(currentCapabilities).join(",");
      setCapabilitiesParamInternal(newParam || null);
    });
  };

  const clearCapabilities = () => {
    startTransition(() => {
      setCapabilitiesParamInternal(null);
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCapabilities,
    toggleCapability,
    clearCapabilities,
    filteredModels,
    allModels,
    isPending: isPending || isLoading,
    isLoading,
    error,
  };
}
