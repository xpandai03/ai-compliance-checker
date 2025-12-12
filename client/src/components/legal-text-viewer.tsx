import { ExternalLink, FileText, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getTextEntry, type EuAiActTextEntry } from "@/lib/euAiActText";

interface LegalTextViewerProps {
  refId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LegalTextViewer({ refId, open, onOpenChange }: LegalTextViewerProps) {
  const entry = refId ? getTextEntry(refId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <DialogTitle className="text-lg">
              {entry ? entry.ref : refId || "Reference"}
            </DialogTitle>
          </div>
          {entry && (
            <DialogDescription className="text-sm text-muted-foreground">
              {entry.title}
            </DialogDescription>
          )}
        </DialogHeader>

        {entry ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {entry.type}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Excerpt
              </Badge>
            </div>

            <div className="p-4 rounded-md border border-border bg-muted/30">
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {entry.excerpt}
              </p>
            </div>

            {entry.note && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {entry.note}
                </p>
              </div>
            )}

            {entry.source_url && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  asChild
                >
                  <a
                    href={entry.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-source-url"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View official source
                  </a>
                </Button>
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                Read-only excerpt for reference. Not complete text. Not legal advice.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-6">
            <div className="flex items-start gap-3 text-muted-foreground">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm">
                  No excerpt available for this reference yet.
                </p>
                <p className="text-xs text-muted-foreground/80">
                  The reference corpus is being expanded. Check the official EU AI Act text for complete information.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
