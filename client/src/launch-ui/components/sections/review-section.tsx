import { useReveal } from "../../hooks/use-reveal"
import { MagneticButton } from "../magnetic-button"
import type { VendorDraft } from "./contact-section"

interface ReviewSectionProps {
  useCaseName: string
  organizationType: string
  aiFunction: string
  phiInvolved: string
  vendors: VendorDraft[]
  loggingBehavior: string
  onViewResults: () => void
}

export function ReviewSection({
  useCaseName,
  organizationType,
  aiFunction,
  phiInvolved,
  vendors,
  loggingBehavior,
  onViewResults,
}: ReviewSectionProps) {
  const { ref, isVisible } = useReveal(0.3)

  const formatOrgType = (value: string) => {
    const labels: Record<string, string> = {
      covered_entity: "Covered Entity",
      business_associate: "Business Associate",
      other: "Other",
      not_sure: "Not Sure",
    }
    return labels[value] || value || "Not specified"
  }

  const formatAiFunction = (value: string) => {
    const labels: Record<string, string> = {
      chatbot: "Chatbot",
      transcription: "Transcription",
      summarization: "Summarization",
      intake: "Intake",
      other: "Other",
    }
    return labels[value] || value || "Not specified"
  }

  const formatPhiInvolved = (value: string) => {
    const labels: Record<string, string> = {
      yes: "Yes",
      no: "No",
      not_sure: "Not Sure",
    }
    return labels[value] || value || "Not specified"
  }

  const formatLogging = (value: string) => {
    const labels: Record<string, string> = {
      logs_phi: "Logs PHI",
      does_not_log: "Does Not Log PHI",
      unknown: "Unknown",
    }
    return labels[value] || value || "Not specified"
  }

  const vendorCount = vendors.filter((v) => v.vendor_name.trim() !== "").length

  const summaryItems = [
    { label: "Use Case Name", value: useCaseName || "Not specified" },
    { label: "Organization Type", value: formatOrgType(organizationType) },
    { label: "AI Function", value: formatAiFunction(aiFunction) },
    { label: "PHI Involved", value: formatPhiInvolved(phiInvolved) },
    { label: "Vendors", value: vendorCount > 0 ? `${vendorCount} vendor${vendorCount > 1 ? "s" : ""}` : "None specified" },
    { label: "Logging Behavior", value: formatLogging(loggingBehavior) },
  ]

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-6 pt-12 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`mb-8 transition-all duration-700 md:mb-12 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Review Assessment
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">
            / Your inputs have been collected and are ready for evaluation
          </p>
        </div>

        <div
          className={`mb-8 max-w-2xl transition-all duration-700 md:mb-12 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "150ms" }}
        >
          <p className="text-sm leading-relaxed text-foreground/70 md:text-base">
            The following information will be used to generate your HIPAA risk assessment.
            Please review the summary below before proceeding.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">
          {summaryItems.map((item, i) => (
            <div
              key={item.label}
              className={`border-l border-foreground/30 pl-4 transition-all duration-700 md:pl-6 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
              }`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <div className="font-mono text-xs text-foreground/50 md:text-sm">{item.label}</div>
              <div className="mt-1 text-base text-foreground md:text-lg">{item.value}</div>
            </div>
          ))}
        </div>

        <div
          className={`mt-12 transition-all duration-700 md:mt-16 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          <MagneticButton variant="primary" size="lg" onClick={onViewResults}>
            View Results
          </MagneticButton>
          <p className="mt-4 font-mono text-xs text-foreground/50">
            Click to see your preliminary assessment results
          </p>
        </div>
      </div>
    </section>
  )
}
