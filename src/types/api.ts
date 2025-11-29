export type TModelModalities = {
  input: string[];
  output: string[];
};

export type TModelCost = {
  input: number;
  output: number;
  cache_read?: number;
  cache_write?: number;
  reasoning?: number;
  input_audio?: number;
};

export type TModelLimit = {
  context: number;
  output: number;
};

export type TModel = {
  id: string;
  name: string;
  attachment: boolean;
  reasoning: boolean;
  tool_call: boolean;
  temperature: boolean;
  structured_output?: boolean;
  knowledge: string;
  release_date: string;
  last_updated: string;
  modalities: TModelModalities;
  open_weights: boolean;
  cost: TModelCost;
  limit: TModelLimit;
  status?: string;
};

export type TProvider = {
  id: string;
  env: string[];
  npm: string;
  api: string;
  name: string;
  doc: string;
  models: Record<string, TModel>;
};

export type TModelsApiResponse = Record<string, TProvider>;

export type TCachedData = {
  data: TModelsApiResponse;
  timestamp: number;
};
