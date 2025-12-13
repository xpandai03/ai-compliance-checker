// HIPAA Types (copied from kernel - do not modify)
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
