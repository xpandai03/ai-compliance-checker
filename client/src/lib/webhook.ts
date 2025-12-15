import type { HIPAAComplianceReport } from "./hipaaReport";
import type { ComplianceReport } from "./report";

const N8N_WEBHOOK_URL = "https://n8n-familyconnection.agentglu.agency/webhook/hipaa-assessment-lead";

/**
 * Payload sent to n8n webhook for email delivery.
 * Contains lead info, assessment summary, and the report file (PDF or JSON).
 */
export interface HIPAAWebhookPayload {
  // Lead information
  email: string;
  company_name?: string;
  submitted_at: string;

  // Report format
  format: "pdf" | "json";

  // Assessment metadata
  assessment_id: string;
  use_case_name: string;
  organization_type: string;
  ai_function: string;

  // Risk overview
  risk_classification: "HIGH" | "NEEDS_REVIEW" | "LOW";
  confidence_score: number;
  status_flag: string;
  findings_count: number;

  // Triggered safeguards summary (not full explanations)
  triggered_safeguards: {
    id: string;
    description: string;
    risk_level: string;
    category: string;
  }[];

  // Vendor risk summary
  vendor_count: number;
  vendors_missing_baa: number;
  vendor_names: string[];

  // Remediation highlights (top 3 high-priority actions)
  high_priority_actions: string[];
  total_remediation_items: number;

  // The report file as base64
  attachment: {
    base64: string;
    filename: string;
    mimeType: string;
  };
}

/**
 * Builds the webhook payload from report data and user email.
 */
export function buildWebhookPayload(
  report: HIPAAComplianceReport,
  email: string,
  companyName: string | undefined,
  format: "pdf" | "json",
  attachment: { base64: string; filename: string; mimeType: string }
): HIPAAWebhookPayload {
  // Count vendors without BAA
  const vendorsMissingBaa = report.vendor_analysis.vendors.filter(
    (v) => v.baa_status === "No" || v.baa_status === "Unknown"
  ).length;

  // Get top 3 high-priority remediation actions
  const highPriorityActions = report.remediation_checklist
    .filter((item) => item.priority === "high")
    .slice(0, 3)
    .map((item) => item.action);

  return {
    // Lead info
    email,
    company_name: companyName,
    submitted_at: new Date().toISOString(),

    // Format
    format,

    // Assessment metadata
    assessment_id: report.report_id,
    use_case_name: report.executive_summary.use_case_name,
    organization_type: report.use_case_overview.organization_type,
    ai_function: report.use_case_overview.ai_function,

    // Risk overview
    risk_classification: report.risk_classification.overall_risk,
    confidence_score: report.risk_classification.confidence_score,
    status_flag: report.executive_summary.status,
    findings_count: report.triggered_safeguards.filter(
      (s) => s.risk_level !== "low"
    ).length,

    // Safeguards summary (without full explanations)
    triggered_safeguards: report.triggered_safeguards.map((s) => ({
      id: s.safeguard_id,
      description: s.description,
      risk_level: s.risk_level,
      category: s.category,
    })),

    // Vendor summary
    vendor_count: report.vendor_analysis.vendors.length,
    vendors_missing_baa: vendorsMissingBaa,
    vendor_names: report.vendor_analysis.vendors.map((v) => v.vendor_name),

    // Remediation highlights
    high_priority_actions: highPriorityActions,
    total_remediation_items: report.remediation_checklist.length,

    // Attachment
    attachment,
  };
}

/**
 * Sends the HIPAA report to n8n webhook for email delivery.
 * Includes automatic retry logic for transient failures.
 */
export async function sendHIPAAReportToWebhook(
  payload: HIPAAWebhookPayload,
  maxRetries: number = 2
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Webhook returned ${response.status}: ${errorText}`
        );
      }

      // Success
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt, throw
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff: 1s, 2s)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error("Unknown error occurred");
}

// ============================================================================
// EU AI Act Report Webhook
// ============================================================================

/**
 * Payload sent to n8n webhook for EU AI Act report email delivery.
 */
export interface EUAIActWebhookPayload {
  // Lead information
  email: string;
  company_name?: string;
  submitted_at: string;

  // Report format and type
  format: "pdf" | "json";
  report_type: "eu_ai_act";

  // Assessment metadata
  assessment_id: string;
  model_name: string;
  provider: string;
  use_case: string;
  user_type: string;

  // Risk overview
  risk_classification: "HIGH" | "LIMITED" | "MINIMAL" | "NEEDS_REVIEW";
  confidence_score: number;
  findings_count: number;

  // Triggered rules summary
  triggered_rules: {
    rule_id: string;
    description: string;
    risk_level: string;
  }[];

  // Regulatory references
  regulatory_references: {
    ref: string;
    title: string;
  }[];

  // The report file as base64
  attachment: {
    base64: string;
    filename: string;
    mimeType: string;
  };
}

/**
 * Builds the EU AI Act webhook payload from report data and user email.
 */
export function buildEUAIActWebhookPayload(
  report: ComplianceReport,
  email: string,
  companyName: string | undefined,
  format: "pdf" | "json",
  attachment: { base64: string; filename: string; mimeType: string }
): EUAIActWebhookPayload {
  return {
    // Lead info
    email,
    company_name: companyName,
    submitted_at: new Date().toISOString(),

    // Format and type
    format,
    report_type: "eu_ai_act",

    // Assessment metadata
    assessment_id: report.report_id,
    model_name: report.model_profile.model_name,
    provider: report.model_profile.provider,
    use_case: report.model_profile.use_case,
    user_type: report.model_profile.user_type,

    // Risk overview
    risk_classification: report.risk_assessment.classification,
    confidence_score: report.risk_assessment.confidence_score,
    findings_count: report.risk_assessment.triggered_rules.length,

    // Triggered rules
    triggered_rules: report.risk_assessment.triggered_rules.map((rule) => ({
      rule_id: rule.rule_id,
      description: rule.description,
      risk_level: rule.risk_level,
    })),

    // Regulatory references (top 5 for payload size)
    regulatory_references: report.regulatory_grounding.references.slice(0, 5).map((ref) => ({
      ref: ref.ref,
      title: ref.title,
    })),

    // Attachment
    attachment,
  };
}

/**
 * Sends the EU AI Act report to n8n webhook for email delivery.
 * Uses the same webhook endpoint as HIPAA (n8n can distinguish by report_type).
 */
export async function sendEUAIActReportToWebhook(
  payload: EUAIActWebhookPayload,
  maxRetries: number = 2
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Webhook returned ${response.status}: ${errorText}`
        );
      }

      // Success
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff: 1s, 2s)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }

  throw lastError || new Error("Unknown error occurred");
}
