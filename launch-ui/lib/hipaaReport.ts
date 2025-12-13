// HIPAA Report Generator (copied from kernel - do not modify)
import type { HIPAAUseCaseProfile, VendorPHIMetadata, HIPAAFindings } from "./hipaaTypes";

export interface HIPAAComplianceReport {
  report_id: string;
  generated_at: string;
  tool_version: string;

  // Assessment scope sections - static copy, no logic dependency
  assessment_scope: {
    what_this_covers: string[];
    what_this_does_not_cover: string[];
    when_to_rerun: string[];
    how_teams_use_this: string[];
  };

  executive_summary: {
    use_case_name: string;
    risk_classification: "HIGH" | "NEEDS_REVIEW" | "LOW";
    status: string;
    key_findings_count: number;
    vendor_count: number;
  };

  use_case_overview: {
    organization_type: string;
    ai_function: string;
    phi_involved: boolean | "unknown";
    phi_types: string[];
    input_source: string;
    output_destination: string;
    environment: string;
  };

  phi_exposure_mapping: {
    logging_behavior: string;
    retention_period_defined: boolean | "unknown";
    access_controls_documented: boolean | "unknown";
    exposure_risk_level: "high" | "medium" | "low";
  };

  vendor_analysis: {
    vendors: {
      vendor_name: string;
      role: string;
      baa_status: string;
      data_storage: string;
      logging_enabled: string;
      access_controls: string;
      risk_factors: string[];
    }[];
    overall_vendor_risk: "high" | "medium" | "low";
  };

  triggered_safeguards: {
    safeguard_id: string;
    description: string;
    category: string;
    risk_level: string;
    citations: string[];
    explanation: string;
  }[];

  risk_classification: {
    overall_risk: "HIGH" | "NEEDS_REVIEW" | "LOW";
    confidence_score: number;
    determining_factors: string[];
  };

  remediation_checklist: {
    action: string;
    priority: "high" | "medium" | "low";
    related_rule_id: string;
  }[];

  legal_references: {
    citation: string;
    description: string;
  }[];

  disclaimers: string[];
}

const TOOL_VERSION = "v0.3-demo";

// =============================================================================
// PDF CONFIGURATION - Layout constants for professional report formatting
// =============================================================================
const PDF_CONFIG = {
  format: "a4" as const,
  orientation: "portrait" as const,
  unit: "mm" as const,
  margins: { top: 20, bottom: 25, left: 20, right: 20 },
  pageWidth: 210,
  pageHeight: 297,
  contentWidth: 170, // 210 - 20 - 20
  safeBottom: 272,   // 297 - 25 for footer
  footerY: 285,
};

// ASCII-safe symbols for Helvetica font compatibility
const SYMBOLS = {
  confirmed: "[Y]",
  unknown: "[?]",
  missing: "[X]",
  high_risk: "(!!)",
  medium_risk: "(!)",
  low_risk: "(-)",
  bullet: "•",
};

// Color palette (RGB) - grayscale-safe
const COLORS = {
  high: [139, 0, 0] as [number, number, number],
  needs_review: [180, 140, 60] as [number, number, number],
  low: [60, 140, 60] as [number, number, number],
  primary_text: [40, 40, 40] as [number, number, number],
  secondary_text: [80, 80, 80] as [number, number, number],
  muted_text: [100, 100, 100] as [number, number, number],
  light_text: [120, 120, 120] as [number, number, number],
  border: [150, 150, 150] as [number, number, number],
  table_header_bg: [240, 240, 240] as [number, number, number],
  divider: [180, 180, 180] as [number, number, number],
  // Muted segment colors for risk bar
  low_segment: [200, 220, 200] as [number, number, number],
  needs_review_segment: [220, 210, 180] as [number, number, number],
  high_segment: [220, 190, 190] as [number, number, number],
};

// =============================================================================
// ASSESSMENT SCOPE COPY - Static, enterprise-grade content
// These sections contain NO logic, NO conditionals, NO findings references
// =============================================================================

const ASSESSMENT_SCOPE_COPY = {
  what_this_covers: [
    "This assessment evaluates a specific AI use case against selected requirements of the HIPAA Security Rule (45 CFR Part 164, Subpart C), with particular focus on:",
    "Administrative Safeguards related to third-party vendor relationships and Business Associate Agreement (BAA) requirements.",
    "Technical Safeguards concerning audit controls, access controls, and logging practices for systems that may process Protected Health Information (PHI).",
    "Organizational Requirements for documenting data handling practices, retention policies, and access control mechanisms.",
    "This assessment operates at the USE CASE level. It evaluates the specific AI deployment described in the intake form based on the information provided.",
    "All findings are derived from deterministic rule evaluation against user-supplied inputs. No inference, prediction, or AI-based reasoning is used in the assessment logic.",
  ],
  what_this_does_not_cover: [
    "HIPAA Privacy Rule compliance (45 CFR Part 164, Subpart E) beyond BAA-related provisions.",
    "Workforce training, sanctions policies, or personnel security measures.",
    "Physical safeguards (facility access controls, workstation security, device and media controls).",
    "Breach notification policies and procedures (45 CFR §164.400-414).",
    "State-specific health privacy laws or other regulatory frameworks.",
    "Organization-wide HIPAA compliance posture — this assessment is scoped to a single AI use case.",
    "Legal sufficiency of existing Business Associate Agreements.",
    "Technical penetration testing or vulnerability assessment.",
    "This report does not constitute: legal advice or legal opinion, HIPAA certification or attestation, regulatory approval or clearance, or audit by a qualified independent assessor.",
  ],
  when_to_rerun: [
    "VENDOR CHANGES: New AI vendor relationships are established, existing vendor BAA status changes, or vendor data handling practices are modified.",
    "LOGGING & DATA HANDLING CHANGES: Logging configuration is enabled, disabled, or modified; data retention policies are updated; new PHI data types are introduced to the use case.",
    "ENVIRONMENT CHANGES: Use case moves from development/staging to production, infrastructure hosting the AI system changes, or access control mechanisms are modified.",
    "ORGANIZATIONAL CHANGES: Organization's HIPAA classification changes, or merger/acquisition/restructuring affects use case ownership.",
    "MATERIAL ARCHITECTURE CHANGES: AI model provider changes, data flow architecture is modified, or new integrations that affect PHI handling are added.",
    "Re-assessment frequency: At minimum, consider annual re-assessment even absent the triggers above, as part of standard compliance review cycles.",
  ],
  how_teams_use_this: [
    "INTERNAL RISK REVIEW: Identifying potential HIPAA compliance gaps before production deployment, prioritizing remediation activities based on risk severity, documenting risk acceptance decisions with supporting rationale.",
    "VENDOR DUE DILIGENCE: Evaluating AI vendor relationships against BAA requirements, identifying vendors requiring BAA execution or review, supporting vendor risk assessment workflows.",
    "AUDIT PREPARATION: Providing documentation of compliance considerations for internal audits, supporting evidence collection for external assessments, demonstrating due diligence in AI deployment decisions.",
    "GOVERNANCE DOCUMENTATION: Maintaining records of compliance evaluations for AI use cases, supporting AI governance program documentation requirements, providing input for risk register updates.",
    "DECISION SUPPORT: Informing go/no-go decisions for AI deployments involving PHI, identifying conditions or controls required before deployment approval, supporting exception request justifications.",
    "This report is intended to supplement—not replace—comprehensive HIPAA compliance programs, qualified legal counsel, and independent assessments.",
  ],
};

// =============================================================================
// DISCLAIMERS - Enhanced with conservative, legally defensive language
// =============================================================================

const HIPAA_DISCLAIMERS = [
  // Core disclaimers (original)
  "This report is generated by a deterministic rules-based system.",
  "This report does not constitute legal advice and should not be relied upon as such.",
  "Regulatory references are provided for traceability only.",
  "This assessment does not certify HIPAA compliance or non-compliance.",
  "Organizations should consult qualified legal and compliance professionals for HIPAA guidance.",
  "This tool assesses risk based on user-provided inputs; accuracy depends on input completeness.",
  // Enhanced disclaimers (additive)
  "This assessment is scoped to a single AI use case and does not evaluate organization-wide HIPAA compliance posture.",
  "Findings reflect the state of inputs at the time of assessment; changes to vendors, configurations, or data flows may invalidate conclusions.",
  "This tool does not perform technical security testing, penetration testing, or vulnerability assessment.",
  "Business Associate Agreement (BAA) status is based on user attestation and has not been independently verified.",
  "This report is intended as a compliance planning aid and should be reviewed by qualified personnel before use in regulatory submissions.",
  "The absence of findings does not guarantee HIPAA compliance; comprehensive compliance requires controls beyond the scope of this assessment.",
];

const HIPAA_CITATION_DESCRIPTIONS: Record<string, string> = {
  "45 CFR §164.308(b)(1)": "Business Associate Contracts and Other Arrangements",
  "45 CFR §164.502(e)": "Uses and Disclosures by Business Associates",
  "45 CFR §164.504(e)": "Business Associate Contract Requirements",
  "45 CFR §164.530(j)": "Documentation and Retention Requirements",
  "45 CFR §164.502(b)": "Minimum Necessary Standard",
  "45 CFR §164.312(b)": "Audit Controls",
  "45 CFR §164.308(a)(1)(ii)(D)": "Information System Activity Review",
  "45 CFR §164.312(a)(1)": "Access Control",
  "45 CFR §164.312(d)": "Person or Entity Authentication",
  "45 CFR §164.308(a)(4)": "Information Access Management",
  "45 CFR §160.103": "Definitions (Covered Entity, Business Associate)",
  "45 CFR §164.502": "Uses and Disclosures of PHI",
  "45 CFR §164.500": "Applicability",
  "45 CFR §164.504(e)(2)": "Business Associate Contract Implementation",
  "45 CFR §164.312(e)(1)": "Transmission Security",
  "45 CFR §164.530(c)": "Safeguards",
  "45 CFR §164.514": "Other Requirements Relating to Uses and Disclosures of PHI",
  "45 CFR §164.502(d)": "De-identification of PHI",
  "45 CFR §164.514(d)": "Minimum Necessary Requirements",
  "45 CFR §164.308": "Administrative Safeguards",
  "45 CFR §164.312": "Technical Safeguards",
  "45 CFR §164.308(b)(3)": "Written Contract or Other Arrangement",
  "45 CFR §164.308(a)(1)(ii)(A)": "Risk Analysis",
  "45 CFR §164.312(c)(1)": "Integrity Controls",
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function mapRiskClassification(classification: string): "HIGH" | "NEEDS_REVIEW" | "LOW" {
  switch (classification) {
    case "High Risk":
      return "HIGH";
    case "Needs Review":
      return "NEEDS_REVIEW";
    case "Low Risk":
      return "LOW";
    default:
      return "NEEDS_REVIEW";
  }
}

function formatBoolean(value: boolean | "unknown"): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Unknown";
}

function calculateExposureRisk(profile: HIPAAUseCaseProfile): "high" | "medium" | "low" {
  if (profile.phi_involved !== true) return "low";

  const riskFactors = [
    profile.logging_behavior === "retained" && profile.retention_period_defined !== true,
    profile.logging_behavior === "unknown",
    profile.access_controls_documented !== true,
    profile.environment === "prod",
  ].filter(Boolean).length;

  if (riskFactors >= 2) return "high";
  if (riskFactors >= 1) return "medium";
  return "low";
}

function calculateVendorRisk(vendors: VendorPHIMetadata[]): "high" | "medium" | "low" {
  if (vendors.length === 0) return "low";

  const hasNoBaa = vendors.some(v => v.baa_available === false);
  const hasUnknownBaa = vendors.some(v => v.baa_available === "unknown");
  const storesData = vendors.some(v => v.data_storage === "stored");

  if (hasNoBaa) return "high";
  if (hasUnknownBaa && storesData) return "high";
  if (hasUnknownBaa) return "medium";
  return "low";
}

function generateRemediationChecklist(findings: HIPAAFindings): HIPAAComplianceReport["remediation_checklist"] {
  const checklist: HIPAAComplianceReport["remediation_checklist"] = [];

  for (const rule of findings.triggeredRules) {
    if (rule.riskContribution === "low") continue;

    let action = "";
    let priority: "high" | "medium" | "low" = "medium";

    switch (rule.id) {
      case "hipaa_phi_no_baa":
      case "RULE_HIPAA_003":
        action = "Obtain Business Associate Agreements from all vendors processing PHI";
        priority = "high";
        break;
      case "hipaa_phi_baa_unknown":
        action = "Verify BAA status with all vendors and document findings";
        priority = "high";
        break;
      case "hipaa_phi_logging_retained":
      case "RULE_HIPAA_004":
        action = "Define and document data retention policies for PHI logs";
        priority = "high";
        break;
      case "hipaa_phi_unknown_logging":
      case "RULE_HIPAA_005":
        action = "Investigate and document logging behavior for PHI data";
        priority = "medium";
        break;
      case "hipaa_phi_no_access_controls":
      case "RULE_HIPAA_007":
        action = "Implement and document access controls for PHI systems";
        priority = "high";
        break;
      case "hipaa_phi_unknown_access_controls":
        action = "Review and document existing access control mechanisms";
        priority = "medium";
        break;
      case "hipaa_phi_prod_unknown_org":
        action = "Determine organization HIPAA classification (covered entity or business associate)";
        priority = "high";
        break;
      case "hipaa_vendor_stores_phi":
        action = "Verify vendor access controls for stored PHI data";
        priority = "medium";
        break;
      case "hipaa_vendor_logs_phi":
      case "RULE_HIPAA_011":
        action = "Review vendor logging practices and ensure PHI protection";
        priority = "medium";
        break;
      case "hipaa_phi_unknown_involvement":
      case "RULE_HIPAA_001":
        action = "Perform data classification to determine PHI involvement";
        priority = "high";
        break;
      case "hipaa_neither_entity_with_phi":
        action = "Review organization classification - processing PHI typically creates HIPAA obligations";
        priority = "high";
        break;
      case "hipaa_phi_multiple_vendors":
        action = "Audit all vendor relationships and ensure BAA coverage for each";
        priority = "medium";
        break;
      case "hipaa_phi_audio_transcription":
        action = "Implement additional safeguards for audio PHI processing";
        priority = "medium";
        break;
      case "hipaa_phi_free_text_chat":
        action = "Implement data handling controls for unstructured PHI in chat systems";
        priority = "medium";
        break;
      case "RULE_HIPAA_002":
        action = "Document all AI vendors that will process PHI";
        priority = "medium";
        break;
      case "RULE_HIPAA_006":
        action = "Define and document data retention period for PHI";
        priority = "medium";
        break;
      case "RULE_HIPAA_008":
        action = "Resolve inconsistency between PHI flag and PHI types selection";
        priority = "medium";
        break;
      case "RULE_HIPAA_012":
        action = "Resolve inconsistency between logging configuration and vendor logging settings";
        priority = "medium";
        break;
      default:
        action = `Address compliance gap: ${rule.description}`;
        priority = rule.riskContribution === "high" ? "high" : "medium";
    }

    checklist.push({
      action,
      priority,
      related_rule_id: rule.id,
    });
  }

  return checklist.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function generateHIPAAComplianceReport(
  profile: HIPAAUseCaseProfile,
  vendors: VendorPHIMetadata[],
  findings: HIPAAFindings
): HIPAAComplianceReport {
  const riskClassification = mapRiskClassification(findings.riskClassification);

  const determiningFactors = findings.triggeredRules
    .filter(r => r.riskContribution !== "low")
    .map(r => r.description);

  const uniqueCitations = Array.from(new Set(findings.triggeredRules.flatMap(r => r.citations)));

  const legalReferences = uniqueCitations.map(citation => ({
    citation,
    description: HIPAA_CITATION_DESCRIPTIONS[citation] || "HIPAA Security/Privacy Rule Reference",
  }));

  return {
    report_id: generateUUID(),
    generated_at: new Date().toISOString(),
    tool_version: TOOL_VERSION,

    // Assessment scope - static copy, no logic dependency
    assessment_scope: {
      what_this_covers: ASSESSMENT_SCOPE_COPY.what_this_covers,
      what_this_does_not_cover: ASSESSMENT_SCOPE_COPY.what_this_does_not_cover,
      when_to_rerun: ASSESSMENT_SCOPE_COPY.when_to_rerun,
      how_teams_use_this: ASSESSMENT_SCOPE_COPY.how_teams_use_this,
    },

    executive_summary: {
      use_case_name: profile.use_case_name,
      risk_classification: riskClassification,
      status: findings.statusFlag,
      key_findings_count: findings.triggeredRules.filter(r => r.riskContribution !== "low").length,
      vendor_count: vendors.length,
    },

    use_case_overview: {
      organization_type: profile.organization_type,
      ai_function: profile.ai_function,
      phi_involved: profile.phi_involved,
      phi_types: profile.phi_types,
      input_source: profile.input_source,
      output_destination: profile.output_destination,
      environment: profile.environment,
    },

    phi_exposure_mapping: {
      logging_behavior: profile.logging_behavior,
      retention_period_defined: profile.retention_period_defined,
      access_controls_documented: profile.access_controls_documented,
      exposure_risk_level: calculateExposureRisk(profile),
    },

    vendor_analysis: {
      vendors: vendors.map(v => {
        const vendorFindings = findings.vendorAnalysis.find(va => va.vendor_name === v.vendor_name);
        return {
          vendor_name: v.vendor_name,
          role: profile.vendors_used.find(vu => vu.vendor_name === v.vendor_name)?.role || "Unknown",
          baa_status: formatBoolean(v.baa_available),
          data_storage: v.data_storage,
          logging_enabled: formatBoolean(v.logging_enabled),
          access_controls: formatBoolean(v.access_controls_documented),
          risk_factors: vendorFindings?.risk_factors || [],
        };
      }),
      overall_vendor_risk: calculateVendorRisk(vendors),
    },

    triggered_safeguards: findings.triggeredRules.map(rule => ({
      safeguard_id: rule.id,
      description: rule.description,
      category: rule.safeguard_category,
      risk_level: rule.riskContribution,
      citations: rule.citations,
      explanation: rule.explanation,
    })),

    risk_classification: {
      overall_risk: riskClassification,
      confidence_score: findings.confidenceScore,
      determining_factors: determiningFactors,
    },

    remediation_checklist: generateRemediationChecklist(findings),

    legal_references: legalReferences,

    disclaimers: HIPAA_DISCLAIMERS,
  };
}

export function exportHIPAAReportAsJSON(report: HIPAAComplianceReport, useCaseName: string): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const sanitizedName = useCaseName.replace(/[^a-zA-Z0-9-_]/g, "_");
  const filename = `hipaa-risk-assessment_${sanitizedName}_${timestamp}.json`;

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportHIPAAReportAsPDF(report: HIPAAComplianceReport, useCaseName: string): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const sanitizedName = useCaseName.replace(/[^a-zA-Z0-9-_]/g, "_");
  const filename = `hipaa-risk-assessment_${sanitizedName}_${timestamp}.pdf`;

  const doc = new jsPDF({
    orientation: PDF_CONFIG.orientation,
    unit: PDF_CONFIG.unit,
    format: PDF_CONFIG.format
  });

  const marginLeft = PDF_CONFIG.margins.left;
  const contentWidth = PDF_CONFIG.contentWidth;
  let y = PDF_CONFIG.margins.top;
  let currentPage = 1;

  // =========================================================================
  // CORE HELPER FUNCTIONS
  // =========================================================================

  const addText = (text: string, fontSize: number, fontStyle: "normal" | "bold" = "normal", color: [number, number, number] = COLORS.primary_text) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, marginLeft, y);
    y += lines.length * (fontSize * 0.4) + 2;
  };

  const addSpacer = (height: number) => {
    y += height;
  };

  const checkPageBreak = (requiredSpace: number): boolean => {
    if (y + requiredSpace > PDF_CONFIG.safeBottom) {
      addPageFooter();
      doc.addPage();
      currentPage++;
      y = PDF_CONFIG.margins.top;
      return true;
    }
    return false;
  };

  const startNewPage = () => {
    addPageFooter();
    doc.addPage();
    currentPage++;
    y = PDF_CONFIG.margins.top;
  };

  const addPageFooter = () => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.light_text);
    doc.text(`Page ${currentPage}`, PDF_CONFIG.pageWidth / 2, PDF_CONFIG.footerY, { align: "center" });
    doc.text(report.report_id.slice(0, 8), marginLeft, PDF_CONFIG.footerY);
    doc.text("HIPAA AI Risk Assessment", PDF_CONFIG.pageWidth - marginLeft, PDF_CONFIG.footerY, { align: "right" });
  };

  // =========================================================================
  // VISUAL HELPER: Draw Cover Page
  // =========================================================================
  const drawCoverPage = () => {
    // Centered title block
    y = 60;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted_text);
    doc.text("DETERMINISTIC, RULES-BASED ANALYSIS", PDF_CONFIG.pageWidth / 2, y, { align: "center" });

    y += 8;
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary_text);
    doc.text("HIPAA AI", PDF_CONFIG.pageWidth / 2, y, { align: "center" });

    y += 12;
    doc.text("RISK ASSESSMENT", PDF_CONFIG.pageWidth / 2, y, { align: "center" });

    y += 8;
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.secondary_text);
    doc.text("Use Case Report", PDF_CONFIG.pageWidth / 2, y, { align: "center" });

    // Metadata box
    y = 110;
    const boxX = marginLeft + 20;
    const boxWidth = contentWidth - 40;
    const boxHeight = 50;

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.rect(boxX, y, boxWidth, boxHeight, "S");

    y += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.secondary_text);

    const labelX = boxX + 10;
    const valueX = boxX + 50;

    doc.text("USE CASE:", labelX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.primary_text);
    const useCaseLines = doc.splitTextToSize(report.executive_summary.use_case_name || "Unnamed", boxWidth - 60);
    doc.text(useCaseLines[0], valueX, y);

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.secondary_text);
    doc.text("ORGANIZATION:", labelX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.primary_text);
    doc.text(report.use_case_overview.organization_type.replace(/_/g, " ").toUpperCase(), valueX, y);

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.secondary_text);
    doc.text("ENVIRONMENT:", labelX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.primary_text);
    doc.text(report.use_case_overview.environment.toUpperCase(), valueX, y);

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.secondary_text);
    doc.text("DATE:", labelX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.primary_text);
    doc.text(new Date(report.generated_at).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
    }), valueX, y);

    // Tool info line
    y = 175;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted_text);
    doc.text(`Tool Version: ${report.tool_version}`, PDF_CONFIG.pageWidth / 2 - 30, y);

    // Beta badge
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(PDF_CONFIG.pageWidth / 2 + 20, y - 4, 20, 6, 1, 1, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.secondary_text);
    doc.text("BETA", PDF_CONFIG.pageWidth / 2 + 30, y, { align: "center" });

    y += 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.light_text);
    doc.text(`Report ID: ${report.report_id}`, PDF_CONFIG.pageWidth / 2, y, { align: "center" });

    // Disclaimer box at bottom
    y = 210;
    const disclaimerBoxX = marginLeft + 15;
    const disclaimerBoxWidth = contentWidth - 30;
    const disclaimerBoxHeight = 35;

    doc.setDrawColor(...COLORS.high);
    doc.setLineWidth(0.3);
    doc.rect(disclaimerBoxX, y, disclaimerBoxWidth, disclaimerBoxHeight, "S");

    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.high);
    doc.text("IMPORTANT NOTICE", PDF_CONFIG.pageWidth / 2, y, { align: "center" });

    y += 7;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.secondary_text);
    const disclaimerText = "This report is generated by a deterministic, rules-based system. It does not constitute legal advice, HIPAA certification, or compliance attestation. See Section 10 for complete disclaimers.";
    const disclaimerLines = doc.splitTextToSize(disclaimerText, disclaimerBoxWidth - 10);
    doc.text(disclaimerLines, PDF_CONFIG.pageWidth / 2, y, { align: "center", maxWidth: disclaimerBoxWidth - 10 });

    // Page number for cover
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.light_text);
    doc.text(`Page ${currentPage}`, PDF_CONFIG.pageWidth / 2, PDF_CONFIG.footerY, { align: "center" });
  };

  // =========================================================================
  // VISUAL HELPER: Risk Summary Bar (with box border)
  // =========================================================================
  const drawRiskSummaryBar = (riskLevel: "HIGH" | "NEEDS_REVIEW" | "LOW") => {
    const barY = y;
    const barHeight = 8;
    const barWidth = contentWidth;
    const segmentWidth = barWidth / 3;

    // Outer box border
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.rect(marginLeft - 2, barY - 8, barWidth + 4, barHeight + 18, "S");

    // Draw the three segments with muted colors
    doc.setFillColor(...COLORS.low_segment);
    doc.rect(marginLeft, barY, segmentWidth, barHeight, "F");

    doc.setFillColor(...COLORS.needs_review_segment);
    doc.rect(marginLeft + segmentWidth, barY, segmentWidth, barHeight, "F");

    doc.setFillColor(...COLORS.high_segment);
    doc.rect(marginLeft + segmentWidth * 2, barY, segmentWidth, barHeight, "F");

    // Inner bar border
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.3);
    doc.rect(marginLeft, barY, barWidth, barHeight, "S");

    // Segment dividers
    doc.line(marginLeft + segmentWidth, barY, marginLeft + segmentWidth, barY + barHeight);
    doc.line(marginLeft + segmentWidth * 2, barY, marginLeft + segmentWidth * 2, barY + barHeight);

    // Marker position
    let markerX = marginLeft + segmentWidth / 2;
    if (riskLevel === "NEEDS_REVIEW") {
      markerX = marginLeft + segmentWidth * 1.5;
    } else if (riskLevel === "HIGH") {
      markerX = marginLeft + segmentWidth * 2.5;
    }

    // Draw marker triangle
    const markerSize = 4;
    doc.setFillColor(40, 40, 40);
    doc.setDrawColor(40, 40, 40);
    doc.lines(
      [[markerSize * 2, 0], [-markerSize, 4], [-markerSize, -4]],
      markerX - markerSize, barY - 1, [1, 1], "F"
    );

    // Labels
    y = barY + barHeight + 2;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.secondary_text);
    doc.text("LOW", marginLeft + segmentWidth / 2, y + 3, { align: "center" });
    doc.text("NEEDS REVIEW", marginLeft + segmentWidth * 1.5, y + 3, { align: "center" });
    doc.text("HIGH", marginLeft + segmentWidth * 2.5, y + 3, { align: "center" });

    y += 12;
  };

  // =========================================================================
  // VISUAL HELPER: Findings Breakdown (with box border)
  // =========================================================================
  const drawFindingsBreakdown = (triggeredSafeguards: HIPAAComplianceReport["triggered_safeguards"]) => {
    const highCount = triggeredSafeguards.filter(s => s.risk_level === "high").length;
    const needsReviewCount = triggeredSafeguards.filter(s => s.risk_level === "needs_review").length;
    const lowCount = triggeredSafeguards.filter(s => s.risk_level === "low").length;
    const total = triggeredSafeguards.length;

    const boxStartY = y;
    const boxHeight = 32;

    // Box border
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.rect(marginLeft - 2, boxStartY, 85, boxHeight, "S");

    y += 4;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // HIGH
    doc.setFillColor(...COLORS.high);
    doc.rect(marginLeft + 2, y, 3, 3, "F");
    doc.setTextColor(...COLORS.secondary_text);
    doc.text(`HIGH RISK: ${highCount} finding${highCount !== 1 ? "s" : ""}`, marginLeft + 8, y + 2.5);
    y += 6;

    // NEEDS_REVIEW
    doc.setFillColor(...COLORS.needs_review);
    doc.rect(marginLeft + 2, y, 3, 3, "F");
    doc.text(`NEEDS REVIEW: ${needsReviewCount} finding${needsReviewCount !== 1 ? "s" : ""}`, marginLeft + 8, y + 2.5);
    y += 6;

    // LOW
    doc.setFillColor(...COLORS.low);
    doc.rect(marginLeft + 2, y, 3, 3, "F");
    doc.text(`LOW RISK: ${lowCount} finding${lowCount !== 1 ? "s" : ""}`, marginLeft + 8, y + 2.5);
    y += 5;

    // Divider and total
    doc.setDrawColor(...COLORS.border);
    doc.line(marginLeft + 2, y, marginLeft + 80, y);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text(`Total Evaluated: ${total}`, marginLeft + 2, y);
    y += 8;
  };

  // =========================================================================
  // VISUAL HELPER: PHI Exposure Indicator Table
  // =========================================================================
  const drawPHIExposureTable = () => {
    const tableY = y;
    const rowHeight = 8;
    const colWidths = [55, 45, 50];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);

    // Header row
    doc.setFillColor(...COLORS.table_header_bg);
    doc.rect(marginLeft, tableY, tableWidth, rowHeight, "F");
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.rect(marginLeft, tableY, tableWidth, rowHeight, "S");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary_text);
    doc.text("FACTOR", marginLeft + 3, tableY + 5.5);
    doc.text("VALUE", marginLeft + colWidths[0] + 3, tableY + 5.5);
    doc.text("INDICATOR", marginLeft + colWidths[0] + colWidths[1] + 3, tableY + 5.5);

    // Column dividers
    doc.line(marginLeft + colWidths[0], tableY, marginLeft + colWidths[0], tableY + rowHeight);
    doc.line(marginLeft + colWidths[0] + colWidths[1], tableY, marginLeft + colWidths[0] + colWidths[1], tableY + rowHeight);

    y = tableY + rowHeight;

    // Helper to get indicator
    const getIndicator = (factor: string, value: string | boolean | "unknown"): { text: string; color: [number, number, number] } => {
      if (factor === "logging" && value === "retained") return { text: SYMBOLS.high_risk + " ELEVATED", color: COLORS.high };
      if (factor === "logging" && value === "unknown") return { text: SYMBOLS.medium_risk + " CONCERN", color: COLORS.needs_review };
      if (factor === "logging") return { text: SYMBOLS.low_risk + " OK", color: COLORS.low };

      if (value === false) return { text: SYMBOLS.high_risk + " ELEVATED", color: COLORS.high };
      if (value === "unknown") return { text: SYMBOLS.medium_risk + " CONCERN", color: COLORS.needs_review };
      if (value === true) return { text: SYMBOLS.low_risk + " OK", color: COLORS.low };

      return { text: SYMBOLS.unknown + " UNKNOWN", color: COLORS.muted_text };
    };

    // Data rows
    const rows = [
      { factor: "Logging Behavior", value: report.phi_exposure_mapping.logging_behavior, type: "logging" },
      { factor: "Retention Defined", value: report.phi_exposure_mapping.retention_period_defined, type: "bool" },
      { factor: "Access Controls", value: report.phi_exposure_mapping.access_controls_documented, type: "bool" },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    for (const row of rows) {
      doc.rect(marginLeft, y, tableWidth, rowHeight, "S");
      doc.line(marginLeft + colWidths[0], y, marginLeft + colWidths[0], y + rowHeight);
      doc.line(marginLeft + colWidths[0] + colWidths[1], y, marginLeft + colWidths[0] + colWidths[1], y + rowHeight);

      doc.setTextColor(...COLORS.secondary_text);
      doc.text(row.factor, marginLeft + 3, y + 5.5);

      const displayValue = typeof row.value === "boolean" ? (row.value ? "Yes" : "No") : String(row.value).toUpperCase();
      doc.text(displayValue, marginLeft + colWidths[0] + 3, y + 5.5);

      const indicator = getIndicator(row.type, row.value);
      doc.setTextColor(...indicator.color);
      doc.text(indicator.text, marginLeft + colWidths[0] + colWidths[1] + 3, y + 5.5);

      y += rowHeight;
    }

    // Overall risk footer
    doc.setFillColor(...COLORS.table_header_bg);
    doc.rect(marginLeft, y, tableWidth, rowHeight, "F");
    doc.rect(marginLeft, y, tableWidth, rowHeight, "S");

    doc.setFont("helvetica", "bold");
    const overallRiskColor = report.phi_exposure_mapping.exposure_risk_level === "high" ? COLORS.high :
                             report.phi_exposure_mapping.exposure_risk_level === "medium" ? COLORS.needs_review : COLORS.low;
    doc.setTextColor(...overallRiskColor);
    doc.text(`OVERALL EXPOSURE RISK: ${report.phi_exposure_mapping.exposure_risk_level.toUpperCase()}`, marginLeft + 3, y + 5.5);

    y += rowHeight + 6;
  };

  // =========================================================================
  // VISUAL HELPER: Vendor Table
  // =========================================================================
  const drawVendorTable = () => {
    if (report.vendor_analysis.vendors.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.secondary_text);
      doc.text("No vendors configured for this use case.", marginLeft, y);
      y += 8;
      return;
    }

    const tableY = y;
    const rowHeight = 8;
    const colWidths = [45, 25, 35, 30, 35];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);

    // Header
    doc.setFillColor(...COLORS.table_header_bg);
    doc.rect(marginLeft, tableY, tableWidth, rowHeight, "F");
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.rect(marginLeft, tableY, tableWidth, rowHeight, "S");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary_text);

    let colX = marginLeft;
    const headers = ["VENDOR", "BAA", "STORAGE", "LOGGING", "RISK"];
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], colX + 2, tableY + 5.5);
      if (i < headers.length - 1) {
        doc.line(colX + colWidths[i], tableY, colX + colWidths[i], tableY + rowHeight);
      }
      colX += colWidths[i];
    }

    y = tableY + rowHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    for (const vendor of report.vendor_analysis.vendors) {
      // Check if high risk - tint row
      const hasHighRisk = vendor.baa_status === "No" || vendor.risk_factors.length > 1;
      if (hasHighRisk) {
        doc.setFillColor(255, 245, 245);
        doc.rect(marginLeft, y, tableWidth, rowHeight, "F");
      }

      doc.setDrawColor(...COLORS.border);
      doc.rect(marginLeft, y, tableWidth, rowHeight, "S");

      colX = marginLeft;

      // Vendor name (truncate if needed)
      doc.setTextColor(...COLORS.primary_text);
      const vName = vendor.vendor_name.length > 12 ? vendor.vendor_name.slice(0, 10) + ".." : vendor.vendor_name;
      doc.text(vName, colX + 2, y + 5.5);
      doc.line(colX + colWidths[0], y, colX + colWidths[0], y + rowHeight);
      colX += colWidths[0];

      // BAA
      const baaSymbol = vendor.baa_status === "Yes" ? SYMBOLS.confirmed :
                        vendor.baa_status === "Unknown" ? SYMBOLS.unknown : SYMBOLS.missing;
      const baaColor = vendor.baa_status === "Yes" ? COLORS.low :
                       vendor.baa_status === "Unknown" ? COLORS.needs_review : COLORS.high;
      doc.setTextColor(...baaColor);
      doc.text(baaSymbol, colX + 2, y + 5.5);
      doc.line(colX + colWidths[1], y, colX + colWidths[1], y + rowHeight);
      colX += colWidths[1];

      // Storage
      doc.setTextColor(...COLORS.secondary_text);
      const storageShort = vendor.data_storage === "stored" ? "Stored" :
                           vendor.data_storage === "transient" ? "Transient" :
                           vendor.data_storage === "none" ? "None" : "Unknown";
      doc.text(storageShort, colX + 2, y + 5.5);
      doc.line(colX + colWidths[2], y, colX + colWidths[2], y + rowHeight);
      colX += colWidths[2];

      // Logging
      doc.text(vendor.logging_enabled, colX + 2, y + 5.5);
      doc.line(colX + colWidths[3], y, colX + colWidths[3], y + rowHeight);
      colX += colWidths[3];

      // Risk indicator
      const riskSymbol = vendor.risk_factors.length > 1 ? SYMBOLS.high_risk :
                         vendor.risk_factors.length === 1 ? SYMBOLS.medium_risk : SYMBOLS.low_risk;
      const riskColor = vendor.risk_factors.length > 1 ? COLORS.high :
                        vendor.risk_factors.length === 1 ? COLORS.needs_review : COLORS.low;
      const riskLabel = vendor.risk_factors.length > 1 ? "HIGH" :
                        vendor.risk_factors.length === 1 ? "MEDIUM" : "LOW";
      doc.setTextColor(...riskColor);
      doc.text(`${riskSymbol} ${riskLabel}`, colX + 2, y + 5.5);

      y += rowHeight;
    }

    // Overall vendor risk footer
    doc.setFillColor(...COLORS.table_header_bg);
    doc.rect(marginLeft, y, tableWidth, rowHeight, "F");
    doc.rect(marginLeft, y, tableWidth, rowHeight, "S");

    doc.setFont("helvetica", "bold");
    const overallColor = report.vendor_analysis.overall_vendor_risk === "high" ? COLORS.high :
                         report.vendor_analysis.overall_vendor_risk === "medium" ? COLORS.needs_review : COLORS.low;
    doc.setTextColor(...overallColor);
    doc.text(`OVERALL VENDOR RISK: ${report.vendor_analysis.overall_vendor_risk.toUpperCase()}`, marginLeft + 2, y + 5.5);

    y += rowHeight + 6;
  };

  // =========================================================================
  // VISUAL HELPER: Remediation Table
  // =========================================================================
  const drawRemediationTable = () => {
    if (report.remediation_checklist.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.secondary_text);
      doc.text("No remediation items identified.", marginLeft, y);
      y += 8;
      return;
    }

    const rowHeight = 10;
    const colWidths = [22, 120, 28];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);

    // Header
    doc.setFillColor(...COLORS.table_header_bg);
    doc.rect(marginLeft, y, tableWidth, rowHeight - 2, "F");
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.rect(marginLeft, y, tableWidth, rowHeight - 2, "S");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary_text);
    doc.text("PRIORITY", marginLeft + 2, y + 5.5);
    doc.line(marginLeft + colWidths[0], y, marginLeft + colWidths[0], y + rowHeight - 2);
    doc.text("ACTION", marginLeft + colWidths[0] + 2, y + 5.5);
    doc.line(marginLeft + colWidths[0] + colWidths[1], y, marginLeft + colWidths[0] + colWidths[1], y + rowHeight - 2);
    doc.text("RULE", marginLeft + colWidths[0] + colWidths[1] + 2, y + 5.5);

    y += rowHeight - 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    for (const item of report.remediation_checklist) {
      checkPageBreak(rowHeight + 2);

      // Tint high priority rows
      if (item.priority === "high") {
        doc.setFillColor(255, 245, 245);
        doc.rect(marginLeft, y, tableWidth, rowHeight, "F");
      }

      doc.setDrawColor(...COLORS.border);
      doc.rect(marginLeft, y, tableWidth, rowHeight, "S");
      doc.line(marginLeft + colWidths[0], y, marginLeft + colWidths[0], y + rowHeight);
      doc.line(marginLeft + colWidths[0] + colWidths[1], y, marginLeft + colWidths[0] + colWidths[1], y + rowHeight);

      // Priority
      const prioColor = item.priority === "high" ? COLORS.high :
                        item.priority === "medium" ? COLORS.needs_review : COLORS.secondary_text;
      doc.setTextColor(...prioColor);
      doc.setFont("helvetica", "bold");
      doc.text(item.priority.toUpperCase(), marginLeft + 2, y + 6.5);

      // Action (wrap text)
      doc.setTextColor(...COLORS.secondary_text);
      doc.setFont("helvetica", "normal");
      const actionLines = doc.splitTextToSize(item.action, colWidths[1] - 4);
      doc.text(actionLines[0], marginLeft + colWidths[0] + 2, y + 6.5);

      // Rule ID
      doc.setTextColor(...COLORS.muted_text);
      const ruleShort = item.related_rule_id.replace("RULE_HIPAA_", "R");
      doc.text(ruleShort, marginLeft + colWidths[0] + colWidths[1] + 2, y + 6.5);

      y += rowHeight;
    }
    y += 4;
  };

  // =========================================================================
  // VISUAL HELPER: Disclaimer Box
  // =========================================================================
  const drawDisclaimerBox = () => {
    // Box header
    doc.setDrawColor(...COLORS.high);
    doc.setLineWidth(0.5);
    doc.setFillColor(255, 250, 250);
    doc.rect(marginLeft, y, contentWidth, 12, "FD");

    y += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.high);
    doc.text("IMPORTANT DISCLAIMERS", PDF_CONFIG.pageWidth / 2, y, { align: "center" });

    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.high);
    doc.text("PLEASE READ BEFORE RELYING ON THIS REPORT", marginLeft, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.secondary_text);

    for (const disclaimer of report.disclaimers) {
      checkPageBreak(10);
      const lines = doc.splitTextToSize(`${SYMBOLS.bullet} ${disclaimer}`, contentWidth - 4);
      doc.text(lines, marginLeft + 2, y);
      y += lines.length * 4 + 2;
    }
  };

  // =========================================================================
  // PAGE 1: COVER PAGE
  // =========================================================================
  drawCoverPage();

  // =========================================================================
  // PAGE 2: EXECUTIVE SUMMARY
  // =========================================================================
  startNewPage();
  addText("2. Executive Summary", 14, "bold");
  addSpacer(2);
  addText(`Use Case: ${report.executive_summary.use_case_name}`, 10);
  addSpacer(6);

  addText("Risk Classification:", 10, "bold");
  addSpacer(4);
  drawRiskSummaryBar(report.executive_summary.risk_classification);
  addSpacer(4);

  const statusColor: [number, number, number] =
    report.executive_summary.status === "Non-Compliant" ? COLORS.high :
    report.executive_summary.status === "Needs Manual Review" ? COLORS.needs_review : COLORS.low;
  addText(`Status: ${report.executive_summary.status}`, 10, "bold", statusColor);
  addSpacer(6);

  addText("Findings Summary:", 10, "bold");
  addSpacer(2);
  drawFindingsBreakdown(report.triggered_safeguards);
  addSpacer(4);

  addText(`Vendors Analyzed: ${report.executive_summary.vendor_count}`, 10);
  addText(`Confidence Score: ${(report.risk_classification.confidence_score * 100).toFixed(0)}%`, 10);
  addSpacer(6);

  if (report.risk_classification.determining_factors.length > 0) {
    addText("Key Determining Factors:", 10, "bold");
    for (const factor of report.risk_classification.determining_factors.slice(0, 5)) {
      addText(`  ${SYMBOLS.bullet} ${factor}`, 9, "normal", COLORS.secondary_text);
    }
  }

  // =========================================================================
  // PAGE 3: ASSESSMENT SCOPE
  // =========================================================================
  startNewPage();
  addText("3. Assessment Scope & Limitations", 14, "bold");
  addSpacer(4);

  addText("3.1 What This Assessment Covers", 11, "bold");
  for (const item of report.assessment_scope.what_this_covers) {
    checkPageBreak(12);
    addText(`${SYMBOLS.bullet} ${item}`, 9, "normal", COLORS.secondary_text);
  }
  addSpacer(4);

  checkPageBreak(40);
  addText("3.2 What This Assessment Does Not Cover", 11, "bold");
  for (const item of report.assessment_scope.what_this_does_not_cover) {
    checkPageBreak(12);
    addText(`${SYMBOLS.bullet} ${item}`, 9, "normal", COLORS.secondary_text);
  }
  addSpacer(4);

  checkPageBreak(40);
  addText("3.3 When to Re-Run This Assessment", 11, "bold");
  for (const item of report.assessment_scope.when_to_rerun) {
    checkPageBreak(12);
    addText(`${SYMBOLS.bullet} ${item}`, 9, "normal", COLORS.secondary_text);
  }

  // =========================================================================
  // PAGE 4: HOW TEAMS USE THIS REPORT
  // =========================================================================
  startNewPage();
  addText("4. How Compliance Teams Use This Report", 14, "bold");
  addSpacer(4);
  for (const item of report.assessment_scope.how_teams_use_this) {
    checkPageBreak(12);
    addText(`${SYMBOLS.bullet} ${item}`, 9, "normal", COLORS.secondary_text);
  }

  // =========================================================================
  // PAGE 5: AI USE CASE PROFILE
  // =========================================================================
  startNewPage();
  addText("5. AI Use Case Profile", 14, "bold");
  addSpacer(4);

  // Organization & Deployment table
  addText("Organization & Deployment:", 10, "bold");
  addSpacer(2);
  addText(`  Organization Type: ${report.use_case_overview.organization_type.replace(/_/g, " ")}`, 9, "normal", COLORS.secondary_text);
  addText(`  Environment: ${report.use_case_overview.environment}`, 9, "normal", COLORS.secondary_text);
  addText(`  AI Function: ${report.use_case_overview.ai_function}`, 9, "normal", COLORS.secondary_text);
  addSpacer(4);

  addText("Data Flow:", 10, "bold");
  addSpacer(2);
  addText(`  Input Source: ${report.use_case_overview.input_source}`, 9, "normal", COLORS.secondary_text);
  addText(`  Output Destination: ${report.use_case_overview.output_destination}`, 9, "normal", COLORS.secondary_text);
  addText(`  PHI Involved: ${formatBoolean(report.use_case_overview.phi_involved)}`, 9, "normal", COLORS.secondary_text);
  if (report.use_case_overview.phi_types.length > 0 && report.use_case_overview.phi_types[0]) {
    addText(`  PHI Types: ${report.use_case_overview.phi_types.filter(t => t).join(", ")}`, 9, "normal", COLORS.secondary_text);
  }

  // =========================================================================
  // PAGE 6: PHI EXPOSURE ANALYSIS
  // =========================================================================
  startNewPage();
  addText("6. PHI Exposure Analysis", 14, "bold");
  addSpacer(4);
  drawPHIExposureTable();

  // =========================================================================
  // PAGE 7: VENDOR & BAA ANALYSIS
  // =========================================================================
  startNewPage();
  addText("7. Vendor & BAA Analysis", 14, "bold");
  addSpacer(4);
  drawVendorTable();

  // Vendor risk factors detail
  if (report.vendor_analysis.vendors.some(v => v.risk_factors.length > 0)) {
    addSpacer(4);
    addText("Vendor Risk Factor Details:", 10, "bold");
    for (const vendor of report.vendor_analysis.vendors.filter(v => v.risk_factors.length > 0)) {
      checkPageBreak(15);
      addText(`  ${vendor.vendor_name}:`, 9, "bold", COLORS.secondary_text);
      for (const rf of vendor.risk_factors) {
        addText(`    ${SYMBOLS.bullet} ${rf}`, 8, "normal", COLORS.high);
      }
    }
  }

  // =========================================================================
  // PAGE 8: TRIGGERED SAFEGUARDS
  // =========================================================================
  startNewPage();
  addText("8. Triggered HIPAA Safeguards", 14, "bold");
  addSpacer(4);

  if (report.triggered_safeguards.length === 0) {
    addText("No safeguard concerns identified.", 10, "normal", COLORS.secondary_text);
  } else {
    // Group by category
    const categories = [...new Set(report.triggered_safeguards.map(s => s.category))];

    for (const category of categories) {
      checkPageBreak(30);
      addText(category, 11, "bold");
      addSpacer(2);

      const safeguardsInCategory = report.triggered_safeguards.filter(s => s.category === category);
      for (const safeguard of safeguardsInCategory) {
        checkPageBreak(20);
        const riskColor: [number, number, number] =
          safeguard.risk_level === "high" ? COLORS.high :
          safeguard.risk_level === "needs_review" ? COLORS.needs_review : COLORS.low;

        addText(`[${safeguard.risk_level.toUpperCase()}] ${safeguard.description}`, 9, "bold", riskColor);
        addText(`  ${safeguard.explanation}`, 8, "normal", COLORS.secondary_text);
        addSpacer(2);
      }
      addSpacer(4);
    }
  }

  // =========================================================================
  // PAGE 9: REMEDIATION CHECKLIST
  // =========================================================================
  startNewPage();
  addText("9. Remediation Checklist", 14, "bold");
  addSpacer(4);
  drawRemediationTable();

  // =========================================================================
  // PAGE 10: LEGAL REFERENCES & DISCLAIMERS
  // =========================================================================
  startNewPage();
  addText("10. Legal References", 14, "bold");
  addSpacer(4);

  for (const ref of report.legal_references.slice(0, 15)) {
    checkPageBreak(12);
    addText(`${ref.citation}`, 9, "bold");
    addText(`  ${ref.description}`, 8, "normal", COLORS.secondary_text);
  }
  if (report.legal_references.length > 15) {
    addText(`  ...and ${report.legal_references.length - 15} additional references`, 8, "normal", COLORS.muted_text);
  }

  addSpacer(10);
  checkPageBreak(100);
  drawDisclaimerBox();

  // =========================================================================
  // FINAL FOOTER
  // =========================================================================
  addSpacer(8);
  doc.setDrawColor(...COLORS.divider);
  doc.line(marginLeft, y, marginLeft + contentWidth, y);
  addSpacer(4);
  addText(`Tool Version: ${report.tool_version}`, 8, "normal", COLORS.light_text);
  addText("This report was generated by a deterministic, rules-based assessment system.", 8, "normal", COLORS.light_text);
  addText("No AI inference was used in the assessment logic.", 8, "normal", COLORS.light_text);

  // Final page footer
  addPageFooter();

  doc.save(filename);
}
