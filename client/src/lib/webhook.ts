import type { HIPAAComplianceReport } from "./hipaaReport";

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
  // TEMPORARY INSTRUMENTATION - REMOVE AFTER DEBUG
  console.log("🚨 WEBHOOK FUNCTION ENTERED");
  console.log("🚨 Webhook URL:", N8N_WEBHOOK_URL);
  console.log("🚨 Payload email:", payload.email);
  console.log("🚨 Payload format:", payload.format);
  alert("WEBHOOK FUNCTION CALLED - URL: " + N8N_WEBHOOK_URL);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log("🚨 Attempt", attempt + 1, "of", maxRetries + 1);
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("🚨 Webhook response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.log("🚨 Webhook error:", errorText);
        throw new Error(
          `Webhook returned ${response.status}: ${errorText}`
        );
      }

      // Success - return without error
      console.log("🚨 Webhook SUCCESS!");
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log("🚨 Webhook attempt failed:", lastError.message);

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
