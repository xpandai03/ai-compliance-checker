import { useState } from "react";
import { FileText, Scale, ShieldAlert, BookOpen, HelpCircle, Info, CheckCircle2, Database, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AuditStepCard from "./audit-step-card";
import type { ModelProfile, ComplianceFindings, ProviderMetadata, AppliedArticle } from "@/lib/types";
import type { AuditPhase } from "@/pages/home";
import { formatConfidence, getSourceLabel } from "@/lib/providerMetadata";

interface AuditTimelineProps {
  modelProfile: ModelProfile;
  findings: ComplianceFindings;
  auditPhase: AuditPhase;
  providerMetadata: ProviderMetadata | null;
}

const phaseOrder: AuditPhase[] = ["profile", "metadata", "rules", "classification", "mapping", "done"];

function isPhaseAtLeast(current: AuditPhase, target: AuditPhase): boolean {
  return phaseOrder.indexOf(current) >= phaseOrder.indexOf(target);
}

interface ArticleLegalBasisProps {
  appliedArticle: AppliedArticle;
  triggeredRules: ComplianceFindings["triggeredRules"];
}

function ArticleLegalBasis({ appliedArticle, triggeredRules }: ArticleLegalBasisProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const relevantRules = triggeredRules.filter(rule => 
    appliedArticle.triggeringRuleIds.includes(rule.id)
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border rounded-md overflow-visible">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover-elevate active-elevate-2" data-testid={`article-trigger-${appliedArticle.article}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs shrink-0">
              {appliedArticle.article}
            </Badge>
            <span className="text-sm text-muted-foreground truncate">
              {appliedArticle.title}
            </span>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3 border-t border-border pt-2">
            <div>
              <p className="text-xs font-medium text-foreground mb-1">Summary</p>
              <p className="text-xs text-muted-foreground">
                {appliedArticle.summary}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground mb-1">Triggering Rules</p>
              <div className="space-y-1">
                {relevantRules.map(rule => (
                  <div key={rule.id} className="flex items-start gap-2">
                    <Badge 
                      variant={rule.riskContribution === "high" ? "destructive" : "outline"} 
                      className="text-xs shrink-0 mt-0.5"
                    >
                      {rule.riskContribution}
                    </Badge>
                    <div>
                      <p className="text-xs text-muted-foreground">{rule.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function AuditTimeline({ modelProfile, findings, auditPhase, providerMetadata }: AuditTimelineProps) {
  const getRiskBadgeVariant = (risk: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (risk) {
      case "High Risk":
        return "destructive";
      case "Limited Risk":
        return "secondary";
      default:
        return "outline";
    }
  };

  const totalRules = 6;
  const triggeredCount = findings.triggeredRules.length;
  const showRuleResults = isPhaseAtLeast(auditPhase, "rules");

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-md border border-border bg-muted/30">
        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Audit completed deterministically in milliseconds.
          </p>
          <p className="text-sm text-muted-foreground">
            This timeline shows how the result was derived.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {isPhaseAtLeast(auditPhase, "profile") && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AuditStepCard
              stepNumber={1}
              title="Model Profile Created"
              icon={<FileText className="w-4 h-4" />}
            >
              <div className="space-y-1">
                <p><span className="text-foreground font-medium">Model:</span> {modelProfile.modelName}</p>
                <p><span className="text-foreground font-medium">Provider:</span> {modelProfile.provider}</p>
                <p><span className="text-foreground font-medium">Use Case:</span> {modelProfile.useCase}</p>
                <p><span className="text-foreground font-medium">User Type:</span> {modelProfile.userType}</p>
              </div>
            </AuditStepCard>
          </div>
        )}

        {isPhaseAtLeast(auditPhase, "metadata") && providerMetadata && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" data-testid="step-provider-metadata">
            <AuditStepCard
              stepNumber={2}
              title="Provider Metadata Retrieved"
              icon={<Database className="w-4 h-4" />}
              badge={{
                label: `${formatConfidence(providerMetadata.overall_confidence)} confidence`,
                variant: providerMetadata.overall_confidence >= 0.7 ? "outline" : "secondary",
              }}
            >
              <div className="space-y-2">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="text-foreground font-medium">Provider:</span>{" "}
                    {providerMetadata.provider.value}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({getSourceLabel(providerMetadata.provider.source)})
                    </span>
                  </p>
                  <p>
                    <span className="text-foreground font-medium">Model ID:</span>{" "}
                    {providerMetadata.model_id.value}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({getSourceLabel(providerMetadata.model_id.source)}, {formatConfidence(providerMetadata.model_id.confidence)})
                    </span>
                  </p>
                  <p>
                    <span className="text-foreground font-medium">Model Family:</span>{" "}
                    {providerMetadata.model_family.value}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({formatConfidence(providerMetadata.model_family.confidence)})
                    </span>
                  </p>
                  <p>
                    <span className="text-foreground font-medium">Modality:</span>{" "}
                    {providerMetadata.modality.value.join(", ")}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({formatConfidence(providerMetadata.modality.confidence)})
                    </span>
                  </p>
                  {providerMetadata.context_window.value !== null && (
                    <p>
                      <span className="text-foreground font-medium">Context Window:</span>{" "}
                      {providerMetadata.context_window.value.toLocaleString()} tokens
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({formatConfidence(providerMetadata.context_window.confidence)})
                      </span>
                    </p>
                  )}
                  <p>
                    <span className="text-foreground font-medium">Deployment Class:</span>{" "}
                    {providerMetadata.deployment_class.value}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({formatConfidence(providerMetadata.deployment_class.confidence)})
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {providerMetadata.metadata_sources.map((source) => (
                    <Badge key={source} variant="outline" className="text-xs">
                      {getSourceLabel(source)}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic mt-2">
                  Metadata retrieved from provider APIs and curated registries. Fields not available from the provider are explicitly marked as unknown.
                </p>
              </div>
            </AuditStepCard>
          </div>
        )}

        {isPhaseAtLeast(auditPhase, "rules") && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AuditStepCard
              stepNumber={3}
              title="Risk Rules Evaluated"
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
                      <div key={rule.id} className="flex items-start gap-2">
                        <Badge
                          variant={rule.riskContribution === "high" ? "destructive" : "outline"}
                          className="text-xs shrink-0 mt-0.5"
                        >
                          {rule.riskContribution}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-foreground">{rule.id}</p>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
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
                Evaluated {totalRules} EU AI Act-inspired compliance rules against the model profile.
              </p>
            </AuditStepCard>
          </div>
        )}

        {isPhaseAtLeast(auditPhase, "classification") && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AuditStepCard
              stepNumber={4}
              title="Risk Classification Determined"
              icon={<ShieldAlert className="w-4 h-4" />}
              badge={{
                label: findings.riskClassification,
                variant: getRiskBadgeVariant(findings.riskClassification),
              }}
            >
              <div className="space-y-2">
                <p>
                  Classification follows "highest-risk-wins" logic: the final category is determined by the most severe triggered rule.
                </p>
                <p>
                  <span className="text-foreground font-medium">Confidence Score:</span>{" "}
                  {(findings.confidenceScore * 100).toFixed(0)}%
                </p>
              </div>
            </AuditStepCard>
          </div>
        )}

        {isPhaseAtLeast(auditPhase, "mapping") && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" data-testid="step-regulatory-mapping">
            <AuditStepCard
              stepNumber={5}
              title="Regulatory Mapping Applied"
              icon={<BookOpen className="w-4 h-4" />}
              badge={{
                label: findings.applicableRegulation,
                variant: "outline",
              }}
            >
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This risk classification is grounded in explicit EU AI Act articles, based on the triggered deployment and model type rules.
                </p>
                <div className="space-y-2">
                  {(findings.appliedArticles || []).map((appliedArticle) => (
                    <ArticleLegalBasis
                      key={appliedArticle.article}
                      appliedArticle={appliedArticle}
                      triggeredRules={findings.triggeredRules}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic mt-3">
                  This system applies deterministic rules derived from the EU AI Act. It does not interpret or replace legal advice.
                </p>
              </div>
            </AuditStepCard>
          </div>
        )}

        {auditPhase === "done" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AuditStepCard
              stepNumber={6}
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
                This metadata reflects information available from provider APIs and public documentation. It does not include training data provenance or regulatory interpretation.
              </p>
              <p className="text-sm italic text-muted-foreground">
                Regulatory grounding reflects explicit mappings between deterministic rules and EU AI Act articles. This system does not perform legal interpretation or provide legal advice.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
