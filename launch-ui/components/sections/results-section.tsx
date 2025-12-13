"use client"

import { useReveal } from "@/hooks/use-reveal"
import { MagneticButton } from "@/components/magnetic-button"
import { useState } from "react"
import type { HIPAAFindings, HIPAAUseCaseProfile, VendorPHIMetadata } from "@/lib/hipaaTypes"
import { generateHIPAAComplianceReport, exportHIPAAReportAsPDF } from "@/lib/hipaaReport"

interface ResultsSectionProps {
  findings: HIPAAFindings | null
  profile: HIPAAUseCaseProfile | null
  vendors: VendorPHIMetadata[]
}

export function ResultsSection({ findings, profile, vendors }: ResultsSectionProps) {
  const { ref, isVisible } = useReveal(0.3)
  const [ctaMessage, setCtaMessage] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!findings || !profile) {
      setCtaMessage("Assessment data not available. Please complete the intake form.")
      return
    }

    setIsDownloading(true)
    setCtaMessage("Generating PDF report...")

    try {
      const report = generateHIPAAComplianceReport(profile, vendors, findings)
      await exportHIPAAReportAsPDF(report, profile.use_case_name)
      setCtaMessage("PDF downloaded successfully.")
    } catch (error) {
      console.error("PDF generation failed:", error)
      setCtaMessage("Failed to generate PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Map kernel risk classification to display format
  const mapRiskToDisplay = (classification: string): "HIGH" | "NEEDS_REVIEW" | "LOW" => {
    switch (classification) {
      case "High Risk":
        return "HIGH"
      case "Needs Review":
        return "NEEDS_REVIEW"
      case "Low Risk":
        return "LOW"
      default:
        return "NEEDS_REVIEW"
    }
  }

  // Map kernel riskContribution to display severity
  const mapSeverityToDisplay = (contribution: string): "HIGH" | "NEEDS_REVIEW" | "LOW" => {
    switch (contribution) {
      case "high":
        return "HIGH"
      case "needs_review":
        return "NEEDS_REVIEW"
      case "low":
        return "LOW"
      default:
        return "NEEDS_REVIEW"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "HIGH":
        return "text-red-400 border-red-400/30"
      case "NEEDS_REVIEW":
        return "text-amber-400 border-amber-400/30"
      case "LOW":
        return "text-green-400 border-green-400/30"
      default:
        return "text-foreground/60 border-foreground/30"
    }
  }

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "HIGH":
        return "HIGH RISK"
      case "NEEDS_REVIEW":
        return "NEEDS REVIEW"
      case "LOW":
        return "LOW RISK"
      default:
        return risk
    }
  }

  // Handle no findings case
  if (!findings) {
    return (
      <section
        ref={ref}
        className="flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-8 md:px-12 md:pt-0 lg:px-16"
      >
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-foreground/60">No assessment results available. Please complete the intake form.</p>
        </div>
      </section>
    )
  }

  const finalRisk = mapRiskToDisplay(findings.riskClassification)
  const triggeredRules = findings.triggeredRules.map((rule) => ({
    id: rule.id,
    severity: mapSeverityToDisplay(rule.riskContribution),
    title: rule.description,
  }))

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-8 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Header - compact on mobile */}
        <div
          className={`mb-4 transition-all duration-700 md:mb-12 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            <h2 className="font-sans text-3xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Assessment Results
            </h2>
            <span className="rounded border border-foreground/20 bg-foreground/10 px-2 py-0.5 font-mono text-xs text-foreground/60">
              Beta release
            </span>
          </div>
          <p className="font-mono text-xs text-foreground/60 md:text-base">
            / Preliminary results based on provided inputs
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* Left side - Risk Summary */}
          <div>
            {/* Risk Banner - compact on mobile */}
            <div
              className={`mb-3 transition-all duration-700 md:mb-8 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="font-mono text-xs text-foreground/50 mb-1 md:mb-2">Final Risk Level</div>
              <div
                className={`inline-block border px-3 py-1.5 font-mono text-base md:px-4 md:py-2 md:text-xl ${getRiskColor(finalRisk)}`}
              >
                {getRiskLabel(finalRisk)}
              </div>
            </div>

            {/* Status - compact on mobile */}
            <div
              className={`mb-3 transition-all duration-700 md:mb-8 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
              }`}
              style={{ transitionDelay: "350ms" }}
            >
              <div className="font-mono text-xs text-foreground/50 mb-1 md:mb-2">Compliance Status</div>
              <div className="text-lg text-foreground md:text-2xl font-light">
                {findings.statusFlag}
              </div>
            </div>

            {/* Explanation - hidden on mobile to save space */}
            <div
              className={`hidden transition-all duration-700 md:block ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              <p className="max-w-md text-sm leading-relaxed text-foreground/70 md:text-base">
                This assessment identified safeguards that require additional review or documentation
                before the AI use case can be considered compliant with HIPAA Security Rule requirements.
              </p>
            </div>
          </div>

          {/* Right side - Triggered Rules - compact on mobile */}
          <div>
            <div
              className={`mb-2 transition-all duration-700 md:mb-4 ${
                isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="font-mono text-xs text-foreground/50">Triggered Safeguards</div>
            </div>

            <div className="space-y-2 md:space-y-4">
              {triggeredRules.map((rule, i) => (
                <div
                  key={rule.id}
                  className={`border-l border-foreground/30 pl-3 transition-all duration-700 md:pl-6 ${
                    isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                  }`}
                  style={{ transitionDelay: `${300 + i * 100}ms` }}
                >
                  <div className="flex items-center gap-2 md:block">
                    <div className={`font-mono text-xs ${getRiskColor(rule.severity).split(' ')[0]}`}>{rule.id}</div>
                    <div className="text-sm text-foreground md:mt-1 md:text-lg">{rule.title}</div>
                  </div>
                  <div className="hidden font-mono text-xs text-foreground/50 md:mt-1 md:block">
                    Severity: {rule.severity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTAs Section - compact on mobile */}
        <div
          className={`mt-4 transition-all duration-700 md:mt-16 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="border-t border-foreground/20 pt-4 md:pt-8">
            {/* CTA Buttons Group - stacked tight on mobile */}
            <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-4">
              {/* Primary CTA - Download Report (ACTIVE) */}
              <MagneticButton
                variant="primary"
                size="lg"
                className="text-sm md:text-base"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
              >
                {isDownloading ? "Generating..." : "Download Full Report (PDF)"}
              </MagneticButton>

              {/* Secondary CTA - Remediation Guidance (GATED) */}
              <MagneticButton
                variant="secondary"
                size="lg"
                className="text-sm md:text-base"
                onClick={() => setCtaMessage("Remediation guidance will be available next.")}
              >
                View Remediation Guidance
              </MagneticButton>

              {/* Tertiary CTA - Explain Findings (GATED) */}
              <button
                type="button"
                onClick={() => setCtaMessage("Explainability will be enabled next.")}
                className="py-1 font-mono text-xs text-foreground/60 transition-opacity hover:opacity-80 hover:text-foreground/80 md:text-sm"
              >
                Ask why this was flagged
              </button>
            </div>

            {/* CTA Helper Message */}
            {ctaMessage && (
              <p className="mt-2 font-mono text-xs text-foreground/50 md:mt-4">
                {ctaMessage}
              </p>
            )}

            {/* Combined Helper Text - inline on mobile */}
            <p className="mt-3 font-mono text-xs text-foreground/40 md:mt-6">
              Download generates a HIPAA AI Risk Assessment PDF based on the results above.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
