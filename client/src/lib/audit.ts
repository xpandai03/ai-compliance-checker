import type { ModelProfile, ComplianceFindings, TriggeredRule, AppliedArticle } from "./types";
import { EU_AI_ACT_RULES, evaluateRule } from "./rules";
import { EU_AI_ACT_ARTICLES } from "./euAiAct";

export function auditModel(profile: ModelProfile): ComplianceFindings {
  const triggeredRules: TriggeredRule[] = [];

  for (const rule of EU_AI_ACT_RULES) {
    if (evaluateRule(rule, profile)) {
      triggeredRules.push({
        id: rule.id,
        description: rule.description,
        explanation: rule.explanation,
        citations: rule.citations,
        riskContribution: rule.riskContribution,
        regulation_refs: rule.regulation_refs,
      });
    }
  }

  const riskClassification = determineRiskClassification(triggeredRules);
  const confidenceScore = calculateConfidenceScore(triggeredRules);
  const relevantArticles = extractUniqueArticles(triggeredRules);
  const appliedArticles = extractAppliedArticles(triggeredRules);
  const statusFlag = determineStatusFlag(riskClassification, triggeredRules);

  return {
    riskClassification,
    confidenceScore,
    applicableRegulation: "EU AI Act",
    relevantArticles,
    appliedArticles,
    statusFlag,
    triggeredRules,
  };
}

function extractAppliedArticles(triggeredRules: TriggeredRule[]): AppliedArticle[] {
  const articleMap = new Map<string, { triggeringRuleIds: string[] }>();

  for (const rule of triggeredRules) {
    for (const ref of rule.regulation_refs) {
      const articleKey = ref.article;
      if (!articleMap.has(articleKey)) {
        articleMap.set(articleKey, { triggeringRuleIds: [] });
      }
      const entry = articleMap.get(articleKey)!;
      if (!entry.triggeringRuleIds.includes(rule.id)) {
        entry.triggeringRuleIds.push(rule.id);
      }
    }
  }

  const appliedArticles: AppliedArticle[] = [];
  
  for (const [article, data] of articleMap.entries()) {
    const articleDetails = EU_AI_ACT_ARTICLES[article];
    if (articleDetails) {
      appliedArticles.push({
        article,
        title: articleDetails.title,
        summary: articleDetails.summary,
        triggeringRuleIds: data.triggeringRuleIds,
      });
    } else {
      appliedArticles.push({
        article,
        title: article,
        summary: "Reference from triggered compliance rule.",
        triggeringRuleIds: data.triggeringRuleIds,
      });
    }
  }

  return appliedArticles.sort((a, b) => {
    const numA = parseInt(a.article.match(/\d+/)?.[0] || "0", 10);
    const numB = parseInt(b.article.match(/\d+/)?.[0] || "0", 10);
    return numA - numB;
  });
}

function determineRiskClassification(
  triggeredRules: TriggeredRule[]
): "High Risk" | "Limited Risk" | "Minimal Risk" {
  const hasHighRisk = triggeredRules.some((r) => r.riskContribution === "high");
  const hasLimitedRisk = triggeredRules.some(
    (r) => r.riskContribution === "limited"
  );

  if (hasHighRisk) {
    return "High Risk";
  }
  if (hasLimitedRisk) {
    return "Limited Risk";
  }
  return "Minimal Risk";
}

function calculateConfidenceScore(triggeredRules: TriggeredRule[]): number {
  if (triggeredRules.length === 0) {
    return 0.5;
  }

  const baseScore = 0.6;
  const ruleBonus = Math.min(triggeredRules.length * 0.08, 0.35);

  const highRiskCount = triggeredRules.filter(
    (r) => r.riskContribution === "high"
  ).length;
  const clarityBonus = highRiskCount > 0 ? 0.05 : 0;

  return Math.min(baseScore + ruleBonus + clarityBonus, 0.95);
}

function extractUniqueArticles(triggeredRules: TriggeredRule[]): string[] {
  const articleSet = new Set<string>();

  for (const rule of triggeredRules) {
    for (const citation of rule.citations) {
      const match = citation.match(/Article\s+\d+[a-z]?/i);
      if (match) {
        articleSet.add(match[0]);
      }
    }
  }

  return Array.from(articleSet).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
    const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
    return numA - numB;
  });
}

function determineStatusFlag(
  riskClassification: "High Risk" | "Limited Risk" | "Minimal Risk",
  triggeredRules: TriggeredRule[]
): "Needs Manual Review" | "Compliant" | "Non-Compliant" {
  if (riskClassification === "High Risk") {
    return "Needs Manual Review";
  }
  if (triggeredRules.length === 0) {
    return "Compliant";
  }
  return "Needs Manual Review";
}

export function generateQuestionsFromRules(
  triggeredRules: TriggeredRule[]
): { id: string; question: string; answer: string; citations: string[] }[] {
  return triggeredRules.map((rule) => ({
    id: rule.id,
    question: `Why does "${rule.description}" apply?`,
    answer: rule.explanation,
    citations: rule.citations,
  }));
}
