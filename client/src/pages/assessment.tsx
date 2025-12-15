import { useRef, useState } from "react";
import { WorkSection } from "@/launch-ui/components/sections/work-section";
import { ServicesSection } from "@/launch-ui/components/sections/services-section";
import { AiFunctionSection } from "@/launch-ui/components/sections/ai-function-section";
import { AboutSection } from "@/launch-ui/components/sections/about-section";
import { ContactSection, type VendorDraft, createEmptyVendor } from "@/launch-ui/components/sections/contact-section";
import { ReviewSection } from "@/launch-ui/components/sections/review-section";
import { ResultsSection, type ExportFormat } from "@/launch-ui/components/sections/results-section";
import { MagneticButton } from "@/launch-ui/components/magnetic-button";
import { mapDraftToHIPAAProfile, createVendorMetadata } from "@/launch-ui/lib/mapDraftToProfile";
import { auditHIPAA } from "@/lib/hipaaAudit";
import type { HIPAAFindings, HIPAAUseCaseProfile, VendorPHIMetadata } from "@/lib/types";
import EmailCaptureModal from "@/components/email-capture-modal";
import {
  generateHIPAAComplianceReport,
  generateHIPAAReportPDFBase64,
  generateHIPAAReportJSONBase64,
} from "@/lib/hipaaReport";
import { buildWebhookPayload, sendHIPAAReportToWebhook } from "@/lib/webhook";

// Assessment draft state shape
interface AssessmentDraft {
  useCaseName: string;
  organizationType: string;
  aiFunction: string;
  phiInvolved: string;
  phiTypes: string[];
  vendors: VendorDraft[];
  loggingBehavior: string;
  environment: string;
  retentionPeriodDefined: string;
  accessControlsDocumented: string;
}

const initialDraft: AssessmentDraft = {
  useCaseName: "",
  organizationType: "",
  aiFunction: "",
  phiInvolved: "",
  phiTypes: [""],
  vendors: [createEmptyVendor()],
  loggingBehavior: "",
  environment: "",
  retentionPeriodDefined: "",
  accessControlsDocumented: "",
};

export default function AssessmentPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);

  // Local state for assessment draft
  const [draft, setDraft] = useState<AssessmentDraft>(initialDraft);

  // Review state - when true, inputs become read-only
  const [isReviewReady, setIsReviewReady] = useState(false);

  // Assessment results from kernel
  const [assessmentResult, setAssessmentResult] = useState<HIPAAFindings | null>(null);
  const [assessmentProfile, setAssessmentProfile] = useState<HIPAAUseCaseProfile | null>(null);
  const [assessmentVendors, setAssessmentVendors] = useState<VendorPHIMetadata[]>([]);

  // Email modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");

  // Execute kernel and navigate to review
  const handleReviewClick = () => {
    const profile = mapDraftToHIPAAProfile(draft);
    const vendors = createVendorMetadata(profile, draft.vendors);
    const findings = auditHIPAA(profile, vendors);
    setAssessmentProfile(profile);
    setAssessmentVendors(vendors);
    setAssessmentResult(findings);
    setIsReviewReady(true);
    scrollToSection(6);
  };

  const updateDraft = (field: keyof AssessmentDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const updatePhiTypes = (newPhiTypes: string[]) => {
    setDraft((prev) => ({ ...prev, phiTypes: newPhiTypes }));
  };

  const updateVendors = (newVendors: VendorDraft[]) => {
    setDraft((prev) => ({ ...prev, vendors: newVendors }));
  };

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const sectionWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: sectionWidth * index,
        behavior: "smooth",
      });
      setCurrentSection(index);
    }
  };

  // Handle export request from ResultsSection - opens email modal
  const handleExportRequested = (format: ExportFormat) => {
    setExportFormat(format);
    setEmailModalOpen(true);
  };

  // Handle email submission - generates report and sends to webhook
  const handleEmailSubmit = async (email: string, companyName?: string) => {
    if (!assessmentProfile || !assessmentResult) {
      throw new Error("Assessment data not available");
    }

    // Generate the report
    const report = generateHIPAAComplianceReport(assessmentProfile, assessmentVendors, assessmentResult);

    // Generate the file as base64
    let attachment: { base64: string; filename: string; mimeType: string };
    if (exportFormat === "pdf") {
      attachment = await generateHIPAAReportPDFBase64(report);
    } else {
      attachment = generateHIPAAReportJSONBase64(report);
    }

    // Build and send the webhook payload
    const payload = buildWebhookPayload(report, email, companyName, exportFormat, attachment);
    await sendHIPAAReportToWebhook(payload);
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-blue-900/20 via-background to-orange-900/20" />

      <div
        ref={scrollContainerRef}
        className="relative z-10 flex h-screen overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Hero Section */}
        <section className="flex min-h-screen w-screen shrink-0 flex-col justify-center px-6 pb-24 pt-8 md:justify-end md:px-12 md:pb-24 md:pt-16">
          <div className="max-w-3xl">
            <div className="mb-2 inline-block rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md md:mb-4">
              <p className="font-mono text-xs text-foreground/90">Check AI Use Case</p>
            </div>
            <h1 className="mb-3 font-sans text-5xl font-light leading-[1.1] tracking-tight text-foreground md:mb-6 md:text-7xl lg:text-8xl">
              <span className="text-balance">HIPAA AI Risk Assessment</span>
            </h1>
            <p className="mb-4 max-w-xl text-base leading-relaxed text-foreground/90 md:mb-8 md:text-xl">
              <span className="text-pretty">
                Evaluate AI use cases that may process PHI using a deterministic, rules-based HIPAA risk assessment.
                Free to run. No signup required. Generate an auditor-ready report grounded in HIPAA Security Rule (45
                CFR §164) and NIST-aligned guidance.
              </span>
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:gap-4">
              <MagneticButton size="lg" variant="primary" onClick={() => scrollToSection(2)}>
                Start Free Assessment
              </MagneticButton>
              <MagneticButton size="lg" variant="secondary" onClick={() => scrollToSection(1)}>
                How This Works
              </MagneticButton>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:bottom-8">
            <div className="flex flex-col items-center gap-1 md:gap-2">
              <p className="px-4 text-center font-mono text-xs text-foreground/50">
                HIPAA AI risk assessment beta — deterministic, rules-based, not legal advice.
              </p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs text-foreground/80">Scroll to explore</p>
                <div className="flex h-6 w-12 items-center justify-center rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-foreground/80" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: How it Works */}
        <ServicesSection />

        {/* Section 2: Use Case Definition */}
        <WorkSection
          useCaseName={draft.useCaseName}
          organizationType={draft.organizationType}
          onUseCaseNameChange={(v) => updateDraft("useCaseName", v)}
          onOrganizationTypeChange={(v) => updateDraft("organizationType", v)}
          isReviewReady={isReviewReady}
          onNext={() => scrollToSection(3)}
        />

        {/* Section 3: AI Function */}
        <AiFunctionSection
          aiFunction={draft.aiFunction}
          onAiFunctionChange={(v) => updateDraft("aiFunction", v)}
          isReviewReady={isReviewReady}
          onNext={() => scrollToSection(4)}
        />

        {/* Section 4: PHI Involvement */}
        <AboutSection
          phiInvolved={draft.phiInvolved}
          onPhiInvolvedChange={(v) => updateDraft("phiInvolved", v)}
          isReviewReady={isReviewReady}
          onNext={() => scrollToSection(5)}
        />

        {/* Section 5: Data Handling */}
        <ContactSection
          phiTypes={draft.phiTypes}
          vendors={draft.vendors}
          loggingBehavior={draft.loggingBehavior}
          environment={draft.environment}
          retentionPeriodDefined={draft.retentionPeriodDefined}
          accessControlsDocumented={draft.accessControlsDocumented}
          onPhiTypesChange={updatePhiTypes}
          onVendorsChange={updateVendors}
          onLoggingBehaviorChange={(v) => updateDraft("loggingBehavior", v)}
          onEnvironmentChange={(v) => updateDraft("environment", v)}
          onRetentionPeriodDefinedChange={(v) => updateDraft("retentionPeriodDefined", v)}
          onAccessControlsDocumentedChange={(v) => updateDraft("accessControlsDocumented", v)}
          isReviewReady={isReviewReady}
          onReviewClick={handleReviewClick}
        />

        {/* Section 6: Review Assessment */}
        <ReviewSection
          useCaseName={draft.useCaseName}
          organizationType={draft.organizationType}
          aiFunction={draft.aiFunction}
          phiInvolved={draft.phiInvolved}
          vendors={draft.vendors}
          loggingBehavior={draft.loggingBehavior}
          onViewResults={() => scrollToSection(7)}
        />

        {/* Section 7: Results (email-gated exports) */}
        <ResultsSection
          findings={assessmentResult}
          profile={assessmentProfile}
          vendors={assessmentVendors}
          onExportRequested={handleExportRequested}
        />
      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        format={exportFormat}
        onSubmit={handleEmailSubmit}
      />

      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
}
