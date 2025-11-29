"use client";

import { useDeferredValue, useEffect, useMemo, useTransition } from "react";
import { useQueryState } from "nuqs";
import Fuse from "fuse.js";
import type { TModel as TApiModel, TProvider as TApiProvider } from "@/types/api";
import { useModelsStore } from "@/store/models-store";

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

const getModelCapabilities = (model: TModel): TCapability[] => {
  const capabilities: TCapability[] = [];

  if (model.modalities?.input) {
    capabilities.push(...(model.modalities.input as TCapability[]));
  }
  if (model.modalities?.output) {
    capabilities.push(...(model.modalities.output as TCapability[]));
  }

  if (model.attachment) capabilities.push("attachment");
  if (model.reasoning) capabilities.push("reasoning");
  if (model.tool_call) capabilities.push("tools");
  if (model.temperature) capabilities.push("temperature");

  return [...new Set(capabilities)];
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
  const { models, isLoading, initializeModels, refreshModels } =
    useModelsStore();

  useEffect(() => {
    initializeModels();
  }, [initializeModels]);

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
    return new Set(
      deferredCapabilitiesParam.split(",").filter(Boolean) as TCapability[]
    );
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
            capabilitiesParam.split(",").filter(Boolean) as TCapability[]
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
    refreshModels,
  };
}
