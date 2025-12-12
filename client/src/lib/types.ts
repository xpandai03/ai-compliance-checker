export interface MetadataField<T> {
  value: T;
  source: "openai_api" | "curated_registry" | "unknown";
  confidence: number;
}

export interface ProviderMetadata {
  model_id: MetadataField<string>;
  provider: MetadataField<string>;
  model_family: MetadataField<string>;
  modality: MetadataField<string[]>;
  context_window: MetadataField<number | null>;
  deployment_class: MetadataField<string>;
  owned_by: MetadataField<string>;
  has_permissions: MetadataField<boolean>;
  metadata_sources: string[];
  overall_confidence: number;
}

export interface ModelProfile {
  modelName: string;
  provider: "OpenAI" | "Anthropic" | "Open Source" | "Custom";
  useCase: string;
  userType: "General Public" | "Internal" | "Enterprise";
  provider_metadata?: ProviderMetadata;
}

export interface TriggeredRule {
  id: string;
  description: string;
  explanation: string;
  citations: string[];
  riskContribution: "high" | "limited" | "minimal";
}

export interface ComplianceFindings {
  riskClassification: "High Risk" | "Limited Risk" | "Minimal Risk";
  confidenceScore: number;
  applicableRegulation: string;
  relevantArticles: string[];
  statusFlag: "Needs Manual Review" | "Compliant" | "Non-Compliant";
  triggeredRules: TriggeredRule[];
}

export interface ExplainabilityQuestion {
  id: string;
  question: string;
  answer: string;
  citations: string[];
}

export const PROVIDER_OPTIONS = [
  { value: "OpenAI", label: "OpenAI" },
  { value: "Anthropic", label: "Anthropic" },
  { value: "Open Source", label: "Open Source" },
  { value: "Custom", label: "Custom" },
] as const;

export const USER_TYPE_OPTIONS = [
  { value: "General Public", label: "General Public" },
  { value: "Internal", label: "Internal" },
  { value: "Enterprise", label: "Enterprise" },
] as const;
