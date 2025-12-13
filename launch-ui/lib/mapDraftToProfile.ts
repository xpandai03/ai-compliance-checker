import type { HIPAAUseCaseProfile, VendorPHIMetadata } from "./hipaaTypes";

// UI Draft shape from page.tsx
export interface AssessmentDraft {
  useCaseName: string;
  organizationType: string;
  aiFunction: string;
  phiInvolved: string;
  phiTypes: string[];
  vendors: string[];
  loggingBehavior: string;
  environment: string;
}

/**
 * Maps UI draft state to kernel HIPAAUseCaseProfile.
 * This is a pure mapping function - no kernel logic changes.
 */
export function mapDraftToHIPAAProfile(draft: AssessmentDraft): HIPAAUseCaseProfile {
  // Map organization type
  const orgTypeMap: Record<string, HIPAAUseCaseProfile["organization_type"]> = {
    covered_entity: "covered_entity",
    business_associate: "business_associate",
    other: "neither",
    not_sure: "unknown",
  };
  const organization_type = orgTypeMap[draft.organizationType] || "unknown";

  // Map AI function
  const aiFunctionMap: Record<string, HIPAAUseCaseProfile["ai_function"]> = {
    chatbot: "chat",
    transcription: "transcription",
    summarization: "summarization",
    intake: "other",
    other: "other",
  };
  const ai_function = aiFunctionMap[draft.aiFunction] || "other";

  // Map PHI involved
  const phiInvolvedMap: Record<string, boolean | "unknown"> = {
    yes: true,
    no: false,
    not_sure: "unknown",
  };
  const phi_involved = phiInvolvedMap[draft.phiInvolved] ?? "unknown";

  // Map logging behavior
  const loggingMap: Record<string, HIPAAUseCaseProfile["logging_behavior"]> = {
    logs_phi: "retained",
    does_not_log: "none",
    unknown: "unknown",
  };
  const logging_behavior = loggingMap[draft.loggingBehavior] || "unknown";

  // Map environment
  const envMap: Record<string, HIPAAUseCaseProfile["environment"]> = {
    prod: "prod",
    staging: "staging",
    dev: "dev",
  };
  const environment = envMap[draft.environment] || "prod";

  // Filter out empty PHI types
  const phi_types = draft.phiTypes.filter((t) => t.trim() !== "");

  // Map vendors to vendors_used format
  const vendors_used = draft.vendors
    .filter((v) => v.trim() !== "")
    .map((vendor_name) => ({
      vendor_name,
      role: "AI Provider", // Default role since UI doesn't collect this
    }));

  return {
    use_case_name: draft.useCaseName || "Unnamed Use Case",
    organization_type,
    ai_function,
    phi_involved,
    phi_types,
    input_source: "UI Intake Form",
    output_destination: "AI System",
    environment,
    logging_behavior,
    // These are not collected in the simplified UI - default to unknown
    retention_period_defined: "unknown",
    access_controls_documented: "unknown",
    vendors_used,
  };
}

/**
 * Creates VendorPHIMetadata array from the profile.
 * Since the UI doesn't collect detailed vendor info, we set most fields to "unknown".
 */
export function createVendorMetadata(
  profile: HIPAAUseCaseProfile
): VendorPHIMetadata[] {
  return profile.vendors_used.map((vendor) => ({
    vendor_name: vendor.vendor_name,
    baa_available: "unknown",
    data_storage: "unknown",
    logging_enabled: "unknown",
    access_controls_documented: "unknown",
    source: "user_input",
    confidence: "low",
  }));
}
