export type TModelArchitecture = {
  modality: string;
  input_modalities: string[];
  output_modalities: string[];
  tokenizer: string | null;
  instruct_type: string | null;
};

export type TPricing = {
  prompt?: string;
  completion?: string;
  web_search?: string;
  input_cache_read?: string;
  input_cache_write?: string;
};

export type TTopProvider = {
  context_length?: number;
  max_completion_tokens?: number;
  is_moderated?: boolean;
};

export type TModelJson = {
  id: string;
  canonical_slug: string;
  hugging_face_id: string | null;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: TModelArchitecture;
  pricing: TPricing;
  top_provider: TTopProvider;
  per_request_limits: Record<string, unknown> | null;
  supported_parameters: string[];
  default_parameters: Record<string, unknown>;
  expiration_date: string | null;
};

export type TModelsJsonResponse = {
  data: TModelJson[];
};
