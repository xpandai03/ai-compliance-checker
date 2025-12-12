import type { ModelProfile } from "./types";

export interface RuleCondition {
  field: keyof ModelProfile;
  operator: "equals" | "includes" | "not_equals";
  value: string | string[];
}

export interface RegulationRef {
  regulation: string;
  article: string;
}

export interface ComplianceRule {
  id: string;
  description: string;
  explanation: string;
  citations: string[];
  conditions: RuleCondition[];
  conditionLogic: "AND" | "OR";
  riskContribution: "high" | "limited" | "minimal";
  regulation_refs: RegulationRef[];
}

export const EU_AI_ACT_RULES: ComplianceRule[] = [
  {
    id: "rule_public_facing",
    description: "AI system deployed to the general public",
    explanation:
      "AI systems that interact directly with natural persons in ways that may significantly affect their rights or access to services are subject to heightened scrutiny. Public-facing deployment triggers additional transparency and accountability requirements under the EU AI Act.",
    citations: ["EU AI Act, Article 52(1)", "EU AI Act, Recital 70"],
    conditions: [
      { field: "userType", operator: "equals", value: "General Public" },
    ],
    conditionLogic: "AND",
    riskContribution: "high",
    regulation_refs: [
      { regulation: "EU AI Act", article: "Article 52" },
      { regulation: "EU AI Act", article: "Recital 70" }
    ],
  },
  {
    id: "rule_foundation_model",
    description: "Uses foundation model from major provider",
    explanation:
      "Foundation models from providers like OpenAI or Anthropic are considered general-purpose AI systems with systemic risks. Deployers inherit obligations for transparency, documentation, and downstream risk management as specified in the EU AI Act.",
    citations: ["EU AI Act, Article 28b", "EU AI Act, Annex VIII"],
    conditions: [
      { field: "provider", operator: "includes", value: ["OpenAI", "Anthropic"] },
    ],
    conditionLogic: "OR",
    riskContribution: "high",
    regulation_refs: [
      { regulation: "EU AI Act", article: "Article 28b" },
      { regulation: "EU AI Act", article: "Annex VIII" }
    ],
  },
  {
    id: "rule_customer_interaction",
    description: "System handles customer-facing interactions",
    explanation:
      "AI systems used in customer service contexts that can make recommendations, process requests, or influence consumer decisions require transparency about AI involvement. Users must be informed they are interacting with an AI system.",
    citations: ["EU AI Act, Article 52(1)", "EU AI Act, Article 13"],
    conditions: [
      { field: "useCase", operator: "includes", value: ["customer", "support", "chat", "service"] },
    ],
    conditionLogic: "OR",
    riskContribution: "limited",
    regulation_refs: [
      { regulation: "EU AI Act", article: "Article 52" },
      { regulation: "EU AI Act", article: "Article 13" }
    ],
  },
  {
    id: "rule_enterprise_internal",
    description: "Internal or enterprise deployment with limited exposure",
    explanation:
      "AI systems deployed for internal use within an organization or for enterprise clients with contractual safeguards present lower risk profiles. However, proper documentation and human oversight requirements still apply.",
    citations: ["EU AI Act, Article 29", "EU AI Act, Recital 48"],
    conditions: [
      { field: "userType", operator: "includes", value: ["Internal", "Enterprise"] },
    ],
    conditionLogic: "OR",
    riskContribution: "minimal",
    regulation_refs: [
      { regulation: "EU AI Act", article: "Article 29" },
      { regulation: "EU AI Act", article: "Recital 48" }
    ],
  },
  {
    id: "rule_open_source",
    description: "Uses open source or custom model",
    explanation:
      "Open source and custom models may have different transparency obligations. The deployer assumes greater responsibility for model behavior, safety testing, and compliance documentation when using non-commercial foundation models.",
    citations: ["EU AI Act, Article 2(5e)", "EU AI Act, Recital 12a"],
    conditions: [
      { field: "provider", operator: "includes", value: ["Open Source", "Custom"] },
    ],
    conditionLogic: "OR",
    riskContribution: "limited",
    regulation_refs: [
      { regulation: "EU AI Act", article: "Recital 102" }
    ],
  },
  {
    id: "rule_automated_decisions",
    description: "Potential for automated decision-making",
    explanation:
      "AI systems that may influence decisions affecting individuals require human oversight mechanisms. This is particularly relevant when the system's outputs could affect access to services, contractual relationships, or individual rights.",
    citations: ["EU AI Act, Article 14", "GDPR Article 22"],
    conditions: [
      { field: "useCase", operator: "includes", value: ["decision", "recommend", "assess", "evaluate", "moderate"] },
    ],
    conditionLogic: "OR",
    riskContribution: "high",
    regulation_refs: [
      { regulation: "EU AI Act", article: "Article 14" },
      { regulation: "EU AI Act", article: "Article 6" }
    ],
  },
];

export function evaluateCondition(
  condition: RuleCondition,
  profile: ModelProfile
): boolean {
  const fieldValue = profile[condition.field];
  const targetValue = condition.value;

  switch (condition.operator) {
    case "equals":
      return fieldValue === targetValue;
    case "not_equals":
      return fieldValue !== targetValue;
    case "includes":
      if (Array.isArray(targetValue)) {
        return targetValue.some((v) =>
          fieldValue.toLowerCase().includes(v.toLowerCase())
        );
      }
      return fieldValue.toLowerCase().includes(targetValue.toLowerCase());
    default:
      return false;
  }
}

export function evaluateRule(
  rule: ComplianceRule,
  profile: ModelProfile
): boolean {
  const results = rule.conditions.map((condition) =>
    evaluateCondition(condition, profile)
  );

  if (rule.conditionLogic === "AND") {
    return results.every((r) => r);
  }
  return results.some((r) => r);
}
