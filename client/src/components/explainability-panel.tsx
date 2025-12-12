import { useState } from "react";
import { ChevronRight, MessageSquare, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ExplainabilityQuestion } from "@/lib/types";

interface ExplainabilityPanelProps {
  questions: ExplainabilityQuestion[];
}

interface ChatMessage {
  type: "question" | "answer";
  content: string;
  citations?: string[];
}

export default function ExplainabilityPanel({ questions }: ExplainabilityPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());

  const handleQuestionClick = (question: ExplainabilityQuestion) => {
    if (askedQuestions.has(question.id)) return;

    setAskedQuestions((prev) => new Set([...prev, question.id]));
    setMessages((prev) => [
      ...prev,
      { type: "question", content: question.question },
      { type: "answer", content: question.answer, citations: question.citations },
    ]);
  };

  const availableQuestions = questions.filter((q) => !askedQuestions.has(q.id));

  return (
    <Card className="border border-border">
      <CardHeader className="pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-xl font-semibold">Explainability & Evidence</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Read-only explanations for the compliance assessment
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {availableQuestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
              Click a question to learn more
            </p>
            {availableQuestions.map((question) => (
              <Button
                key={question.id}
                variant="outline"
                className="w-full justify-between text-left h-auto py-3 px-4"
                onClick={() => handleQuestionClick(question)}
                data-testid={`button-question-${question.id}`}
              >
                <span className="text-sm font-normal">{question.question}</span>
                <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
              </Button>
            ))}
          </div>
        )}

        {messages.length > 0 && (
          <>
            {availableQuestions.length > 0 && <Separator />}
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Conversation
              </p>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`${
                    message.type === "question"
                      ? "ml-8"
                      : "mr-0"
                  }`}
                >
                  {message.type === "question" ? (
                    <div className="p-3 rounded-md bg-primary/10 border border-primary/20" data-testid={`text-question-${index}`}>
                      <p className="text-sm font-medium">{message.content}</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-md border border-border bg-card" data-testid={`text-answer-${index}`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs font-medium text-muted-foreground">Citations</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.citations.map((citation, citationIndex) => (
                              <span
                                key={citationIndex}
                                className="text-xs text-primary underline underline-offset-2"
                                data-testid={`text-citation-${index}-${citationIndex}`}
                              >
                                {citation}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Click a question above to see the explanation
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
