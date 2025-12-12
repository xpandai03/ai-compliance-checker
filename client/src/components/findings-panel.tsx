import { AlertTriangle, CheckCircle2, Info, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ComplianceFindings, ModelProfile } from "@/lib/types";

interface FindingsPanelProps {
  findings: ComplianceFindings;
  modelProfile: ModelProfile;
}

export default function FindingsPanel({ findings, modelProfile }: FindingsPanelProps) {
  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "High Risk":
        return "destructive";
      case "Limited Risk":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Needs Manual Review":
        return <AlertTriangle className="w-4 h-4" />;
      case "Compliant":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Needs Manual Review":
        return "secondary";
      case "Compliant":
        return "outline";
      default:
        return "destructive";
    }
  };

  return (
    <Card className="border-2 border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-xl font-semibold">Compliance Assessment</CardTitle>
          </div>
          <Badge variant={getRiskBadgeVariant(findings.riskClassification)} className="text-xs font-semibold uppercase tracking-wide" data-testid="badge-risk-classification">
            {findings.riskClassification}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-md bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Model Under Review</p>
          <p className="text-lg font-semibold" data-testid="text-model-name">{modelProfile.modelName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {modelProfile.provider} | {modelProfile.useCase} | {modelProfile.userType}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Confidence Score
            </p>
            <p className="text-3xl font-bold" data-testid="text-confidence-score">
              {(findings.confidenceScore * 100).toFixed(0)}%
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Applicable Regulation
            </p>
            <p className="text-lg font-semibold" data-testid="text-regulation">
              {findings.applicableRegulation}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
            Relevant Articles
          </p>
          <div className="flex flex-wrap gap-2">
            {findings.relevantArticles.map((article) => (
              <Badge key={article} variant="outline" className="px-3 py-1.5 text-sm" data-testid={`badge-article-${article.replace(/\s+/g, '-')}`}>
                {article}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Status:
          </p>
          <Badge variant={getStatusBadgeVariant(findings.statusFlag)} className="gap-1.5" data-testid="badge-status">
            {getStatusIcon(findings.statusFlag)}
            {findings.statusFlag}
          </Badge>
        </div>

        <div className="p-4 rounded-md border border-border bg-muted/30 space-y-2">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-sm italic text-muted-foreground" data-testid="text-disclaimer">
                These findings are mocked for demo purposes. No real compliance logic is executed.
              </p>
              <p className="text-sm italic text-muted-foreground" data-testid="text-disclaimer-2">
                This prototype implements a simplified EU AI Act risk classification for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
