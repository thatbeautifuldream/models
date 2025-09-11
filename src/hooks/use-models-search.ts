"use client";

import { useMemo, useTransition, useDeferredValue } from "react";
import { useQueryState } from "nuqs";
import Fuse from "fuse.js";
import { models } from "@/data/models";

// Derive types from the data layer
type ModelsData = typeof models;
type AllModels = {
  [K in keyof ModelsData]: ModelsData[K]["models"][keyof ModelsData[K]["models"]]
}[keyof ModelsData];
type AllProviders = ModelsData[keyof ModelsData];

export type Model = AllModels;
export type Provider = AllProviders;

export type ModelEntry = {
  model: Model;
  provider: Provider;
  providerKey: string;
  modelKey: string;
  uniqueKey: string;
};

export type Capability = 
  | "text" 
  | "image" 
  | "audio" 
  | "video" 
  | "attachment" 
  | "reasoning" 
  | "tools" 
  | "temperature";

// Helper to extract all capabilities from a model
const getModelCapabilities = (model: Model): Capability[] => {
  const capabilities: Capability[] = [];
  
  // Add modalities
  if (model.modalities?.input) {
    capabilities.push(...(model.modalities.input as Capability[]));
  }
  if (model.modalities?.output) {
    capabilities.push(...(model.modalities.output as Capability[]));
  }
  
  // Add features
  if (model.attachment) capabilities.push("attachment");
  if (model.reasoning) capabilities.push("reasoning");
  if (model.tool_call) capabilities.push("tools");
  if (model.temperature) capabilities.push("temperature");
  
  return [...new Set(capabilities)];
};

// Memoized model capabilities cache
const modelCapabilitiesCache = new WeakMap<Model, Capability[]>();

const getCachedModelCapabilities = (model: Model): Capability[] => {
  if (modelCapabilitiesCache.has(model)) {
    return modelCapabilitiesCache.get(model)!;
  }
  const capabilities = getModelCapabilities(model);
  modelCapabilitiesCache.set(model, capabilities);
  return capabilities;
};

const filterByCapabilities = (models: ModelEntry[], selectedCapabilities: Set<Capability>): ModelEntry[] => {
  if (selectedCapabilities.size === 0) return models;
  
  return models.filter(entry => {
    const modelCapabilities = getCachedModelCapabilities(entry.model);
    return Array.from(selectedCapabilities).every(cap => modelCapabilities.includes(cap));
  });
};

// Prepare all models data once
const allModels: ModelEntry[] = Object.entries(models).flatMap(
  ([providerKey, provider]) =>
    Object.entries(provider.models).map(([modelKey, model]) => ({
      model,
      provider,
      providerKey,
      modelKey,
      uniqueKey: `${providerKey}/${modelKey}`,
    }))
);

// Configure Fuse for fuzzy search
const fuse = new Fuse(allModels, {
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

export function useModelsSearch() {
  const [isPending, startTransition] = useTransition();
  
  // URL state management with nuqs
  const [searchTerm, setSearchTermInternal] = useQueryState("search", {
    defaultValue: "",
    clearOnDefault: true,
  });
  
  const [capabilitiesParam, setCapabilitiesParamInternal] = useQueryState("capabilities", {
    defaultValue: "",
    clearOnDefault: true,
  });

  // Use deferred values only for heavy filtering operations
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredCapabilitiesParam = useDeferredValue(capabilitiesParam);

  // Convert capabilities param to Set (using deferred value for performance)
  const selectedCapabilities = useMemo(() => {
    if (!deferredCapabilitiesParam) return new Set<Capability>();
    return new Set(deferredCapabilitiesParam.split(",").filter(Boolean) as Capability[]);
  }, [deferredCapabilitiesParam]);

  // Filter models based on search and capabilities (using deferred values for heavy operations)
  const filteredModels = useMemo(() => {
    // Start with all models for fast initial render
    let filtered = allModels;

    // Apply fuzzy search if term exists (this is the heaviest operation)
    if (deferredSearchTerm.trim()) {
      const searchResults = fuse.search(deferredSearchTerm.trim());
      filtered = searchResults.map(result => result.item);
    }

    // Apply capability filters (lighter operation)
    if (selectedCapabilities.size > 0) {
      filtered = filterByCapabilities(filtered, selectedCapabilities);
    }

    return filtered;
  }, [deferredSearchTerm, selectedCapabilities]);

  const setSearchTerm = (value: string) => {
    setSearchTermInternal(value);
  };

  const toggleCapability = (capability: Capability) => {
    startTransition(() => {
      const currentCapabilities = capabilitiesParam ? new Set(capabilitiesParam.split(",").filter(Boolean) as Capability[]) : new Set<Capability>();
      
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
    isPending, // Expose loading state for UI feedback
  };
}