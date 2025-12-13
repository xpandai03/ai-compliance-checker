import type { HIPAAUseCaseProfile, VendorPHIMetadata } from "./hipaaTypes";

// Vendor intake shape - matches kernel VendorPHIMetadata contract
export interface VendorDraft {
  vendor_name: string;
  baa_available: "yes" | "no" | "unknown" | "";
  storage_behavior: "none" | "transient" | "stored" | "unknown" | "";
  logging_enabled: "yes" | "no" | "unknown" | "";
}

// UI Draft shape from page.tsx
export interface AssessmentDraft {
  useCaseName: string;
  organizationType: string;
  aiFunction: string;
  phiInvolved: string;
  phiTypes: string[];
  vendors: VendorDraft[];
  loggingBehavior: string;
  environment: string;
  retentionPeriodDefined: string;
  accessControlsDocumented: string;
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

  // Map retention period defined (yes/no/unknown)
  const retentionMap: Record<string, boolean | "unknown"> = {
    yes: true,
    no: false,
    unknown: "unknown",
  };
  const retention_period_defined = retentionMap[draft.retentionPeriodDefined] ?? "unknown";

  // Map access controls documented (yes/no/unknown)
  const accessControlsMap: Record<string, boolean | "unknown"> = {
    yes: true,
    no: false,
    unknown: "unknown",
  };
  const access_controls_documented = accessControlsMap[draft.accessControlsDocumented] ?? "unknown";

  // Filter out empty PHI types
  const phi_types = draft.phiTypes.filter((t) => t.trim() !== "");

  // Map vendors to vendors_used format (role is informational only, not used by kernel)
  const vendors_used = draft.vendors
    .filter((v) => v.vendor_name.trim() !== "")
    .map((vendor) => ({
      vendor_name: vendor.vendor_name,
      role: "AI Provider",
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
    retention_period_defined,
    access_controls_documented,
    vendors_used,
  };
}

/**
 * Helper to map yes/no/unknown string to boolean | "unknown"
 */
function mapYesNoUnknown(value: string): boolean | "unknown" {
  if (value === "yes") return true;
  if (value === "no") return false;
  return "unknown";
}

/**
 * Helper to map storage behavior string to kernel enum
 */
function mapStorageBehavior(value: string): "none" | "transient" | "stored" | "unknown" {
  if (value === "none" || value === "transient" || value === "stored") {
    return value;
  }
  return "unknown";
}

/**
 * Creates VendorPHIMetadata array directly from draft vendors.
 * Maps UI values 1-to-1 to kernel contract - no inference, no defaults.
 */
export function createVendorMetadata(
  _profile: HIPAAUseCaseProfile,
  draftVendors: VendorDraft[]
): VendorPHIMetadata[] {
  return draftVendors
    .filter((v) => v.vendor_name.trim() !== "")
    .map((vendor) => ({
      vendor_name: vendor.vendor_name,
      baa_available: mapYesNoUnknown(vendor.baa_available),
      data_storage: mapStorageBehavior(vendor.storage_behavior),
      logging_enabled: mapYesNoUnknown(vendor.logging_enabled),
      // Access controls are global, not vendor-specific - default to "unknown"
      access_controls_documented: "unknown",
      source: "user_input",
      confidence: vendor.baa_available && vendor.storage_behavior && vendor.logging_enabled ? "high" : "medium",
    }));
}
