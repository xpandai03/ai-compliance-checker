import type { HIPAAUseCaseProfile, VendorPHIMetadata, HIPAAFindings, HIPAATriggeredRule } from "./types";
import { HIPAA_RULES, evaluateHIPAARule, toTriggeredRule } from "./hipaaRules";

export function auditHIPAA(
  profile: HIPAAUseCaseProfile,
  vendors: VendorPHIMetadata[]
): HIPAAFindings {
  console.log("[HIPAA AUDIT] Starting auditHIPAA");
  console.log("[HIPAA AUDIT] Profile PHI involved:", profile.phi_involved);
  console.log("[HIPAA AUDIT] Vendors count:", vendors.length);
  
  const triggeredRules: HIPAATriggeredRule[] = [];

  for (const rule of HIPAA_RULES) {
    const triggered = evaluateHIPAARule(rule, profile, vendors);
    console.log(`[HIPAA AUDIT] Rule ${rule.id}: ${triggered ? "TRIGGERED" : "not triggered"}`);
    if (triggered) {
      triggeredRules.push(toTriggeredRule(rule));
    }
  }

  console.log("[HIPAA AUDIT] Triggered rules:", triggeredRules.map(r => r.id));

  const riskClassification = determineHIPAARiskClassification(triggeredRules);
  const confidenceScore = calculateHIPAAConfidenceScore(triggeredRules, profile, vendors);
  const relevantCitations = extractUniqueCitations(triggeredRules);
  const statusFlag = determineHIPAAStatusFlag(riskClassification, triggeredRules, confidenceScore);
  const vendorAnalysis = analyzeVendors(profile, vendors, triggeredRules);

  // STEP 4: Runtime assertions for correctness
  const needsReviewRules = triggeredRules.filter(r => r.riskContribution === "needs_review");
  
  if (riskClassification === "Low Risk" && needsReviewRules.length > 0) {
    console.error("ASSERTION FAILED: LOW risk with unresolved review items");
    throw new Error("Invalid state: LOW risk with unresolved review items");
  }
  
  if (vendors.length === 0 && profile.phi_involved === true && riskClassification === "Low Risk") {
    console.error("ASSERTION FAILED: PHI with no vendors marked LOW");
    throw new Error("Invalid state: PHI with no vendors marked LOW");
  }

  console.log("[HIPAA AUDIT] Final risk:", riskClassification);
  console.log("[HIPAA AUDIT] Final status:", statusFlag);
  console.log("[HIPAA AUDIT] Confidence:", confidenceScore);

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
  const hasLowRisk = triggeredRules.some((r) => r.riskContribution === "low");

  // HIGH > NEEDS REVIEW > LOW - aggregation stays
  if (hasHighRisk) {
    return "High Risk";
  }
  if (hasNeedsReview) {
    return "Needs Review";
  }
  // LOW only if explicitly triggered by a LOW rule
  if (hasLowRisk) {
    return "Low Risk";
  }
  // No rules triggered = uncertainty = NEEDS REVIEW (never default compliant)
  return "Needs Review";
}

function calculateHIPAAConfidenceScore(
  triggeredRules: HIPAATriggeredRule[],
  profile: HIPAAUseCaseProfile,
  vendors: VendorPHIMetadata[]
): number {
  let baseScore = 0.7;
  
  // Penalize unknowns heavily
  const unknownFactors = [
    profile.phi_involved === "unknown",
    profile.organization_type === "unknown",
    profile.logging_behavior === "unknown",
    profile.retention_period_defined === "unknown",
    profile.access_controls_documented === "unknown",
  ].filter(Boolean).length;

  const uncertaintyPenalty = unknownFactors * 0.1;
  baseScore -= uncertaintyPenalty;

  // Penalize vendor unknowns
  const vendorUnknowns = vendors.filter(v => 
    v.baa_available === "unknown" || 
    v.data_storage === "unknown" || 
    v.logging_enabled === "unknown" ||
    v.access_controls_documented === "unknown"
  ).length;
  baseScore -= vendorUnknowns * 0.05;

  // Bonus for high rule coverage (more rules = more certainty)
  const ruleBonus = Math.min(triggeredRules.length * 0.03, 0.15);
  baseScore += ruleBonus;

  // Clamp to valid range
  return Math.max(0.3, Math.min(baseScore, 0.95));
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
  triggeredRules: HIPAATriggeredRule[],
  confidenceScore: number
): "Needs Manual Review" | "Compliant" | "Non-Compliant" {
  // STEP 3: ENFORCE "COMPLIANT" GATING
  // Compliant is allowed ONLY if:
  // - Final risk === LOW
  // - No NEEDS REVIEW rules triggered
  // - Confidence >= 70%

  if (riskClassification === "High Risk") {
    return "Non-Compliant";
  }
  
  if (riskClassification === "Needs Review") {
    return "Needs Manual Review";
  }
  
  // riskClassification is "Low Risk" at this point
  const hasNeedsReview = triggeredRules.some(r => r.riskContribution === "needs_review");
  const hasLowRiskRule = triggeredRules.some(r => r.riskContribution === "low");
  
  // Gate: confidence must be >= 70%
  if (confidenceScore < 0.70) {
    return "Needs Manual Review";
  }
  
  // Gate: no NEEDS REVIEW rules can be triggered
  if (hasNeedsReview) {
    return "Needs Manual Review";
  }
  
  // Gate: must have at least one explicit LOW rule triggered
  if (!hasLowRiskRule) {
    return "Needs Manual Review";
  }
  
  // All gates passed - COMPLIANT is earned
  return "Compliant";
}

function analyzeVendors(
  profile: HIPAAUseCaseProfile,
  vendors: VendorPHIMetadata[],
  triggeredRules: HIPAATriggeredRule[]
): HIPAAFindings["vendorAnalysis"] {
  return vendors.map((vendor) => {
    const riskFactors: string[] = [];

    if (vendor.baa_available === false) {
      riskFactors.push("No BAA available - CRITICAL");
    } else if (vendor.baa_available === "unknown") {
      riskFactors.push("BAA status unknown - needs verification");
    }

    if (vendor.data_storage === "stored") {
      riskFactors.push("Stores PHI data at rest");
    } else if (vendor.data_storage === "unknown") {
      riskFactors.push("Data storage behavior unknown");
    }

    if (vendor.logging_enabled === true) {
      riskFactors.push("Logging enabled - PHI may be in logs");
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
