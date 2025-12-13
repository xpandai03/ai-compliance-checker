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

export interface RegulationRef {
  regulation: string;
  article: string;
}

export interface TriggeredRule {
  id: string;
  description: string;
  explanation: string;
  citations: string[];
  riskContribution: "high" | "limited" | "minimal";
  regulation_refs: RegulationRef[];
}

export interface AppliedArticle {
  article: string;
  title: string;
  summary: string;
  triggeringRuleIds: string[];
}

export interface ComplianceFindings {
  riskClassification: "High Risk" | "Limited Risk" | "Minimal Risk";
  confidenceScore: number;
  applicableRegulation: string;
  relevantArticles: string[];
  appliedArticles: AppliedArticle[];
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

// HIPAA Types
export interface HIPAAUseCaseProfile {
  use_case_name: string;
  organization_type: "covered_entity" | "business_associate" | "neither" | "unknown";
  ai_function: "chat" | "summarization" | "transcription" | "coding" | "other";
  phi_involved: boolean | "unknown";
  phi_types: string[];
  input_source: string;
  output_destination: string;
  environment: "prod" | "staging" | "dev";
  logging_behavior: "none" | "transient" | "retained" | "unknown";
  retention_period_defined: boolean | "unknown";
  access_controls_documented: boolean | "unknown";
  vendors_used: { vendor_name: string; role: string }[];
}

export interface VendorPHIMetadata {
  vendor_name: string;
  baa_available: boolean | "unknown";
  data_storage: "none" | "transient" | "stored" | "unknown";
  logging_enabled: boolean | "unknown";
  access_controls_documented: boolean | "unknown";
  source: string;
  confidence: "high" | "medium" | "low";
}

export interface HIPAATriggeredRule {
  id: string;
  description: string;
  explanation: string;
  citations: string[];
  riskContribution: "high" | "needs_review" | "low";
  safeguard_category: "administrative" | "physical" | "technical" | "organizational";
}

export interface HIPAAFindings {
  riskClassification: "High Risk" | "Needs Review" | "Low Risk";
  confidenceScore: number;
  applicableRegulation: string;
  relevantCitations: string[];
  statusFlag: "Needs Manual Review" | "Compliant" | "Non-Compliant";
  triggeredRules: HIPAATriggeredRule[];
  vendorAnalysis: {
    vendor_name: string;
    has_baa: boolean | "unknown";
    risk_factors: string[];
  }[];
}

export const HIPAA_ORGANIZATION_TYPE_OPTIONS = [
  { value: "covered_entity", label: "Covered Entity (e.g., hospital, clinic, insurer)" },
  { value: "business_associate", label: "Business Associate" },
  { value: "neither", label: "Neither" },
  { value: "unknown", label: "Unknown" },
] as const;

export const HIPAA_AI_FUNCTION_OPTIONS = [
  { value: "chat", label: "Chat / Conversational AI" },
  { value: "summarization", label: "Summarization" },
  { value: "transcription", label: "Transcription" },
  { value: "coding", label: "Medical Coding / Billing" },
  { value: "other", label: "Other" },
] as const;

export const HIPAA_ENVIRONMENT_OPTIONS = [
  { value: "prod", label: "Production" },
  { value: "staging", label: "Staging" },
  { value: "dev", label: "Development" },
] as const;

export const HIPAA_LOGGING_OPTIONS = [
  { value: "none", label: "No logging" },
  { value: "transient", label: "Transient (deleted within 24h)" },
  { value: "retained", label: "Retained" },
  { value: "unknown", label: "Unknown" },
] as const;

export const HIPAA_PHI_TYPE_OPTIONS = [
  { value: "free_text", label: "Free-text clinical notes" },
  { value: "structured", label: "Structured data (diagnoses, labs)" },
  { value: "images", label: "Medical images" },
  { value: "audio", label: "Audio recordings" },
] as const;
