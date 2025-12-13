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
  // STEP 1: Single authoritative regulation state
  const [regulation, setRegulation] = useState<"eu_ai_act" | "hipaa">("eu_ai_act");
  
  // STEP 2: Separate findings state containers - NEVER shared
  // EU AI Act state
  const [euProfile, setEUProfile] = useState<ModelProfile | null>(null);
  const [euFindings, setEUFindings] = useState<ComplianceFindings | null>(null);
  const [euAuditPhase, setEUAuditPhase] = useState<AuditPhase>("profile");
  const [euProviderMetadata, setEUProviderMetadata] = useState<ProviderMetadata | null>(null);

  // HIPAA state - completely separate
  const [hipaaProfile, setHipaaProfile] = useState<HIPAAUseCaseProfile | null>(null);
  const [hipaaVendors, setHipaaVendors] = useState<VendorPHIMetadata[]>([]);
  const [hipaaFindings, setHipaaFindings] = useState<HIPAAFindings | null>(null);
  const [hipaaAuditPhase, setHipaaAuditPhase] = useState<AuditPhase>("profile");

  // STEP 3: HARD execution split - EU scan clears HIPAA, HIPAA scan clears EU
  const handleEUScan = async (profile: ModelProfile) => {
    console.log("[EU] handleEUScan called - regulation is:", regulation);
    
    // Clear HIPAA state when running EU scan
    setHipaaProfile(null);
    setHipaaVendors([]);
    setHipaaFindings(null);
    setHipaaAuditPhase("profile");
    
    setEUAuditPhase("profile");
    
    const metadata = await fetchProviderMetadata(profile.provider, profile.modelName);
    setEUProviderMetadata(metadata);
    
    const profileWithMetadata: ModelProfile = {
      ...profile,
      provider_metadata: metadata
    };
    
    setEUProfile(profileWithMetadata);
    const computedFindings = auditModel(profileWithMetadata);
    setEUFindings(computedFindings);
    
    console.log("[EU] Scan complete - euFindings set");
  };

  const handleHIPAAScan = (profile: HIPAAUseCaseProfile, vendors: VendorPHIMetadata[]) => {
    console.log("[HIPAA] handleHIPAAScan called - regulation is:", regulation);
    console.log("[HIPAA] Profile:", profile);
    console.log("[HIPAA] Vendors:", vendors);
    
    // Clear EU state when running HIPAA scan
    setEUProfile(null);
    setEUFindings(null);
    setEUAuditPhase("profile");
    setEUProviderMetadata(null);
    
    setHipaaAuditPhase("profile");
    setHipaaProfile(profile);
    setHipaaVendors(vendors);
    
    const computedFindings = auditHIPAA(profile, vendors);
    console.log("[HIPAA] auditHIPAA returned:", computedFindings);
    console.log("[HIPAA] triggeredRules:", computedFindings.triggeredRules);
    console.log("[HIPAA] relevantCitations:", computedFindings.relevantCitations);
    
    setHipaaFindings(computedFindings);
    console.log("[HIPAA] Scan complete - hipaaFindings set");
  };

  const handleEUReset = () => {
    setEUProfile(null);
    setEUFindings(null);
    setEUAuditPhase("profile");
    setEUProviderMetadata(null);
  };

  const handleHIPAAReset = () => {
    setHipaaProfile(null);
    setHipaaVendors([]);
    setHipaaFindings(null);
    setHipaaAuditPhase("profile");
  };

  // Tab change handler - ONLY way to change regulation
  const handleRegulationChange = (value: string) => {
    console.log("[REGULATION] Tab clicked, changing to:", value);
    if (value === "eu_ai_act" || value === "hipaa") {
      setRegulation(value);
    }
  };

  // STEP 6: LOG PROOF - state visibility
  console.log("[STATE] regulation:", regulation);
  console.log("[STATE] hasEUFindings:", euFindings !== null);
  console.log("[STATE] hasHIPAAFindings:", hipaaFindings !== null);

  // STEP 5: HARD ASSERTION - prevent impossible states
  if (regulation === "hipaa" && euFindings !== null) {
    console.error("FATAL: EU findings present in HIPAA mode - clearing EU state");
    setEUFindings(null);
    setEUProfile(null);
  }
  if (regulation === "eu_ai_act" && hipaaFindings !== null) {
    console.error("FATAL: HIPAA findings present in EU mode - clearing HIPAA state");
    setHipaaFindings(null);
    setHipaaProfile(null);
  }

  // EU audit phase animation
  useEffect(() => {
    if (!euFindings) return;

    setEUAuditPhase("profile");

    const timers = [
      setTimeout(() => setEUAuditPhase("metadata"), 400),
      setTimeout(() => setEUAuditPhase("rules"), 800),
      setTimeout(() => setEUAuditPhase("classification"), 1200),
      setTimeout(() => setEUAuditPhase("mapping"), 1600),
      setTimeout(() => setEUAuditPhase("done"), 2000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [euFindings]);

  // HIPAA audit phase animation
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

  const euQuestions = euFindings ? generateQuestionsFromRules(euFindings.triggeredRules) : [];
  const hipaaQuestions = hipaaFindings ? generateHIPAAQuestionsFromRules(hipaaFindings.triggeredRules) : [];

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
            {/* Left Panel - Forms and Explain Panel */}
            <div className="w-full lg:w-[420px] shrink-0 p-6 overflow-y-auto border-r border-border">
              {/* STEP 4: RENDER BASED ON REGULATION ONLY - EU Mode */}
              {regulation === "eu_ai_act" && euFindings && (
                <ExplainPanel questions={euQuestions} onReset={handleEUReset} />
              )}
              {regulation === "eu_ai_act" && !euFindings && (
                <IntakeForm onSubmit={handleEUScan} />
              )}
              
              {/* STEP 4: RENDER BASED ON REGULATION ONLY - HIPAA Mode */}
              {regulation === "hipaa" && hipaaFindings && (
                <ExplainPanel questions={hipaaQuestions} onReset={handleHIPAAReset} />
              )}
              {regulation === "hipaa" && !hipaaFindings && (
                <HIPAAIntakeForm onSubmit={handleHIPAAScan} />
              )}
            </div>

            {/* Right Panel - Audit Timelines */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* EU Mode - Only render when regulation === eu_ai_act */}
              {regulation === "eu_ai_act" && euFindings && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Scale className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">EU AI Act Audit Trail</h2>
                  </div>
                  <AuditTimeline 
                    modelProfile={euProfile!} 
                    findings={euFindings} 
                    auditPhase={euAuditPhase}
                    providerMetadata={euProviderMetadata}
                  />
                </div>
              )}
              {regulation === "eu_ai_act" && !euFindings && (
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
              )}

              {/* HIPAA Mode - Only render when regulation === hipaa */}
              {regulation === "hipaa" && hipaaFindings && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Scale className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">HIPAA Audit Trail</h2>
                  </div>
                  <HIPAAAuditTimeline 
                    profile={hipaaProfile!} 
                    vendors={hipaaVendors}
                    findings={hipaaFindings} 
                    auditPhase={hipaaAuditPhase}
                  />
                </div>
              )}
              {regulation === "hipaa" && !hipaaFindings && (
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
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
