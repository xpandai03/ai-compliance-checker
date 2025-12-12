import { useState, useEffect } from "react";
import { Shield, Scale } from "lucide-react";
import IntakeForm from "@/components/intake-form";
import ExplainPanel from "@/components/explain-panel";
import AuditTimeline from "@/components/audit-timeline";
import { auditModel, generateQuestionsFromRules } from "@/lib/audit";
import type { ModelProfile, ComplianceFindings } from "@/lib/types";

export type AuditPhase = "profile" | "rules" | "classification" | "mapping" | "done";

export default function HomePage() {
  const [modelProfile, setModelProfile] = useState<ModelProfile | null>(null);
  const [findings, setFindings] = useState<ComplianceFindings | null>(null);
  const [auditPhase, setAuditPhase] = useState<AuditPhase>("profile");

  const handleScan = (profile: ModelProfile) => {
    setModelProfile(profile);
    const computedFindings = auditModel(profile);
    setFindings(computedFindings);
    setAuditPhase("profile");
  };

  const handleReset = () => {
    setModelProfile(null);
    setFindings(null);
    setAuditPhase("profile");
  };

  useEffect(() => {
    if (!findings) return;

    setAuditPhase("profile");

    const timers = [
      setTimeout(() => setAuditPhase("rules"), 400),
      setTimeout(() => setAuditPhase("classification"), 800),
      setTimeout(() => setAuditPhase("mapping"), 1200),
      setTimeout(() => setAuditPhase("done"), 1600),
    ];

    return () => timers.forEach(clearTimeout);
  }, [findings]);

  const questions = findings ? generateQuestionsFromRules(findings.triggeredRules) : [];
  const hasFindings = modelProfile !== null && findings !== null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-app-title">
              AI Compliance Scanner
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <div className="flex flex-col lg:flex-row h-full">
            <div className="w-full lg:w-[420px] shrink-0 p-6 overflow-y-auto border-r border-border">
              {hasFindings ? (
                <ExplainPanel questions={questions} onReset={handleReset} />
              ) : (
                <IntakeForm onSubmit={handleScan} />
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {hasFindings ? (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Scale className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Audit Trail</h2>
                  </div>
                  <AuditTimeline 
                    modelProfile={modelProfile} 
                    findings={findings} 
                    auditPhase={auditPhase}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <Scale className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-muted-foreground mb-2">
                      Audit Trail
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Complete the model intake form and run a compliance scan to see the deterministic audit trail.
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
