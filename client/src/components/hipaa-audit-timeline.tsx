import { useState } from "react";
import { FileText, Scale, ShieldAlert, BookOpen, HelpCircle, Info, CheckCircle2, ChevronDown, ChevronRight, Download, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AuditStepCard from "./audit-step-card";
import EmailCaptureModal, { type ExportFormat } from "./email-capture-modal";
import type { HIPAAUseCaseProfile, VendorPHIMetadata, HIPAAFindings } from "@/lib/types";
import type { AuditPhase } from "@/pages/home";
import {
  generateHIPAAComplianceReport,
  generateHIPAAReportPDFBase64,
  generateHIPAAReportJSONBase64,
} from "@/lib/hipaaReport";
import { buildWebhookPayload, sendHIPAAReportToWebhook } from "@/lib/webhook";

interface HIPAAAuditTimelineProps {
  profile: HIPAAUseCaseProfile;
  vendors: VendorPHIMetadata[];
  findings: HIPAAFindings;
  auditPhase: AuditPhase;
}

const phaseOrder: AuditPhase[] = ["profile", "metadata", "rules", "classification", "mapping", "done"];

function isPhaseAtLeast(current: AuditPhase, target: AuditPhase): boolean {
  return phaseOrder.indexOf(current) >= phaseOrder.indexOf(target);
}

function formatBoolean(value: boolean | "unknown"): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Unknown";
}

interface VendorAnalysisCardProps {
  vendor: HIPAAFindings["vendorAnalysis"][0];
}

function VendorAnalysisCard({ vendor }: VendorAnalysisCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const baaVariant = vendor.has_baa === true ? "default" : vendor.has_baa === false ? "destructive" : "secondary";
  const baaLabel = vendor.has_baa === true ? "BAA Confirmed" : vendor.has_baa === false ? "No BAA" : "BAA Unknown";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border rounded-md overflow-visible">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover-elevate active-elevate-2" data-testid={`vendor-trigger-${vendor.vendor_name}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{vendor.vendor_name}</span>
            <Badge variant={baaVariant} className="text-xs">
              {baaLabel}
            </Badge>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
            {vendor.risk_factors.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-foreground mb-1">Risk Factors</p>
                <ul className="space-y-1">
                  {vendor.risk_factors.map((factor, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5" data-testid={`text-risk-factor-${idx}`}>
                      <span className="text-destructive mt-0.5">-</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No significant risk factors identified.</p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function HIPAAAuditTimeline({ profile, vendors, findings, auditPhase }: HIPAAAuditTimelineProps) {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");

  const handleExportClick = (format: ExportFormat) => {
    console.log("🔥 PDF DOWNLOAD BUTTON CLICKED");
    alert("PDF DOWNLOAD BUTTON CLICKED - format: " + format);
    setExportFormat(format);
    setEmailModalOpen(true);
  };

  const handleEmailSubmit = async (email: string, companyName?: string) => {
    console.log("🔥 HIPAA TIMELINE: handleEmailSubmit CALLED");
    console.log("🔥 Email:", email, "Company:", companyName);

    // Generate the report
    const report = generateHIPAAComplianceReport(profile, vendors, findings);
    console.log("🔥 Report generated, ID:", report.report_id);

    // Generate the file as base64
    let attachment: { base64: string; filename: string; mimeType: string };
    if (exportFormat === "pdf") {
      attachment = await generateHIPAAReportPDFBase64(report);
    } else {
      attachment = generateHIPAAReportJSONBase64(report);
    }
    console.log("🔥 Attachment generated, filename:", attachment.filename);

    // Build and send the webhook payload
    const payload = buildWebhookPayload(
      report,
      email,
      companyName,
      exportFormat,
      attachment
    );
    console.log("🔥 Payload built, calling sendHIPAAReportToWebhook...");

    await sendHIPAAReportToWebhook(payload);
    console.log("🔥 Webhook call completed successfully");
  };

  const getRiskBadgeVariant = (risk: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (risk) {
      case "High Risk":
        return "destructive";
      case "Needs Review":
        return "secondary";
      case "Low Risk":
        return "default";
      default:
        return "outline";
    }
  };

  const totalRules = 15;
  const triggeredCount = findings.triggeredRules.length;
  const showRuleResults = isPhaseAtLeast(auditPhase, "rules");

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 p-4 rounded-md border border-border bg-muted/30">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              HIPAA risk assessment completed deterministically.
            </p>
            <p className="text-sm text-muted-foreground">
              This timeline shows how the result was derived.
            </p>
          </div>
        </div>
        {auditPhase === "done" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 shrink-0" data-testid="button-download-hipaa-report">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportClick("pdf")} data-testid="menu-download-hipaa-pdf">
                <FileText className="w-4 h-4 mr-2" />
                Download as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportClick("json")} data-testid="menu-download-hipaa-json">
                <FileText className="w-4 h-4 mr-2" />
                Download as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="space-y-3">
        {isPhaseAtLeast(auditPhase, "profile") && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AuditStepCard
              stepNumber={1}
              title="Use Case Profile Created"
              icon={<FileText className="w-4 h-4" />}
            >
              <div className="space-y-1">
                <p><span className="text-foreground font-medium">Use Case:</span> {profile.use_case_name}</p>
                <p><span className="text-foreground font-medium">Organization Type:</span> {profile.organization_type}</p>
                <p><span className="text-foreground font-medium">AI Function:</span> {profile.ai_function}</p>
                <p><span className="text-foreground font-medium">PHI Involved:</span> {formatBoolean(profile.phi_involved)}</p>
                {profile.phi_types.length > 0 && (
                  <p><span className="text-foreground font-medium">PHI Types:</span> {profile.phi_types.join(", ")}</p>
                )}
                <p><span className="text-foreground font-medium">Environment:</span> {profile.environment}</p>
              </div>
            </AuditStepCard>
          </div>
        )}

        {isPhaseAtLeast(auditPhase, "metadata") && vendors.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" data-testid="step-vendor-analysis">
            <AuditStepCard
              stepNumber={2}
              title="Vendor & BAA Analysis"
              icon={<Users className="w-4 h-4" />}
              badge={{
                label: `${vendors.length} vendor${vendors.length > 1 ? "s" : ""} analyzed`,
                variant: "outline",
              }}
            >
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Analyzed vendor relationships for BAA coverage and PHI handling practices.
                </p>
                <div className="space-y-2 mt-3">
                  {findings.vendorAnalysis.map((vendor) => (
                    <VendorAnalysisCard key={vendor.vendor_name} vendor={vendor} />
                  ))}
                </div>
              </div>
            </AuditStepCard>
          </div>
        )}

        {isPhaseAtLeast(auditPhase, "rules") && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AuditStepCard
              stepNumber={vendors.length > 0 ? 3 : 2}
              title="HIPAA Safeguard Rules Evaluated"
              icon={<Scale className="w-4 h-4" />}
              badge={
                showRuleResults
                  ? {
                      label: `${triggeredCount} of ${totalRules} triggered`,
                      variant: triggeredCount > 0 ? "secondary" : "outline",
                    }
                  : {
                      label: `Evaluating ${totalRules} rules...`,
                      variant: "outline",
                    }
              }
              expandableContent={
                triggeredCount > 0 ? (
                  <div className="space-y-2">
                    {findings.triggeredRules.map((rule) => (
                      <div key={rule.id} className="flex items-start gap-2" data-testid={`triggered-rule-${rule.id}`}>
                        <Badge
                          variant={rule.riskContribution === "high" ? "destructive" : rule.riskContribution === "needs_review" ? "secondary" : "default"}
                          className="text-xs shrink-0 mt-0.5"
                          data-testid={`badge-risk-${rule.id}`}
                        >
                          {rule.riskContribution}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-foreground" data-testid={`text-rule-desc-${rule.id}`}>{rule.description}</p>
                          <p className="text-xs text-muted-foreground">{rule.safeguard_category} safeguard</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No rules were triggered.</p>
                )
              }
            >
              <p>
                Evaluated {totalRules} HIPAA Security/Privacy Rule safeguard requirements against the use case profile.
              </p>
            </AuditStepCard>
          </div>
        )}

        {isPhaseAtLeast(auditPhase, "classification") && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AuditStepCard
              stepNumber={vendors.length > 0 ? 4 : 3}
              title="Risk Classification Determined"
              icon={<ShieldAlert className="w-4 h-4" />}
              badge={{
                label: findings.riskClassification,
                variant: getRiskBadgeVariant(findings.riskClassification),
              }}
            >
              <div className="space-y-2">
                <p>
                  Classification follows conservative logic: HIGH if any critical safeguard gaps, NEEDS REVIEW for uncertainty, LOW only when all safeguards satisfied.
                </p>
                <p data-testid="text-hipaa-confidence">
                  <span className="text-foreground font-medium">Confidence Score:</span>{" "}
                  {(findings.confidenceScore * 100).toFixed(0)}%
                </p>
                <p>
                  <span className="text-foreground font-medium">Status:</span>{" "}
                  <Badge 
                    variant={findings.statusFlag === "Compliant" ? "default" : findings.statusFlag === "Non-Compliant" ? "destructive" : "secondary"}
                    data-testid="badge-hipaa-status"
                  >
                    {findings.statusFlag}
                  </Badge>
                </p>
              </div>
            </AuditStepCard>
          </div>
        )}

        {isPhaseAtLeast(auditPhase, "mapping") && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" data-testid="step-hipaa-citations">
            <AuditStepCard
              stepNumber={vendors.length > 0 ? 5 : 4}
              title="HIPAA Citations Mapped"
              icon={<BookOpen className="w-4 h-4" />}
              badge={{
                label: `${findings.relevantCitations.length} citations`,
                variant: "outline",
              }}
            >
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Each triggered rule is grounded in specific HIPAA Security Rule and Privacy Rule citations.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {findings.relevantCitations.slice(0, 8).map((citation) => (
                    <Badge key={citation} variant="outline" className="text-xs">
                      {citation}
                    </Badge>
                  ))}
                  {findings.relevantCitations.length > 8 && (
                    <Badge variant="secondary" className="text-xs">
                      +{findings.relevantCitations.length - 8} more
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground italic mt-3">
                  This system maps deterministic rules to HIPAA regulatory references. It does not interpret the law.
                </p>
              </div>
            </AuditStepCard>
          </div>
        )}

        {auditPhase === "done" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AuditStepCard
              stepNumber={vendors.length > 0 ? 6 : 5}
              title="Explainability Ready"
              icon={<HelpCircle className="w-4 h-4" />}
            >
              <p>
                System ready to answer questions about this result. Use the panel on the left to explore the reasoning.
              </p>
            </AuditStepCard>
          </div>
        )}
      </div>

      {auditPhase === "done" && (
        <div className="animate-in fade-in duration-300 p-4 rounded-md border border-border bg-muted/30 space-y-2">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-sm italic text-muted-foreground">
                This assessment is based on user-provided inputs and deterministic rule evaluation. It does not constitute legal advice.
              </p>
              <p className="text-sm italic text-muted-foreground">
                HIPAA compliance requires comprehensive policies, procedures, and technical controls beyond what can be assessed through this tool. Consult qualified legal and compliance professionals.
              </p>
            </div>
          </div>
        </div>
      )}

      <EmailCaptureModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        format={exportFormat}
        onSubmit={handleEmailSubmit}
      />
    </div>
  );
}
