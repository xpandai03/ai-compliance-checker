import { useLocation, Link } from "wouter";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FindingsPanel from "@/components/findings-panel";
import ExplainabilityPanel from "@/components/explainability-panel";
import { auditModel, generateQuestionsFromRules } from "@/lib/audit";
import type { ModelProfile } from "@/lib/types";

interface FindingsPageProps {
  modelProfile: ModelProfile | null;
}

export default function FindingsPage({ modelProfile }: FindingsPageProps) {
  const [, setLocation] = useLocation();

  if (!modelProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">No model profile found.</p>
          <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-back-empty">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Intake
          </Button>
        </div>
      </div>
    );
  }

  const findings = auditModel(modelProfile);
  const questions = generateQuestionsFromRules(findings.triggeredRules);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-app-title-findings">
                AI Compliance Scanner
              </h1>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-intake">
                <ArrowLeft className="w-4 h-4" />
                Back to Intake
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <FindingsPanel findings={findings} modelProfile={modelProfile} />
        <ExplainabilityPanel questions={questions} />
      </main>
    </div>
  );
}
