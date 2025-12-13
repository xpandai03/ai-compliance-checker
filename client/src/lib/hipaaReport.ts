import type { HIPAAUseCaseProfile, VendorPHIMetadata, HIPAAFindings } from "./types";

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
        action = "Obtain Business Associate Agreements from all vendors processing PHI";
        priority = "high";
        break;
      case "hipaa_phi_baa_unknown":
        action = "Verify BAA status with all vendors and document findings";
        priority = "high";
        break;
      case "hipaa_phi_logging_retained":
        action = "Define and document data retention policies for PHI logs";
        priority = "high";
        break;
      case "hipaa_phi_unknown_logging":
        action = "Investigate and document logging behavior for PHI data";
        priority = "medium";
        break;
      case "hipaa_phi_no_access_controls":
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
        action = "Review vendor logging practices and ensure PHI protection";
        priority = "medium";
        break;
      case "hipaa_phi_unknown_involvement":
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

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let y = 20;

  const addText = (text: string, fontSize: number, fontStyle: "normal" | "bold" = "normal", color: [number, number, number] = [0, 0, 0]) => {
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

  const checkPageBreak = (requiredSpace: number) => {
    if (y + requiredSpace > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // =========================================================================
  // VISUAL HELPER: Risk Summary Bar
  // Draws a horizontal bar showing LOW | NEEDS_REVIEW | HIGH with marker
  // =========================================================================
  const drawRiskSummaryBar = (riskLevel: "HIGH" | "NEEDS_REVIEW" | "LOW") => {
    const barHeight = 8;
    const barWidth = contentWidth;
    const segmentWidth = barWidth / 3;

    // Draw the three segments with muted colors
    // LOW segment (left)
    doc.setFillColor(200, 220, 200); // Muted green
    doc.rect(marginLeft, y, segmentWidth, barHeight, "F");

    // NEEDS_REVIEW segment (middle)
    doc.setFillColor(220, 210, 180); // Muted amber
    doc.rect(marginLeft + segmentWidth, y, segmentWidth, barHeight, "F");

    // HIGH segment (right)
    doc.setFillColor(220, 190, 190); // Muted red
    doc.rect(marginLeft + segmentWidth * 2, y, segmentWidth, barHeight, "F");

    // Draw border around entire bar
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.3);
    doc.rect(marginLeft, y, barWidth, barHeight, "S");

    // Draw segment dividers
    doc.line(marginLeft + segmentWidth, y, marginLeft + segmentWidth, y + barHeight);
    doc.line(marginLeft + segmentWidth * 2, y, marginLeft + segmentWidth * 2, y + barHeight);

    // Calculate marker position based on risk level
    let markerX = marginLeft + segmentWidth / 2; // Default: LOW (center of first segment)
    if (riskLevel === "NEEDS_REVIEW") {
      markerX = marginLeft + segmentWidth * 1.5; // Center of middle segment
    } else if (riskLevel === "HIGH") {
      markerX = marginLeft + segmentWidth * 2.5; // Center of last segment
    }

    // Draw marker (inverted triangle pointing down) using lines
    const markerSize = 4;
    doc.setFillColor(40, 40, 40);
    // Draw filled triangle using polygon path
    const trianglePoints = [
      [markerX - markerSize, y - 1],
      [markerX + markerSize, y - 1],
      [markerX, y + 3]
    ];
    doc.setDrawColor(40, 40, 40);
    doc.lines(
      [
        [markerSize * 2, 0],      // right edge
        [-markerSize, 4],         // down to bottom point
        [-markerSize, -4]         // back to start
      ],
      markerX - markerSize,
      y - 1,
      [1, 1],
      "F"
    );

    // Add labels below the bar
    y += barHeight + 2;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("LOW", marginLeft + segmentWidth / 2, y + 3, { align: "center" });
    doc.text("NEEDS REVIEW", marginLeft + segmentWidth * 1.5, y + 3, { align: "center" });
    doc.text("HIGH", marginLeft + segmentWidth * 2.5, y + 3, { align: "center" });

    y += 8;
  };

  // =========================================================================
  // VISUAL HELPER: Findings Breakdown
  // Shows count of findings by severity level
  // =========================================================================
  const drawFindingsBreakdown = (triggeredSafeguards: HIPAAComplianceReport["triggered_safeguards"]) => {
    const highCount = triggeredSafeguards.filter(s => s.risk_level === "high").length;
    const needsReviewCount = triggeredSafeguards.filter(s => s.risk_level === "needs_review").length;
    const lowCount = triggeredSafeguards.filter(s => s.risk_level === "low").length;
    const total = triggeredSafeguards.length;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // HIGH findings
    doc.setFillColor(139, 0, 0);
    doc.rect(marginLeft, y, 3, 3, "F");
    doc.setTextColor(60, 60, 60);
    doc.text(`  HIGH RISK: ${highCount} finding${highCount !== 1 ? "s" : ""}`, marginLeft + 4, y + 2.5);
    y += 5;

    // NEEDS_REVIEW findings
    doc.setFillColor(180, 140, 60);
    doc.rect(marginLeft, y, 3, 3, "F");
    doc.text(`  NEEDS REVIEW: ${needsReviewCount} finding${needsReviewCount !== 1 ? "s" : ""}`, marginLeft + 4, y + 2.5);
    y += 5;

    // LOW findings
    doc.setFillColor(60, 140, 60);
    doc.rect(marginLeft, y, 3, 3, "F");
    doc.text(`  LOW RISK: ${lowCount} finding${lowCount !== 1 ? "s" : ""}`, marginLeft + 4, y + 2.5);
    y += 5;

    // Total
    doc.setDrawColor(150, 150, 150);
    doc.line(marginLeft, y, marginLeft + 60, y);
    y += 3;
    doc.setFont("helvetica", "bold");
    doc.text(`Total Safeguards Evaluated: ${total}`, marginLeft, y + 2);
    y += 6;
  };

  addText("HIPAA AI Risk Assessment Report", 18, "bold");
  addText("Deterministic, Rules-Based Analysis", 11, "normal", [100, 100, 100]);
  addSpacer(4);
  addText(`Report ID: ${report.report_id}`, 8, "normal", [100, 100, 100]);
  addText(`Generated: ${new Date(report.generated_at).toLocaleString()}`, 8, "normal", [100, 100, 100]);
  addSpacer(8);

  // =========================================================================
  // SECTION 1: Assessment Scope & Limitations
  // =========================================================================
  addText("1. Assessment Scope & Limitations", 14, "bold");
  addSpacer(4);

  addText("1.1 What This Assessment Covers", 11, "bold");
  for (const item of report.assessment_scope.what_this_covers) {
    checkPageBreak(12);
    addText(`• ${item}`, 9, "normal", [60, 60, 60]);
  }
  addSpacer(4);

  checkPageBreak(40);
  addText("1.2 What This Assessment Does Not Cover", 11, "bold");
  for (const item of report.assessment_scope.what_this_does_not_cover) {
    checkPageBreak(12);
    addText(`• ${item}`, 9, "normal", [60, 60, 60]);
  }
  addSpacer(4);

  checkPageBreak(40);
  addText("1.3 When to Re-Run This Assessment", 11, "bold");
  for (const item of report.assessment_scope.when_to_rerun) {
    checkPageBreak(12);
    addText(`• ${item}`, 9, "normal", [60, 60, 60]);
  }
  addSpacer(6);

  // =========================================================================
  // SECTION 2: How Compliance Teams Use This Report
  // =========================================================================
  checkPageBreak(50);
  addText("2. How Compliance Teams Typically Use This Report", 14, "bold");
  for (const item of report.assessment_scope.how_teams_use_this) {
    checkPageBreak(12);
    addText(`• ${item}`, 9, "normal", [60, 60, 60]);
  }
  addSpacer(6);

  // =========================================================================
  // SECTION 3: Executive Summary (with Risk Bar Visual)
  // =========================================================================
  checkPageBreak(70);
  addText("3. Executive Summary", 14, "bold");
  addSpacer(2);
  addText(`Use Case: ${report.executive_summary.use_case_name}`, 10);
  addSpacer(4);

  // Risk Classification with Visual Bar
  addText("Risk Classification:", 10, "bold");
  addSpacer(2);
  drawRiskSummaryBar(report.executive_summary.risk_classification);
  addSpacer(2);

  // Status badge
  const statusColor: [number, number, number] =
    report.executive_summary.status === "Non-Compliant" ? [139, 0, 0] :
    report.executive_summary.status === "Needs Manual Review" ? [180, 140, 60] : [60, 120, 60];
  addText(`Status: ${report.executive_summary.status}`, 10, "bold", statusColor);
  addSpacer(4);

  // Findings Breakdown Visual
  addText("Findings Summary:", 10, "bold");
  addSpacer(2);
  drawFindingsBreakdown(report.triggered_safeguards);

  addText(`Vendors Analyzed: ${report.executive_summary.vendor_count}`, 10);
  addSpacer(6);

  // =========================================================================
  // SECTION 4: AI Use Case Overview
  // =========================================================================
  checkPageBreak(40);
  addText("4. AI Use Case Overview", 14, "bold");
  addText(`Organization Type: ${report.use_case_overview.organization_type}`, 10);
  addText(`AI Function: ${report.use_case_overview.ai_function}`, 10);
  addText(`PHI Involved: ${formatBoolean(report.use_case_overview.phi_involved)}`, 10);
  if (report.use_case_overview.phi_types.length > 0) {
    addText(`PHI Types: ${report.use_case_overview.phi_types.join(", ")}`, 10);
  }
  addText(`Environment: ${report.use_case_overview.environment}`, 10);
  addText(`Input: ${report.use_case_overview.input_source}`, 10);
  addText(`Output: ${report.use_case_overview.output_destination}`, 10);
  addSpacer(6);

  // =========================================================================
  // SECTION 5: PHI Exposure Mapping
  // =========================================================================
  checkPageBreak(40);
  addText("5. PHI Exposure Mapping", 14, "bold");
  addText(`Logging Behavior: ${report.phi_exposure_mapping.logging_behavior}`, 10);
  addText(`Retention Defined: ${formatBoolean(report.phi_exposure_mapping.retention_period_defined)}`, 10);
  addText(`Access Controls Documented: ${formatBoolean(report.phi_exposure_mapping.access_controls_documented)}`, 10);
  addText(`Exposure Risk Level: ${report.phi_exposure_mapping.exposure_risk_level.toUpperCase()}`, 10, "bold");
  addSpacer(6);

  // =========================================================================
  // SECTION 6: Vendor & BAA Analysis
  // =========================================================================
  if (report.vendor_analysis.vendors.length > 0) {
    checkPageBreak(60);
    addText("6. Vendor & BAA Analysis", 14, "bold");
    addText(`Overall Vendor Risk: ${report.vendor_analysis.overall_vendor_risk.toUpperCase()}`, 10, "bold");
    addSpacer(3);
    
    for (const vendor of report.vendor_analysis.vendors) {
      checkPageBreak(25);
      addText(`${vendor.vendor_name} (${vendor.role})`, 10, "bold");
      addText(`  BAA: ${vendor.baa_status} | Storage: ${vendor.data_storage} | Logging: ${vendor.logging_enabled}`, 9, "normal", [60, 60, 60]);
      if (vendor.risk_factors.length > 0) {
        addText(`  Risk Factors: ${vendor.risk_factors.join(", ")}`, 9, "normal", [150, 60, 60]);
      }
    }
    addSpacer(6);
  }

  // =========================================================================
  // SECTION 7: Triggered HIPAA Safeguards
  // =========================================================================
  checkPageBreak(50);
  addText("7. Triggered HIPAA Safeguards", 14, "bold");
  if (report.triggered_safeguards.length === 0) {
    addText("No safeguard concerns identified.", 10, "normal", [60, 60, 60]);
  } else {
    for (const safeguard of report.triggered_safeguards) {
      checkPageBreak(25);
      const riskColor: [number, number, number] = 
        safeguard.risk_level === "high" ? [180, 60, 60] : 
        safeguard.risk_level === "needs_review" ? [180, 140, 60] : [60, 140, 60];
      addText(`[${safeguard.risk_level.toUpperCase()}] ${safeguard.description}`, 10, "bold", riskColor);
      addText(`  Category: ${safeguard.category}`, 9, "normal", [60, 60, 60]);
      addText(`  ${safeguard.explanation}`, 9, "normal", [80, 80, 80]);
    }
  }
  addSpacer(6);

  // =========================================================================
  // SECTION 8: Risk Classification
  // =========================================================================
  checkPageBreak(40);
  addText("8. Risk Classification", 14, "bold");
  addText(`Overall Risk: ${report.risk_classification.overall_risk}`, 11, "bold");
  addText(`Confidence Score: ${(report.risk_classification.confidence_score * 100).toFixed(0)}%`, 10);
  if (report.risk_classification.determining_factors.length > 0) {
    addText("Determining Factors:", 10, "bold");
    for (const factor of report.risk_classification.determining_factors) {
      checkPageBreak(10);
      addText(`  - ${factor}`, 9, "normal", [60, 60, 60]);
    }
  }
  addSpacer(6);

  // =========================================================================
  // SECTION 9: Remediation Checklist
  // =========================================================================
  if (report.remediation_checklist.length > 0) {
    checkPageBreak(50);
    addText("9. Remediation Checklist", 14, "bold");
    for (const item of report.remediation_checklist) {
      checkPageBreak(15);
      const priorityColor: [number, number, number] = 
        item.priority === "high" ? [180, 60, 60] : 
        item.priority === "medium" ? [180, 140, 60] : [60, 60, 60];
      addText(`[${item.priority.toUpperCase()}] ${item.action}`, 9, "normal", priorityColor);
    }
    addSpacer(6);
  }

  // =========================================================================
  // SECTION 10: Legal References
  // =========================================================================
  checkPageBreak(50);
  addText("10. Legal References", 14, "bold");
  for (const ref of report.legal_references.slice(0, 10)) {
    checkPageBreak(15);
    addText(`${ref.citation}`, 9, "bold");
    addText(`  ${ref.description}`, 9, "normal", [60, 60, 60]);
  }
  if (report.legal_references.length > 10) {
    addText(`  ...and ${report.legal_references.length - 10} more references`, 9, "normal", [100, 100, 100]);
  }
  addSpacer(8);

  // =========================================================================
  // SECTION 11: Disclaimers (Enhanced, prominent block)
  // =========================================================================
  checkPageBreak(80);
  addText("11. Important Disclaimers", 14, "bold");
  addSpacer(2);
  addText("PLEASE READ CAREFULLY:", 10, "bold", [139, 0, 0]);
  addSpacer(2);
  for (const disclaimer of report.disclaimers) {
    checkPageBreak(12);
    addText(`• ${disclaimer}`, 9, "normal", [60, 60, 60]);
  }
  addSpacer(8);

  // =========================================================================
  // FOOTER: Report Metadata
  // =========================================================================
  checkPageBreak(30);
  addText("─".repeat(60), 8, "normal", [180, 180, 180]);
  addSpacer(2);
  addText(`Tool Version: ${report.tool_version}`, 8, "normal", [120, 120, 120]);
  addText("This report was generated by a deterministic, rules-based assessment system.", 8, "normal", [120, 120, 120]);

  doc.save(filename);
}
