export interface ModelProfile {
  modelName: string;
  provider: "OpenAI" | "Anthropic" | "Open Source" | "Custom";
  useCase: string;
  userType: "General Public" | "Internal" | "Enterprise";
}

export interface ComplianceFindings {
  riskClassification: "High Risk" | "Limited Risk" | "Minimal Risk";
  confidenceScore: number;
  applicableRegulation: string;
  relevantArticles: string[];
  statusFlag: "Needs Manual Review" | "Compliant" | "Non-Compliant";
}

export interface ExplainabilityQuestion {
  id: string;
  question: string;
  answer: string;
  citations: string[];
}

export const MOCK_FINDINGS: ComplianceFindings = {
  riskClassification: "High Risk",
  confidenceScore: 0.78,
  applicableRegulation: "EU AI Act",
  relevantArticles: ["Article 6", "Article 9", "Article 10"],
  statusFlag: "Needs Manual Review",
};

export const MOCK_QUESTIONS: ExplainabilityQuestion[] = [
  {
    id: "1",
    question: "Why is this classified as high risk?",
    answer:
      "Based on the deployment context of a customer support chatbot serving the General Public, this system falls under the category of AI systems that interact directly with natural persons in ways that may significantly affect their rights or access to services. The combination of public-facing deployment and autonomous decision-making capabilities triggers the high-risk classification threshold under the EU AI Act framework.",
    citations: ["EU AI Act, Article 6(1)", "EU AI Act, Annex III, Section 5"],
  },
  {
    id: "2",
    question: "Why does Article 6 apply?",
    answer:
      "Article 6 applies because this AI system is designed to be used as a safety component or is itself a product covered by Union harmonisation legislation. Customer support chatbots that can make recommendations, process personal data, or influence consumer decisions are explicitly included in the scope of Article 6 when deployed at scale to the general public.",
    citations: ["EU AI Act, Article 6(2)", "EU AI Act, Article 6(3)(a)"],
  },
  {
    id: "3",
    question: "What factors contributed to this classification?",
    answer:
      "Several key factors contributed to the high-risk classification: (1) The intended use case involves direct interaction with consumers, (2) The model provider (OpenAI) uses foundation models that require additional transparency obligations, (3) The General Public user type indicates broad deployment scope with potential societal impact, and (4) Customer support contexts often involve processing of personal data and automated decision-making.",
    citations: [
      "EU AI Act, Article 9",
      "EU AI Act, Article 10(2)",
      "GDPR Article 22",
    ],
  },
];

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
