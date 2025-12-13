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
    id: "RULE_HIPAA_001",
    description: "Unknown PHI Involvement",
    explanation:
      "When it is unknown whether PHI is involved in an AI use case, conservative HIPAA compliance practices must be assumed. This uncertainty must be resolved through data classification before any risk determination can be made.",
    citations: ["45 CFR §164.308(a)(1)(ii)(A)"],
    riskContribution: "needs_review",
    safeguard_category: "administrative",
    condition: (profile) => {
      return profile.phi_involved === "unknown";
    },
  },
  {
    id: "RULE_HIPAA_002",
    description: "PHI with No Vendors Declared",
    explanation:
      "When PHI is confirmed but no AI vendors are declared, this indicates either incomplete intake data or undocumented vendor relationships. HIPAA requires full documentation of all entities that handle PHI.",
    citations: ["45 CFR §164.308(b)(1)"],
    riskContribution: "needs_review",
    safeguard_category: "administrative",
    condition: (profile, vendors) => {
      return profile.phi_involved === true && vendors.length === 0;
    },
  },
  {
    id: "RULE_HIPAA_003",
    description: "Vendor Without Business Associate Agreement",
    explanation:
      "When PHI is involved and any vendor does not have a confirmed BAA (baa_available !== true), this is a critical HIPAA violation. All vendors handling PHI must have executed BAAs.",
    citations: ["45 CFR §164.308(b)(1)"],
    riskContribution: "high",
    safeguard_category: "administrative",
    condition: (profile, vendors) => {
      if (profile.phi_involved !== true) return false;
      if (vendors.length === 0) return false;
      return vendors.some(v => v.baa_available !== true);
    },
  },
  {
    id: "RULE_HIPAA_004",
    description: "Retained PHI Logging",
    explanation:
      "When PHI is involved and logging behavior is set to 'retained', PHI may be persisted in logs indefinitely. This creates ongoing risk and requires explicit retention policies and safeguards.",
    citations: ["45 CFR §164.312(b)"],
    riskContribution: "high",
    safeguard_category: "technical",
    condition: (profile) => {
      return profile.phi_involved === true && profile.logging_behavior === "retained";
    },
  },
  {
    id: "RULE_HIPAA_005",
    description: "Unknown Logging in Production",
    explanation:
      "When the environment is production and logging behavior is unknown, audit controls cannot be verified. HIPAA requires documented audit controls for all production systems handling ePHI.",
    citations: ["45 CFR §164.312(b)"],
    riskContribution: "needs_review",
    safeguard_category: "technical",
    condition: (profile) => {
      return profile.environment === "prod" && profile.logging_behavior === "unknown";
    },
  },
  {
    id: "RULE_HIPAA_006",
    description: "Undefined Retention Period",
    explanation:
      "When PHI is involved but retention period is not defined (retention_period_defined !== true), the organization cannot demonstrate compliance with data retention requirements under HIPAA.",
    citations: ["45 CFR §164.312(c)(1)"],
    riskContribution: "needs_review",
    safeguard_category: "administrative",
    condition: (profile) => {
      return profile.phi_involved === true && profile.retention_period_defined !== true;
    },
  },
  {
    id: "RULE_HIPAA_007",
    description: "Undocumented Access Controls",
    explanation:
      "When PHI is involved but access controls are not documented (access_controls_documented !== true), the organization cannot demonstrate technical safeguard compliance under HIPAA.",
    citations: ["45 CFR §164.312(a)(1)"],
    riskContribution: "needs_review",
    safeguard_category: "technical",
    condition: (profile) => {
      return profile.phi_involved === true && profile.access_controls_documented !== true;
    },
  },
  {
    id: "RULE_HIPAA_008",
    description: "PHI Flag Inconsistency",
    explanation:
      "When phi_involved is false but phi_types array contains entries, there is a data inconsistency. Either PHI types were selected in error, or the phi_involved flag is incorrect. This must be resolved.",
    citations: ["45 CFR §164.308(a)(1)(ii)(A)"],
    riskContribution: "needs_review",
    safeguard_category: "administrative",
    condition: (profile) => {
      return profile.phi_involved === false && profile.phi_types.length > 0;
    },
  },
  {
    id: "RULE_HIPAA_009",
    description: "Explicit Non-PHI Use Case",
    explanation:
      "This use case explicitly confirms no PHI involvement, no vendor relationships, and no retained logging. When PHI is not involved, HIPAA obligations do not apply to this use case.",
    citations: ["45 CFR §164.502(a)"],
    riskContribution: "low",
    safeguard_category: "organizational",
    condition: (profile, vendors) => {
      return (
        profile.phi_involved === false &&
        vendors.length === 0 &&
        profile.logging_behavior !== "retained"
      );
    },
  },
  {
    id: "RULE_HIPAA_010",
    description: "Fully Characterized Low-Risk PHI Use",
    explanation:
      "This use case demonstrates comprehensive HIPAA safeguards: confirmed BAAs with all vendors, appropriate logging controls (none or transient), NO vendor logging enabled, defined retention period, and documented access controls.",
    citations: ["45 CFR §164.308", "45 CFR §164.312"],
    riskContribution: "low",
    safeguard_category: "organizational",
    condition: (profile, vendors) => {
      if (profile.phi_involved !== true) return false;
      if (vendors.length === 0) return false;
      const allBaasConfirmed = vendors.every(v => v.baa_available === true);
      const loggingOk = profile.logging_behavior === "none" || profile.logging_behavior === "transient";
      const noVendorLogging = vendors.every(v => v.logging_enabled !== true);
      const retentionDefined = profile.retention_period_defined === true;
      const accessControlsDocumented = profile.access_controls_documented === true;
      return allBaasConfirmed && loggingOk && noVendorLogging && retentionDefined && accessControlsDocumented;
    },
  },
  {
    id: "RULE_HIPAA_011",
    description: "Vendor Logging PHI Data",
    explanation:
      "When PHI is involved and any vendor has logging enabled, PHI may be captured in vendor logs. This creates audit trail requirements and potential data retention concerns that must be reviewed.",
    citations: ["45 CFR §164.312(b)"],
    riskContribution: "needs_review",
    safeguard_category: "technical",
    condition: (profile, vendors) => {
      if (profile.phi_involved !== true) return false;
      return vendors.some(v => v.logging_enabled === true);
    },
  },
  {
    id: "RULE_HIPAA_012",
    description: "Logging Configuration Inconsistency",
    explanation:
      "The use case declares logging_behavior as 'none' but one or more vendors have logging enabled. This inconsistency must be resolved - either vendor logging should be disabled or the use case logging declaration should be updated.",
    citations: ["45 CFR §164.312(b)", "45 CFR §164.308(a)(1)(ii)(A)"],
    riskContribution: "needs_review",
    safeguard_category: "administrative",
    condition: (profile, vendors) => {
      if (profile.logging_behavior !== "none") return false;
      return vendors.some(v => v.logging_enabled === true);
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
