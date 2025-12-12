export type EuRefType = "Article" | "Annex" | "Recital";

export interface EuAiActTextEntry {
  ref: string;
  type: EuRefType;
  title: string;
  excerpt: string;
  source_url?: string;
  note?: string;
}

export const euAiActTextCorpus: Record<string, EuAiActTextEntry> = {
  "Article 2": {
    ref: "Article 2",
    type: "Article",
    title: "Scope",
    excerpt: `This Regulation applies to:
(a) providers placing on the market or putting into service AI systems in the Union, irrespective of whether those providers are established within the Union or in a third country;
(b) users of AI systems located within the Union;
(c) providers and users of AI systems that are located in a third country, where the output produced by the system is used in the Union.`,
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    note: "Excerpt only - not complete text. For reference purposes.",
  },

  "Article 13": {
    ref: "Article 13",
    type: "Article",
    title: "Transparency and provision of information to users",
    excerpt: `High-risk AI systems shall be designed and developed in such a way to ensure that their operation is sufficiently transparent to enable users to interpret the system's output and use it appropriately. An appropriate type and degree of transparency shall be ensured, with a view to achieving compliance with the relevant obligations of the provider and user set out in Chapter 3 of this Title.`,
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    note: "Excerpt only - not complete text. For reference purposes.",
  },

  "Article 14": {
    ref: "Article 14",
    type: "Article",
    title: "Human oversight",
    excerpt: `High-risk AI systems shall be designed and developed in such a way, including with appropriate human-machine interface tools, that they can be effectively overseen by natural persons during the period in which the AI system is in use. Human oversight shall aim at preventing or minimising the risks to health, safety or fundamental rights that may emerge when a high-risk AI system is used in accordance with its intended purpose or under conditions of reasonably foreseeable misuse.`,
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    note: "Excerpt only - not complete text. For reference purposes.",
  },

  "Article 28b": {
    ref: "Article 28b",
    type: "Article",
    title: "Obligations of deployers of high-risk AI systems",
    excerpt: `Deployers of high-risk AI systems shall:
(a) take appropriate technical and organisational measures to ensure they use such systems in accordance with the instructions of use accompanying the systems;
(b) assign human oversight to natural persons who have the necessary competence, training and authority, as well as the necessary support;
(c) to the extent they exercise control over the input data, ensure that input data is relevant in view of the intended purpose of the high-risk AI system.`,
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    note: "Excerpt only - not complete text. For reference purposes.",
  },

  "Article 29": {
    ref: "Article 29",
    type: "Article",
    title: "Obligations of users of high-risk AI systems",
    excerpt: `Users of high-risk AI systems shall use such systems in accordance with the instructions of use accompanying the systems. The obligations set out in paragraph 1 are without prejudice to other user obligations under Union or national law and to the user's discretion in organising its own resources and activities for the purpose of implementing the human oversight measures indicated by the provider.`,
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    note: "Excerpt only - not complete text. For reference purposes.",
  },

  "Article 52": {
    ref: "Article 52",
    type: "Article",
    title: "Transparency obligations for certain AI systems",
    excerpt: `Providers shall ensure that AI systems intended to interact with natural persons are designed and developed in such a way that natural persons are informed that they are interacting with an AI system, unless this is obvious from the circumstances and the context of use. This obligation shall not apply to AI systems authorised by law to detect, prevent, investigate and prosecute criminal offences.`,
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    note: "Excerpt only - not complete text. For reference purposes.",
  },

  "Annex III": {
    ref: "Annex III",
    type: "Annex",
    title: "High-Risk AI Systems (List)",
    excerpt: `High-risk AI systems pursuant to Article 6(2) are the AI systems listed in any of the following areas:
1. Biometric identification and categorisation of natural persons
2. Management and operation of critical infrastructure
3. Education and vocational training
4. Employment, workers management and access to self-employment
5. Access to and enjoyment of essential private services and public services and benefits
6. Law enforcement
7. Migration, asylum and border control management
8. Administration of justice and democratic processes`,
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    note: "Excerpt only - not complete text. For reference purposes.",
  },

  "Annex VIII": {
    ref: "Annex VIII",
    type: "Annex",
    title: "Information to be submitted upon registration of high-risk AI systems",
    excerpt: `The following information shall be provided and thereafter kept up to date with regard to high-risk AI systems to be registered:
1. Name, address and contact details of the provider
2. Where submission of information is carried out by another person on behalf of the provider, the name, address and contact details of that person
3. Name, address and contact details of the authorised representative, where applicable
4. AI system trade name and any additional unambiguous reference allowing identification and traceability of the AI system`,
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    note: "Excerpt only - not complete text. For reference purposes.",
  },

  "Recital 47": {
    ref: "Recital 47",
    type: "Recital",
    title: "High-risk classification criteria",
    excerpt: `AI systems providing access to or used for evaluating eligibility for essential private or public services and benefits, including healthcare, social security and essential financial services, may pose significant risks for the fundamental rights of natural persons. Such AI systems should therefore be classified as high-risk.`,
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    note: "Excerpt only - not complete text. For reference purposes.",
  },

  "Recital 48": {
    ref: "Recital 48",
    type: "Recital",
    title: "Employment and worker management",
    excerpt: `AI systems used in employment, workers management and access to self-employment, notably for the recruitment and selection of persons, for making decisions on promotion and termination and for task allocation, monitoring or evaluation of persons in work-related contractual relationships, should also be classified as high-risk, since those systems may appreciably impact future career prospects and livelihoods of those persons.`,
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    note: "Excerpt only - not complete text. For reference purposes.",
  },

  "Recital 70": {
    ref: "Recital 70",
    type: "Recital",
    title: "Transparency for AI-generated content",
    excerpt: `Certain AI systems intended for interaction with natural persons or to generate content may pose specific risks of impersonation or deception irrespective of whether they qualify as high-risk or not. The use of these systems should therefore be subject to specific transparency obligations.`,
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    note: "Excerpt only - not complete text. For reference purposes.",
  },
};

export function getTextEntry(ref: string): EuAiActTextEntry | null {
  return euAiActTextCorpus[ref] || null;
}

export function getAllTextRefs(): string[] {
  return Object.keys(euAiActTextCorpus);
}
