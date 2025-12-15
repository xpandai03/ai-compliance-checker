import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, CheckCircle2, AlertTriangle, Loader2, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { MagneticButton } from "@/launch-ui/components/magnetic-button";

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
    setModalState("submitting");
    setSubmittedEmail(data.email);
    setErrorMessage("");

    try {
      await onSubmit(data.email, data.companyName || undefined);
      setModalState("success");
      setRetryCount(0);
    } catch (error) {
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
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-xl">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm text-white/60 transition-colors hover:text-white focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="sr-only">Close</span>
          </button>

          {modalState === "form" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-white" />
                  <h2 className="text-lg font-semibold text-white">
                    Get Your HIPAA Compliance Report
                  </h2>
                </div>
                <p className="text-sm text-white/60">
                  Your assessment is complete. Enter your email to receive the full{" "}
                  {formatLabel} report with detailed remediation guidance.
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <label className="mb-1 block font-mono text-xs text-white/60">
                          Email Address *
                        </label>
                        <FormControl>
                          <input
                            type="email"
                            placeholder="your.email@company.com"
                            className="w-full border-b border-white/30 bg-transparent py-2 text-sm text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <label className="mb-1 block font-mono text-xs text-white/60">
                          Company Name (optional)
                        </label>
                        <FormControl>
                          <input
                            type="text"
                            placeholder="Your Organization"
                            className="w-full border-b border-white/30 bg-transparent py-2 text-sm text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="disclaimer"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 rounded-lg border border-white/20 bg-white/5 p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-0.5 h-4 w-4 rounded border-white/30 bg-transparent accent-white"
                            />
                          </FormControl>
                          <label className="text-sm text-white/70 cursor-pointer leading-relaxed">
                            I understand this report is for informational purposes
                            and does not constitute legal advice
                          </label>
                        </div>
                        <FormMessage className="text-red-400 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  <MagneticButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={form.handleSubmit(handleSubmit)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Report to My Email
                  </MagneticButton>

                  <div className="flex items-start gap-2 text-xs text-white/50">
                    <Lock className="mt-0.5 h-3 w-3 shrink-0" />
                    <p>
                      We respect your privacy. No spam, ever. Your data is
                      processed securely and never shared.
                    </p>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {modalState === "submitting" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <p className="text-sm text-white/60">
                Preparing and sending your report...
              </p>
            </div>
          )}

          {modalState === "success" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">
                  Report Sent Successfully
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-white/70">
                  Check your inbox at{" "}
                  <span className="font-medium text-white">{submittedEmail}</span>
                </p>

                <div className="space-y-2 rounded-lg border border-white/20 bg-white/5 p-4">
                  <p className="text-sm font-medium text-white">
                    The {formatLabel} report includes:
                  </p>
                  <ul className="space-y-1 text-sm text-white/60">
                    <li>• Full risk assessment breakdown</li>
                    <li>• Detailed remediation checklist</li>
                    <li>• HIPAA citation references</li>
                  </ul>
                </div>

                <p className="text-xs text-white/50">
                  Didn't receive it? Check your spam folder or contact{" "}
                  <span className="text-white/70">support@agentglu.com</span>
                </p>

                <MagneticButton
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={handleClose}
                >
                  Done
                </MagneticButton>
              </div>
            </div>
          )}

          {modalState === "error" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">
                  Delivery Issue
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-white/70">{errorMessage}</p>

                {retryCount < 3 && (
                  <MagneticButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleRetry}
                  >
                    Try Again
                  </MagneticButton>
                )}

                {retryCount >= 3 && (
                  <p className="text-sm text-white/60">
                    Please contact{" "}
                    <span className="font-medium text-white">
                      support@agentglu.com
                    </span>{" "}
                    for assistance.
                  </p>
                )}

                <MagneticButton
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={handleClose}
                >
                  Close
                </MagneticButton>
              </div>
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
