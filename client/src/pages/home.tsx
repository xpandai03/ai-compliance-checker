import { useState, useEffect } from "react";
import { Shield, Scale, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IntakeForm from "@/components/intake-form";
import HIPAAIntakeForm from "@/components/hipaa-intake-form";
import ExplainPanel from "@/components/explain-panel";
import AuditTimeline from "@/components/audit-timeline";
import HIPAAAuditTimeline from "@/components/hipaa-audit-timeline";
import { auditModel, generateQuestionsFromRules } from "@/lib/audit";
import { auditHIPAA, generateHIPAAQuestionsFromRules } from "@/lib/hipaaAudit";
import { fetchProviderMetadata } from "@/lib/providerMetadata";
import type { 
  ModelProfile, 
  ComplianceFindings, 
  ProviderMetadata,
  HIPAAUseCaseProfile,
  VendorPHIMetadata,
  HIPAAFindings
} from "@/lib/types";

export type AuditPhase = "profile" | "metadata" | "rules" | "classification" | "mapping" | "done";
export type RegulationType = "eu_ai_act" | "hipaa";

export default function HomePage() {
  const [regulation, setRegulation] = useState<RegulationType>("eu_ai_act");
  
  // EU AI Act state
  const [modelProfile, setModelProfile] = useState<ModelProfile | null>(null);
  const [findings, setFindings] = useState<ComplianceFindings | null>(null);
  const [auditPhase, setAuditPhase] = useState<AuditPhase>("profile");
  const [providerMetadata, setProviderMetadata] = useState<ProviderMetadata | null>(null);

  // HIPAA state
  const [hipaaProfile, setHipaaProfile] = useState<HIPAAUseCaseProfile | null>(null);
  const [hipaaVendors, setHipaaVendors] = useState<VendorPHIMetadata[]>([]);
  const [hipaaFindings, setHipaaFindings] = useState<HIPAAFindings | null>(null);
  const [hipaaAuditPhase, setHipaaAuditPhase] = useState<AuditPhase>("profile");

  const handleEUScan = async (profile: ModelProfile) => {
    setAuditPhase("profile");
    
    const metadata = await fetchProviderMetadata(profile.provider, profile.modelName);
    setProviderMetadata(metadata);
    
    const profileWithMetadata: ModelProfile = {
      ...profile,
      provider_metadata: metadata
    };
    
    setModelProfile(profileWithMetadata);
    const computedFindings = auditModel(profileWithMetadata);
    setFindings(computedFindings);
  };

  const handleHIPAAScan = (profile: HIPAAUseCaseProfile, vendors: VendorPHIMetadata[]) => {
    console.log("[HIPAA] handleHIPAAScan called with profile:", profile);
    console.log("[HIPAA] vendors:", vendors);
    setHipaaAuditPhase("profile");
    setHipaaProfile(profile);
    setHipaaVendors(vendors);
    const computedFindings = auditHIPAA(profile, vendors);
    console.log("[HIPAA] auditHIPAA returned:", computedFindings);
    console.log("[HIPAA] triggeredRules:", computedFindings.triggeredRules);
    console.log("[HIPAA] relevantCitations:", computedFindings.relevantCitations);
    setHipaaFindings(computedFindings);
  };

  const handleEUReset = () => {
    setModelProfile(null);
    setFindings(null);
    setAuditPhase("profile");
    setProviderMetadata(null);
  };

  const handleHIPAAReset = () => {
    setHipaaProfile(null);
    setHipaaVendors([]);
    setHipaaFindings(null);
    setHipaaAuditPhase("profile");
  };

  const handleRegulationChange = (value: string) => {
    setRegulation(value as RegulationType);
  };

  useEffect(() => {
    if (!findings) return;

    setAuditPhase("profile");

    const timers = [
      setTimeout(() => setAuditPhase("metadata"), 400),
      setTimeout(() => setAuditPhase("rules"), 800),
      setTimeout(() => setAuditPhase("classification"), 1200),
      setTimeout(() => setAuditPhase("mapping"), 1600),
      setTimeout(() => setAuditPhase("done"), 2000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [findings]);

  useEffect(() => {
    if (!hipaaFindings) return;

    setHipaaAuditPhase("profile");

    const timers = [
      setTimeout(() => setHipaaAuditPhase("metadata"), 400),
      setTimeout(() => setHipaaAuditPhase("rules"), 800),
      setTimeout(() => setHipaaAuditPhase("classification"), 1200),
      setTimeout(() => setHipaaAuditPhase("mapping"), 1600),
      setTimeout(() => setHipaaAuditPhase("done"), 2000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [hipaaFindings]);

  const euQuestions = findings ? generateQuestionsFromRules(findings.triggeredRules) : [];
  const hipaaQuestions = hipaaFindings ? generateHIPAAQuestionsFromRules(hipaaFindings.triggeredRules) : [];
  
  const hasEUFindings = modelProfile !== null && findings !== null;
  const hasHIPAAFindings = hipaaProfile !== null && hipaaFindings !== null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-app-title">
                AI Compliance Scanner
              </h1>
            </div>
            
            <Tabs value={regulation} onValueChange={handleRegulationChange}>
              <TabsList>
                <TabsTrigger value="eu_ai_act" data-testid="tab-eu-ai-act">
                  <FileText className="w-4 h-4 mr-2" />
                  EU AI Act
                </TabsTrigger>
                <TabsTrigger value="hipaa" data-testid="tab-hipaa">
                  <Shield className="w-4 h-4 mr-2" />
                  HIPAA
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <div className="flex flex-col lg:flex-row h-full">
            <div className="w-full lg:w-[420px] shrink-0 p-6 overflow-y-auto border-r border-border">
              {regulation === "eu_ai_act" ? (
                hasEUFindings ? (
                  <ExplainPanel questions={euQuestions} onReset={handleEUReset} />
                ) : (
                  <IntakeForm onSubmit={handleEUScan} />
                )
              ) : (
                hasHIPAAFindings ? (
                  <ExplainPanel questions={hipaaQuestions} onReset={handleHIPAAReset} />
                ) : (
                  <HIPAAIntakeForm onSubmit={handleHIPAAScan} />
                )
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {regulation === "eu_ai_act" ? (
                hasEUFindings ? (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Scale className="w-5 h-5 text-muted-foreground" />
                      <h2 className="text-xl font-semibold">Audit Trail</h2>
                    </div>
                    <AuditTimeline 
                      modelProfile={modelProfile} 
                      findings={findings} 
                      auditPhase={auditPhase}
                      providerMetadata={providerMetadata}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <Scale className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                      <h2 className="text-lg font-semibold text-muted-foreground mb-2">
                        EU AI Act Audit Trail
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Complete the model intake form and run a compliance scan to see the deterministic audit trail.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                hasHIPAAFindings ? (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Scale className="w-5 h-5 text-muted-foreground" />
                      <h2 className="text-xl font-semibold">HIPAA Audit Trail</h2>
                    </div>
                    <HIPAAAuditTimeline 
                      profile={hipaaProfile} 
                      vendors={hipaaVendors}
                      findings={hipaaFindings} 
                      auditPhase={hipaaAuditPhase}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <Shield className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                      <h2 className="text-lg font-semibold text-muted-foreground mb-2">
                        HIPAA Audit Trail
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Complete the HIPAA use case intake form and run a risk assessment to see the deterministic audit trail.
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
