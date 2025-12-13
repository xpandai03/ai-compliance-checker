import type { HIPAAUseCaseProfile, VendorPHIMetadata, HIPAATriggeredRule } from "./types";

export interface HIPAARule {
  id: string;
  description: string;
  explanation: string;
  citations: string[];
  riskContribution: "high" | "needs_review" | "low";
  safeguard_category: "administrative" | "physical" | "technical" | "organizational";
  condition: (profile: HIPAAUseCaseProfile, vendors: VendorPHIMetadata[]) => boolean;
}

export const HIPAA_RULES: HIPAARule[] = [
  {
    id: "hipaa_phi_no_baa",
    description: "PHI processed without Business Associate Agreement",
    explanation:
      "When PHI is involved and processed by a third-party vendor, a Business Associate Agreement (BAA) is required under HIPAA. Processing PHI without a BAA creates significant compliance risk and potential liability.",
    citations: ["45 CFR §164.308(b)(1)", "45 CFR §164.502(e)", "45 CFR §164.504(e)"],
    riskContribution: "high",
    safeguard_category: "administrative",
    condition: (profile, vendors) => {
      if (profile.phi_involved !== true) return false;
      return vendors.some(v => v.baa_available === false);
    },
  },
  {
    id: "hipaa_phi_baa_unknown",
    description: "PHI processed with unknown BAA status",
    explanation:
      "When PHI is involved but the BAA status with a vendor is unknown, the organization cannot demonstrate compliance. This uncertainty must be resolved to ensure HIPAA compliance.",
    citations: ["45 CFR §164.308(b)(1)", "45 CFR §164.504(e)"],
    riskContribution: "needs_review",
    safeguard_category: "administrative",
    condition: (profile, vendors) => {
      if (profile.phi_involved !== true) return false;
      return vendors.some(v => v.baa_available === "unknown");
    },
  },
  {
    id: "hipaa_phi_logging_retained",
    description: "PHI logged and retained without defined retention policy",
    explanation:
      "Retaining logs that contain PHI without a defined retention period violates the minimum necessary standard and creates ongoing risk. HIPAA requires policies for data retention and disposal.",
    citations: ["45 CFR §164.530(j)", "45 CFR §164.502(b)"],
    riskContribution: "high",
    safeguard_category: "administrative",
    condition: (profile) => {
      if (profile.phi_involved !== true) return false;
      return profile.logging_behavior === "retained" && profile.retention_period_defined !== true;
    },
  },
  {
    id: "hipaa_phi_unknown_logging",
    description: "Unknown logging behavior with PHI involved",
    explanation:
      "When PHI is processed but logging behavior is unknown, the organization cannot ensure that PHI is not being improperly stored or retained. This must be investigated and documented.",
    citations: ["45 CFR §164.312(b)", "45 CFR §164.308(a)(1)(ii)(D)"],
    riskContribution: "needs_review",
    safeguard_category: "technical",
    condition: (profile) => {
      if (profile.phi_involved !== true) return false;
      return profile.logging_behavior === "unknown";
    },
  },
  {
    id: "hipaa_phi_no_access_controls",
    description: "PHI processed without documented access controls",
    explanation:
      "HIPAA requires implementation of access controls to protect ePHI. When access controls are not documented or their status is unknown, compliance cannot be demonstrated.",
    citations: ["45 CFR §164.312(a)(1)", "45 CFR §164.312(d)"],
    riskContribution: "high",
    safeguard_category: "technical",
    condition: (profile) => {
      if (profile.phi_involved !== true) return false;
      return profile.access_controls_documented === false;
    },
  },
  {
    id: "hipaa_phi_unknown_access_controls",
    description: "Unknown access control documentation status with PHI",
    explanation:
      "When PHI is involved but access control documentation status is unknown, the organization cannot demonstrate technical safeguard compliance. This requires immediate review.",
    citations: ["45 CFR §164.312(a)(1)", "45 CFR §164.308(a)(4)"],
    riskContribution: "needs_review",
    safeguard_category: "technical",
    condition: (profile) => {
      if (profile.phi_involved !== true) return false;
      return profile.access_controls_documented === "unknown";
    },
  },
  {
    id: "hipaa_phi_prod_unknown_org",
    description: "PHI in production with unknown organization type",
    explanation:
      "Processing PHI in production when the organization's HIPAA status (covered entity, business associate) is unknown creates fundamental compliance uncertainty. HIPAA obligations depend on entity classification.",
    citations: ["45 CFR §160.103", "45 CFR §164.502"],
    riskContribution: "high",
    safeguard_category: "organizational",
    condition: (profile) => {
      if (profile.phi_involved !== true) return false;
      return profile.environment === "prod" && profile.organization_type === "unknown";
    },
  },
  {
    id: "hipaa_vendor_stores_phi",
    description: "Vendor stores PHI without confirmed access controls",
    explanation:
      "When a vendor stores PHI (not just transient processing) and their access control documentation is unknown, there is risk that PHI may not be adequately protected at rest.",
    citations: ["45 CFR §164.312(a)(1)", "45 CFR §164.308(b)(3)"],
    riskContribution: "needs_review",
    safeguard_category: "technical",
    condition: (profile, vendors) => {
      if (profile.phi_involved !== true) return false;
      return vendors.some(v => v.data_storage === "stored" && v.access_controls_documented !== true);
    },
  },
  {
    id: "hipaa_vendor_logs_phi",
    description: "Vendor logs PHI data",
    explanation:
      "When a vendor's logging is enabled and PHI is involved, there is risk that PHI may be captured in logs. Logging of PHI requires appropriate safeguards and potentially patient authorization.",
    citations: ["45 CFR §164.312(b)", "45 CFR §164.530(j)"],
    riskContribution: "needs_review",
    safeguard_category: "technical",
    condition: (profile, vendors) => {
      if (profile.phi_involved !== true) return false;
      return vendors.some(v => v.logging_enabled === true);
    },
  },
  {
    id: "hipaa_phi_unknown_involvement",
    description: "Unknown PHI involvement status",
    explanation:
      "When it is unknown whether PHI is involved in an AI use case, conservative HIPAA compliance practices should be assumed. This uncertainty must be resolved through data classification.",
    citations: ["45 CFR §164.514", "45 CFR §164.502(d)"],
    riskContribution: "needs_review",
    safeguard_category: "administrative",
    condition: (profile) => {
      return profile.phi_involved === "unknown";
    },
  },
  {
    id: "hipaa_neither_entity_with_phi",
    description: "Organization not a covered entity or BA processes PHI",
    explanation:
      "If an organization claims to be neither a covered entity nor a business associate but processes PHI, this classification needs review. Processing PHI typically creates HIPAA obligations.",
    citations: ["45 CFR §160.103", "45 CFR §164.500"],
    riskContribution: "needs_review",
    safeguard_category: "organizational",
    condition: (profile) => {
      if (profile.phi_involved !== true) return false;
      return profile.organization_type === "neither";
    },
  },
  {
    id: "hipaa_phi_multiple_vendors",
    description: "PHI shared across multiple AI vendors",
    explanation:
      "When PHI flows through multiple vendors, each vendor relationship requires its own BAA and the data flow creates additional points of potential exposure. Complex vendor chains increase compliance burden.",
    citations: ["45 CFR §164.308(b)(1)", "45 CFR §164.504(e)(2)"],
    riskContribution: "needs_review",
    safeguard_category: "administrative",
    condition: (profile, vendors) => {
      if (profile.phi_involved !== true) return false;
      return vendors.length > 1;
    },
  },
  {
    id: "hipaa_phi_audio_transcription",
    description: "Audio PHI processed via AI transcription",
    explanation:
      "Audio recordings containing PHI (patient conversations, clinical dictation) processed through AI transcription services require careful vendor selection and BAA coverage. Audio data may contain sensitive information beyond structured data.",
    citations: ["45 CFR §164.312(e)(1)", "45 CFR §164.530(c)"],
    riskContribution: "needs_review",
    safeguard_category: "technical",
    condition: (profile) => {
      if (profile.phi_involved !== true) return false;
      return profile.ai_function === "transcription" && profile.phi_types.includes("audio");
    },
  },
  {
    id: "hipaa_phi_free_text_chat",
    description: "Free-text PHI in conversational AI",
    explanation:
      "Conversational AI systems processing free-text clinical notes or patient communications may capture extensive PHI in unpredictable formats. This requires robust data handling and access controls.",
    citations: ["45 CFR §164.502(b)", "45 CFR §164.514(d)"],
    riskContribution: "needs_review",
    safeguard_category: "technical",
    condition: (profile) => {
      if (profile.phi_involved !== true) return false;
      return profile.ai_function === "chat" && profile.phi_types.includes("free_text");
    },
  },
  {
    id: "hipaa_compliant_setup",
    description: "Compliant HIPAA configuration identified",
    explanation:
      "This use case demonstrates proper HIPAA safeguards: confirmed BAAs with all vendors, documented access controls, defined retention policies, and known organizational status. Continue maintaining these controls.",
    citations: ["45 CFR §164.308", "45 CFR §164.312", "45 CFR §164.530"],
    riskContribution: "low",
    safeguard_category: "organizational",
    condition: (profile, vendors) => {
      if (profile.phi_involved !== true) return true;
      const allBaasConfirmed = vendors.every(v => v.baa_available === true);
      const accessControlsOk = profile.access_controls_documented === true;
      const loggingOk = profile.logging_behavior !== "unknown" && 
        (profile.logging_behavior !== "retained" || profile.retention_period_defined === true);
      const orgKnown = profile.organization_type !== "unknown";
      return allBaasConfirmed && accessControlsOk && loggingOk && orgKnown;
    },
  },
];

export function evaluateHIPAARule(
  rule: HIPAARule,
  profile: HIPAAUseCaseProfile,
  vendors: VendorPHIMetadata[]
): boolean {
  return rule.condition(profile, vendors);
}

export function toTriggeredRule(rule: HIPAARule): HIPAATriggeredRule {
  return {
    id: rule.id,
    description: rule.description,
    explanation: rule.explanation,
    citations: rule.citations,
    riskContribution: rule.riskContribution,
    safeguard_category: rule.safeguard_category,
  };
}
