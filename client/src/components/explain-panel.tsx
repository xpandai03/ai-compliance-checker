import { useState } from "react";
import { ChevronRight, BookOpen, RotateCcw, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { ExplainabilityQuestion } from "@/lib/types";

interface ExplainPanelProps {
  questions: ExplainabilityQuestion[];
  onReset: () => void;
}

interface SelectedExplanation {
  question: string;
  answer: string;
  citations?: string[];
}

export default function ExplainPanel({ questions, onReset }: ExplainPanelProps) {
  const [selectedExplanation, setSelectedExplanation] = useState<SelectedExplanation | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const handleQuestionClick = (question: ExplainabilityQuestion) => {
    setSelectedQuestionId(question.id);
    setSelectedExplanation({
      question: question.question,
      answer: question.answer,
      citations: question.citations,
    });
  };

  return (
    <div className="h-full flex flex-col border border-border rounded-md bg-card">
      <div className="pt-6 px-5 pb-4 shrink-0">
        <h2 className="text-lg font-semibold text-foreground">
          Explain this result
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Read-only explanations grounded in the audit trail
        </p>
      </div>

      <div className="px-5 pb-4 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2"
          data-testid="button-new-scan"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New Scan
        </Button>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Inspection Items
          </p>
          {questions.map((question) => {
            const isSelected = selectedQuestionId === question.id;
            return (
              <Button
                key={question.id}
                variant={isSelected ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleQuestionClick(question)}
                className={`w-full justify-between text-left ${
                  isSelected ? "bg-accent" : ""
                }`}
                data-testid={`button-question-${question.id}`}
              >
                <span className="font-normal truncate text-left">{question.question}</span>
                <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground ml-2" />
              </Button>
            );
          })}
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Explanation
          </p>

          {selectedExplanation ? (
            <div className="space-y-4" data-testid="explanation-content">
              <div className="p-4 rounded-md border border-border bg-muted/30">
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      {selectedExplanation.question}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedExplanation.answer}
                    </p>
                    {selectedExplanation.citations && selectedExplanation.citations.length > 0 && (
                      <div className="pt-3 border-t border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs font-medium text-muted-foreground">Derived from</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedExplanation.citations.map((citation, citationIndex) => (
                            <Badge
                              key={citationIndex}
                              variant="outline"
                              className="text-xs"
                              data-testid={`text-citation-${citationIndex}`}
                            >
                              {citation}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4" data-testid="explanation-empty-state">
              <div className="flex items-start gap-3 text-muted-foreground">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="space-y-1.5">
                  <p className="text-sm">
                    Select a question above to view the explanation.
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    Explanations are generated directly from triggered audit rules.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
