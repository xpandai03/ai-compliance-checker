import type { ProviderMetadata, MetadataField } from "./types";

const OPENAI_MODEL_REGISTRY: Record<string, {
  modality: string[];
  deployment_class: string;
  context_window: number;
  model_family: string;
}> = {
  "gpt-4o": {
    modality: ["text", "vision"],
    deployment_class: "general-purpose foundation model",
    context_window: 128000,
    model_family: "GPT-4"
  },
  "gpt-4o-mini": {
    modality: ["text", "vision"],
    deployment_class: "general-purpose foundation model",
    context_window: 128000,
    model_family: "GPT-4"
  },
  "gpt-4-turbo": {
    modality: ["text", "vision"],
    deployment_class: "general-purpose foundation model",
    context_window: 128000,
    model_family: "GPT-4"
  },
  "gpt-4": {
    modality: ["text"],
    deployment_class: "general-purpose foundation model",
    context_window: 8192,
    model_family: "GPT-4"
  },
  "gpt-3.5-turbo": {
    modality: ["text"],
    deployment_class: "general-purpose foundation model",
    context_window: 16385,
    model_family: "GPT-3.5"
  },
  "o1": {
    modality: ["text"],
    deployment_class: "reasoning foundation model",
    context_window: 200000,
    model_family: "o1"
  },
  "o1-mini": {
    modality: ["text"],
    deployment_class: "reasoning foundation model",
    context_window: 128000,
    model_family: "o1"
  },
  "o1-preview": {
    modality: ["text"],
    deployment_class: "reasoning foundation model",
    context_window: 128000,
    model_family: "o1"
  }
};

const ANTHROPIC_MODEL_REGISTRY: Record<string, {
  modality: string[];
  deployment_class: string;
  context_window: number;
  model_family: string;
}> = {
  "claude-3-opus": {
    modality: ["text", "vision"],
    deployment_class: "general-purpose foundation model",
    context_window: 200000,
    model_family: "Claude 3"
  },
  "claude-3-sonnet": {
    modality: ["text", "vision"],
    deployment_class: "general-purpose foundation model",
    context_window: 200000,
    model_family: "Claude 3"
  },
  "claude-3-haiku": {
    modality: ["text", "vision"],
    deployment_class: "general-purpose foundation model",
    context_window: 200000,
    model_family: "Claude 3"
  },
  "claude-3.5-sonnet": {
    modality: ["text", "vision"],
    deployment_class: "general-purpose foundation model",
    context_window: 200000,
    model_family: "Claude 3.5"
  },
  "claude-3.5-haiku": {
    modality: ["text", "vision"],
    deployment_class: "general-purpose foundation model",
    context_window: 200000,
    model_family: "Claude 3.5"
  }
};

function createUnknownField<T>(defaultValue: T): MetadataField<T> {
  return {
    value: defaultValue,
    source: "unknown",
    confidence: 0.3
  };
}

function findMatchingModel(modelName: string, registry: Record<string, unknown>): string | null {
  const normalizedInput = modelName.toLowerCase().trim();
  
  for (const key of Object.keys(registry)) {
    if (normalizedInput === key.toLowerCase()) {
      return key;
    }
    if (normalizedInput.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedInput)) {
      return key;
    }
  }
  return null;
}

function deriveModelFamily(modelName: string): string {
  const lowerName = modelName.toLowerCase();
  if (lowerName.includes("gpt-4")) return "GPT-4";
  if (lowerName.includes("gpt-3")) return "GPT-3.5";
  if (lowerName.includes("o1")) return "o1";
  if (lowerName.includes("claude-3.5")) return "Claude 3.5";
  if (lowerName.includes("claude-3")) return "Claude 3";
  if (lowerName.includes("claude-2")) return "Claude 2";
  if (lowerName.includes("claude")) return "Claude";
  return "unknown";
}

export async function fetchProviderMetadata(
  provider: "OpenAI" | "Anthropic" | "Open Source" | "Custom",
  modelName: string
): Promise<ProviderMetadata> {
  const sources: string[] = [];
  
  if (provider === "OpenAI") {
    return fetchOpenAIMetadata(modelName, sources);
  }
  
  if (provider === "Anthropic") {
    return fetchAnthropicMetadata(modelName, sources);
  }
  
  return createFallbackMetadata(provider, modelName, sources);
}

async function fetchOpenAIMetadata(modelName: string, sources: string[]): Promise<ProviderMetadata> {
  let apiModelData: { id?: string; owned_by?: string; permission?: unknown[] } | null = null;
  
  try {
    const response = await fetch("/api/openai/models");
    if (response.ok) {
      const data = await response.json();
      if (data.models && Array.isArray(data.models)) {
        const normalizedInput = modelName.toLowerCase().trim();
        apiModelData = data.models.find((m: { id: string }) => 
          m.id.toLowerCase() === normalizedInput ||
          m.id.toLowerCase().includes(normalizedInput) ||
          normalizedInput.includes(m.id.toLowerCase())
        );
        if (apiModelData) {
          sources.push("openai_api");
        }
      }
    }
  } catch {
    // API call failed, continue with curated registry
  }

  const matchedKey = findMatchingModel(modelName, OPENAI_MODEL_REGISTRY);
  const registryData = matchedKey ? OPENAI_MODEL_REGISTRY[matchedKey] : null;
  
  if (registryData) {
    sources.push("curated_registry");
  }

  const metadata: ProviderMetadata = {
    model_id: apiModelData?.id 
      ? { value: apiModelData.id, source: "openai_api", confidence: 1.0 }
      : { value: modelName, source: "curated_registry", confidence: 0.8 },
    
    provider: { value: "OpenAI", source: "curated_registry", confidence: 1.0 },
    
    model_family: registryData
      ? { value: registryData.model_family, source: "curated_registry", confidence: 0.9 }
      : { value: deriveModelFamily(modelName), source: "curated_registry", confidence: 0.6 },
    
    modality: registryData
      ? { value: registryData.modality, source: "curated_registry", confidence: 0.9 }
      : createUnknownField<string[]>(["text"]),
    
    context_window: registryData
      ? { value: registryData.context_window, source: "curated_registry", confidence: 0.9 }
      : createUnknownField<number | null>(null),
    
    deployment_class: registryData
      ? { value: registryData.deployment_class, source: "curated_registry", confidence: 0.9 }
      : { value: "general-purpose foundation model", source: "curated_registry", confidence: 0.6 },
    
    owned_by: apiModelData?.owned_by
      ? { value: apiModelData.owned_by, source: "openai_api", confidence: 1.0 }
      : { value: "openai", source: "curated_registry", confidence: 0.8 },
    
    has_permissions: {
      value: apiModelData?.permission !== undefined && Array.isArray(apiModelData.permission),
      source: apiModelData ? "openai_api" : "unknown",
      confidence: apiModelData ? 1.0 : 0.3
    },
    
    metadata_sources: sources.length > 0 ? sources : ["unknown"],
    overall_confidence: calculateOverallConfidence(sources, !!registryData, !!apiModelData)
  };

  return metadata;
}

async function fetchAnthropicMetadata(modelName: string, sources: string[]): Promise<ProviderMetadata> {
  const matchedKey = findMatchingModel(modelName, ANTHROPIC_MODEL_REGISTRY);
  const registryData = matchedKey ? ANTHROPIC_MODEL_REGISTRY[matchedKey] : null;
  
  if (registryData) {
    sources.push("curated_registry");
  }

  const metadata: ProviderMetadata = {
    model_id: { value: modelName, source: "curated_registry", confidence: 0.8 },
    
    provider: { value: "Anthropic", source: "curated_registry", confidence: 1.0 },
    
    model_family: registryData
      ? { value: registryData.model_family, source: "curated_registry", confidence: 0.9 }
      : { value: deriveModelFamily(modelName), source: "curated_registry", confidence: 0.6 },
    
    modality: registryData
      ? { value: registryData.modality, source: "curated_registry", confidence: 0.9 }
      : createUnknownField<string[]>(["text"]),
    
    context_window: registryData
      ? { value: registryData.context_window, source: "curated_registry", confidence: 0.9 }
      : createUnknownField<number | null>(null),
    
    deployment_class: registryData
      ? { value: registryData.deployment_class, source: "curated_registry", confidence: 0.9 }
      : { value: "general-purpose foundation model", source: "curated_registry", confidence: 0.6 },
    
    owned_by: { value: "anthropic", source: "curated_registry", confidence: 0.9 },
    
    has_permissions: createUnknownField(false),
    
    metadata_sources: sources.length > 0 ? sources : ["unknown"],
    overall_confidence: registryData ? 0.85 : 0.5
  };

  return metadata;
}

function createFallbackMetadata(
  provider: string,
  modelName: string,
  sources: string[]
): ProviderMetadata {
  return {
    model_id: { value: modelName, source: "unknown", confidence: 0.5 },
    provider: { value: provider, source: "unknown", confidence: 0.5 },
    model_family: createUnknownField("unknown"),
    modality: createUnknownField<string[]>(["text"]),
    context_window: createUnknownField<number | null>(null),
    deployment_class: createUnknownField("unknown"),
    owned_by: createUnknownField("unknown"),
    has_permissions: createUnknownField(false),
    metadata_sources: sources.length > 0 ? sources : ["unknown"],
    overall_confidence: 0.3
  };
}

function calculateOverallConfidence(
  sources: string[],
  hasRegistryData: boolean,
  hasApiData: boolean
): number {
  if (hasApiData && hasRegistryData) {
    return 0.95;
  }
  if (hasApiData) {
    return 0.85;
  }
  if (hasRegistryData) {
    return 0.8;
  }
  return 0.4;
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function getSourceLabel(source: string): string {
  switch (source) {
    case "openai_api":
      return "OpenAI API";
    case "curated_registry":
      return "Curated Registry";
    default:
      return "Unknown";
  }
}
