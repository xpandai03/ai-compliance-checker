import type { HIPAAUseCaseProfile, VendorPHIMetadata, HIPAAFindings, HIPAATriggeredRule } from "./types";
import { HIPAA_RULES, evaluateHIPAARule, toTriggeredRule } from "./hipaaRules";

export function auditHIPAA(
  profile: HIPAAUseCaseProfile,
  vendors: VendorPHIMetadata[]
): HIPAAFindings {
  const triggeredRules: HIPAATriggeredRule[] = [];

  for (const rule of HIPAA_RULES) {
    if (evaluateHIPAARule(rule, profile, vendors)) {
      triggeredRules.push(toTriggeredRule(rule));
    }
  }

  const riskClassification = determineHIPAARiskClassification(triggeredRules);
  const confidenceScore = calculateHIPAAConfidenceScore(triggeredRules, profile);
  const relevantCitations = extractUniqueCitations(triggeredRules);
  const statusFlag = determineHIPAAStatusFlag(riskClassification, triggeredRules);
  const vendorAnalysis = analyzeVendors(profile, vendors, triggeredRules);

  return {
    riskClassification,
    confidenceScore,
    applicableRegulation: "HIPAA",
    relevantCitations,
    statusFlag,
    triggeredRules,
    vendorAnalysis,
  };
}

function determineHIPAARiskClassification(
  triggeredRules: HIPAATriggeredRule[]
): "High Risk" | "Needs Review" | "Low Risk" {
  const hasHighRisk = triggeredRules.some((r) => r.riskContribution === "high");
  const hasNeedsReview = triggeredRules.some((r) => r.riskContribution === "needs_review");

  if (hasHighRisk) {
    return "High Risk";
  }
  if (hasNeedsReview) {
    return "Needs Review";
  }
  return "Low Risk";
}

function calculateHIPAAConfidenceScore(
  triggeredRules: HIPAATriggeredRule[],
  profile: HIPAAUseCaseProfile
): number {
  if (triggeredRules.length === 0) {
    return 0.5;
  }

  let baseScore = 0.6;
  
  const unknownFactors = [
    profile.phi_involved === "unknown",
    profile.organization_type === "unknown",
    profile.logging_behavior === "unknown",
    profile.retention_period_defined === "unknown",
    profile.access_controls_documented === "unknown",
  ].filter(Boolean).length;

  const uncertaintyPenalty = unknownFactors * 0.08;
  baseScore -= uncertaintyPenalty;

  const ruleBonus = Math.min(triggeredRules.length * 0.05, 0.25);
  
  const highRiskCount = triggeredRules.filter((r) => r.riskContribution === "high").length;
  const clarityBonus = highRiskCount > 0 ? 0.05 : 0;

  return Math.max(0.3, Math.min(baseScore + ruleBonus + clarityBonus, 0.95));
}

function extractUniqueCitations(triggeredRules: HIPAATriggeredRule[]): string[] {
  const citationSet = new Set<string>();

  for (const rule of triggeredRules) {
    for (const citation of rule.citations) {
      citationSet.add(citation);
    }
  }

  return Array.from(citationSet).sort();
}

function determineHIPAAStatusFlag(
  riskClassification: "High Risk" | "Needs Review" | "Low Risk",
  triggeredRules: HIPAATriggeredRule[]
): "Needs Manual Review" | "Compliant" | "Non-Compliant" {
  if (riskClassification === "High Risk") {
    return "Non-Compliant";
  }
  if (riskClassification === "Needs Review") {
    return "Needs Manual Review";
  }
  const hasOnlyLowRisk = triggeredRules.every((r) => r.riskContribution === "low");
  if (hasOnlyLowRisk && triggeredRules.length > 0) {
    return "Compliant";
  }
  return "Needs Manual Review";
}

function analyzeVendors(
  profile: HIPAAUseCaseProfile,
  vendors: VendorPHIMetadata[],
  triggeredRules: HIPAATriggeredRule[]
): HIPAAFindings["vendorAnalysis"] {
  return vendors.map((vendor) => {
    const riskFactors: string[] = [];

    if (vendor.baa_available === false) {
      riskFactors.push("No BAA available");
    } else if (vendor.baa_available === "unknown") {
      riskFactors.push("BAA status unknown");
    }

    if (vendor.data_storage === "stored") {
      riskFactors.push("Stores PHI data");
    } else if (vendor.data_storage === "unknown") {
      riskFactors.push("Data storage behavior unknown");
    }

    if (vendor.logging_enabled === true) {
      riskFactors.push("Logging enabled");
    } else if (vendor.logging_enabled === "unknown") {
      riskFactors.push("Logging behavior unknown");
    }

    if (vendor.access_controls_documented !== true) {
      riskFactors.push("Access controls not documented");
    }

    return {
      vendor_name: vendor.vendor_name,
      has_baa: vendor.baa_available,
      risk_factors: riskFactors,
    };
  });
}

export function generateHIPAAQuestionsFromRules(
  triggeredRules: HIPAATriggeredRule[]
): { id: string; question: string; answer: string; citations: string[] }[] {
  return triggeredRules.map((rule) => ({
    id: rule.id,
    question: `Why was "${rule.description}" flagged?`,
    answer: rule.explanation,
    citations: rule.citations,
  }));
}
