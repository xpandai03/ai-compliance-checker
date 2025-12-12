import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AuditStepCardProps {
  stepNumber: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  expandableContent?: React.ReactNode;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
}

export default function AuditStepCard({
  stepNumber,
  title,
  icon,
  children,
  expandableContent,
  badge,
}: AuditStepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border border-border" data-testid={`audit-step-${stepNumber}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {stepNumber}
                </span>
                <h3 className="font-semibold text-sm">{title}</h3>
              </div>
              {badge && (
                <Badge variant={badge.variant || "secondary"} className="text-xs">
                  {badge.label}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">{children}</div>
            {expandableContent && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="gap-1 h-7 px-2 text-xs"
                  data-testid={`button-expand-step-${stepNumber}`}
                >
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                  {isExpanded ? "Hide details" : "Show details"}
                </Button>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border text-sm">
                    {expandableContent}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
