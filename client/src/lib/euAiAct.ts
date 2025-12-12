export interface EuAiActArticle {
  title: string;
  summary: string;
}

export const EU_AI_ACT_ARTICLES: Record<string, EuAiActArticle> = {
  "Article 6": {
    title: "Classification of high-risk AI systems",
    summary:
      "Defines criteria under which AI systems are classified as high-risk, including intended purpose and deployment context."
  },
  "Article 13": {
    title: "Transparency and provision of information to deployers",
    summary:
      "Requires providers to ensure high-risk AI systems are designed to enable deployers to interpret outputs and use systems appropriately."
  },
  "Article 14": {
    title: "Human oversight",
    summary:
      "Requires high-risk AI systems to be designed to allow effective human oversight during their period of use."
  },
  "Article 28b": {
    title: "Obligations for providers of general-purpose AI models",
    summary:
      "Defines obligations applicable to providers of general-purpose and foundation AI models, including documentation and transparency requirements."
  },
  "Article 29": {
    title: "Obligations of deployers of high-risk AI systems",
    summary:
      "Sets out obligations for deployers including human oversight, monitoring, and appropriate use of high-risk AI systems."
  },
  "Article 52": {
    title: "Transparency obligations for certain AI systems",
    summary:
      "Requires transparency obligations for AI systems that interact with humans or generate synthetic content."
  },
  "Article 53": {
    title: "Obligations for providers of general-purpose AI models",
    summary:
      "Establishes technical documentation and information sharing requirements for general-purpose AI model providers."
  },
  "Recital 48": {
    title: "Internal deployment considerations",
    summary:
      "Provides context for assessing AI systems deployed for internal organizational use with appropriate safeguards."
  },
  "Recital 70": {
    title: "Public-facing AI system considerations",
    summary:
      "Provides context for heightened scrutiny of AI systems that directly interact with natural persons."
  },
  "Recital 102": {
    title: "Open-source AI considerations",
    summary:
      "Addresses specific considerations and potential exemptions for open-source AI models under certain conditions."
  },
  "Annex VIII": {
    title: "Documentation requirements for general-purpose AI",
    summary:
      "Specifies documentation requirements for providers of general-purpose AI models."
  }
};

export function getArticleDetails(articleRef: string): EuAiActArticle | null {
  return EU_AI_ACT_ARTICLES[articleRef] || null;
}

export function getArticlesFromRefs(refs: string[]): { article: string; details: EuAiActArticle }[] {
  return refs
    .map(ref => ({
      article: ref,
      details: EU_AI_ACT_ARTICLES[ref]
    }))
    .filter(item => item.details !== undefined) as { article: string; details: EuAiActArticle }[];
}
