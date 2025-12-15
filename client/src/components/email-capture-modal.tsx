import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, CheckCircle2, AlertTriangle, Loader2, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const emailCaptureSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  companyName: z.string().optional(),
  disclaimer: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge the disclaimer to continue",
  }),
});

type EmailCaptureFormData = z.infer<typeof emailCaptureSchema>;

export type ExportFormat = "pdf" | "json";

type ModalState = "form" | "submitting" | "success" | "error";

interface EmailCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  format: ExportFormat;
  onSubmit: (email: string, companyName?: string) => Promise<void>;
}

export default function EmailCaptureModal({
  open,
  onOpenChange,
  format,
  onSubmit,
}: EmailCaptureModalProps) {
  const [modalState, setModalState] = useState<ModalState>("form");
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);

  const form = useForm<EmailCaptureFormData>({
    resolver: zodResolver(emailCaptureSchema),
    defaultValues: {
      email: "",
      companyName: "",
      disclaimer: false,
    },
  });

  const handleSubmit = async (data: EmailCaptureFormData) => {
    console.log("🚨 Modal handleSubmit called, email:", data.email);
    setModalState("submitting");
    setSubmittedEmail(data.email);
    setErrorMessage("");

    try {
      console.log("🚨 Calling onSubmit prop...");
      await onSubmit(data.email, data.companyName || undefined);
      console.log("🚨 onSubmit completed successfully");
      setModalState("success");
      setRetryCount(0);
    } catch (error) {
      console.log("🚨 onSubmit threw error:", error);
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      if (newRetryCount >= 3) {
        setErrorMessage(
          "We're having trouble sending your report. Please contact support@agentglu.com for assistance."
        );
      } else {
        setErrorMessage(
          "We couldn't send your report right now. Please try again."
        );
      }
      setModalState("error");
    }
  };

  const handleRetry = () => {
    setModalState("form");
    setErrorMessage("");
  };

  const handleClose = () => {
    // Reset state when closing
    setModalState("form");
    setErrorMessage("");
    setRetryCount(0);
    form.reset();
    onOpenChange(false);
  };

  const formatLabel = format === "pdf" ? "PDF" : "JSON";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {modalState === "form" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <DialogTitle>Get Your HIPAA Compliance Report</DialogTitle>
              </div>
              <DialogDescription>
                Your assessment is complete. Enter your email to receive the full{" "}
                {formatLabel} report with detailed remediation guidance.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@company.com"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Your Organization"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disclaimer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          I understand this report is for informational purposes
                          and does not constitute legal advice
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full gap-2" size="lg">
                  <Mail className="w-4 h-4" />
                  Send Report to My Email
                </Button>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 mt-0.5 shrink-0" />
                  <p>
                    We respect your privacy. No spam, ever. Your data is
                    processed securely and never shared.
                  </p>
                </div>
              </form>
            </Form>
          </>
        )}

        {modalState === "submitting" && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Preparing and sending your report...
            </p>
          </div>
        )}

        {modalState === "success" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <DialogTitle>Report Sent Successfully</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Check your inbox at <span className="font-medium text-foreground">{submittedEmail}</span>
              </p>

              <div className="rounded-md border bg-muted/30 p-4 space-y-2">
                <p className="text-sm font-medium">The {formatLabel} report includes:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Full risk assessment breakdown</li>
                  <li>- Detailed remediation checklist</li>
                  <li>- HIPAA citation references</li>
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">
                Didn't receive it? Check your spam folder or contact{" "}
                <span className="text-foreground">support@agentglu.com</span>
              </p>

              <Button onClick={handleClose} className="w-full" variant="outline">
                Done
              </Button>
            </div>
          </>
        )}

        {modalState === "error" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <DialogTitle>Delivery Issue</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{errorMessage}</p>

              {retryCount < 3 && (
                <Button onClick={handleRetry} className="w-full">
                  Try Again
                </Button>
              )}

              {retryCount >= 3 && (
                <div className="text-sm text-muted-foreground">
                  <p>
                    Please contact{" "}
                    <span className="text-foreground font-medium">
                      support@agentglu.com
                    </span>{" "}
                    for assistance.
                  </p>
                </div>
              )}

              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
