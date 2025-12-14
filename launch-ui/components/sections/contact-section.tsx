"use client"

import { useReveal } from "@/hooks/use-reveal"
import { MagneticButton } from "@/components/magnetic-button"
import { useRef } from "react"

// Vendor intake shape - matches kernel VendorPHIMetadata contract
export interface VendorDraft {
  vendor_name: string
  baa_available: "yes" | "no" | "unknown" | ""
  storage_behavior: "none" | "transient" | "stored" | "unknown" | ""
  logging_enabled: "yes" | "no" | "unknown" | ""
}

export const createEmptyVendor = (): VendorDraft => ({
  vendor_name: "",
  baa_available: "",
  storage_behavior: "",
  logging_enabled: "",
})

interface ContactSectionProps {
  phiTypes: string[]
  vendors: VendorDraft[]
  loggingBehavior: string
  environment: string
  retentionPeriodDefined: string
  accessControlsDocumented: string
  onPhiTypesChange: (values: string[]) => void
  onVendorsChange: (values: VendorDraft[]) => void
  onLoggingBehaviorChange: (value: string) => void
  onEnvironmentChange: (value: string) => void
  onRetentionPeriodDefinedChange: (value: string) => void
  onAccessControlsDocumentedChange: (value: string) => void
  isReviewReady: boolean
  onReviewClick: () => void
}

export function ContactSection({
  phiTypes,
  vendors,
  loggingBehavior,
  environment,
  retentionPeriodDefined,
  accessControlsDocumented,
  onPhiTypesChange,
  onVendorsChange,
  onLoggingBehaviorChange,
  onEnvironmentChange,
  onRetentionPeriodDefinedChange,
  onAccessControlsDocumentedChange,
  isReviewReady,
  onReviewClick,
}: ContactSectionProps) {
  const { ref, isVisible } = useReveal(0.3)
  const phiInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const vendorInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Global logging behavior options
  const loggingOptions = [
    { value: "", label: "Select logging behavior..." },
    { value: "logs_phi", label: "Logs PHI (retained)" },
    { value: "does_not_log", label: "Does Not Log PHI" },
    { value: "unknown", label: "Unknown" },
  ]

  const environmentOptions = [
    { value: "", label: "Select environment..." },
    { value: "prod", label: "Production" },
    { value: "staging", label: "Staging" },
    { value: "dev", label: "Development" },
  ]

  // Vendor-specific dropdown options - match kernel enums exactly
  const baaOptions = [
    { value: "", label: "Select BAA status..." },
    { value: "yes", label: "Yes - BAA available" },
    { value: "no", label: "No - No BAA" },
    { value: "unknown", label: "Unknown" },
  ]

  const storageOptions = [
    { value: "", label: "Select storage behavior..." },
    { value: "none", label: "None (does not store PHI)" },
    { value: "transient", label: "Transient (temporary processing only)" },
    { value: "stored", label: "Stored (retains PHI)" },
    { value: "unknown", label: "Unknown" },
  ]

  const vendorLoggingOptions = [
    { value: "", label: "Select vendor logging..." },
    { value: "yes", label: "Yes - Logging enabled" },
    { value: "no", label: "No - Logging disabled" },
    { value: "unknown", label: "Unknown" },
  ]

  // Global safeguard options - required for LOW path reachability
  const retentionOptions = [
    { value: "", label: "Select retention status..." },
    { value: "yes", label: "Yes - Retention period defined" },
    { value: "no", label: "No - Not defined" },
    { value: "unknown", label: "Unknown" },
  ]

  const accessControlsOptions = [
    { value: "", label: "Select access controls status..." },
    { value: "yes", label: "Yes - Access controls documented" },
    { value: "no", label: "No - Not documented" },
    { value: "unknown", label: "Unknown" },
  ]

  const updatePhiType = (index: number, value: string) => {
    const newPhiTypes = [...phiTypes]
    newPhiTypes[index] = value
    onPhiTypesChange(newPhiTypes)
  }

  const addPhiType = () => {
    const newPhiTypes = [...phiTypes, ""]
    onPhiTypesChange(newPhiTypes)
    setTimeout(() => {
      phiInputRefs.current[newPhiTypes.length - 1]?.focus()
    }, 0)
  }

  const updateVendorField = (index: number, field: keyof VendorDraft, value: string) => {
    const newVendors = [...vendors]
    newVendors[index] = { ...newVendors[index], [field]: value }
    onVendorsChange(newVendors)
  }

  const addVendor = () => {
    const newVendors = [...vendors, createEmptyVendor()]
    onVendorsChange(newVendors)
    setTimeout(() => {
      vendorInputRefs.current[newVendors.length - 1]?.focus()
    }, 0)
  }

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start flex-col justify-between px-4 py-3 md:justify-center md:px-12 md:py-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl flex-1 md:flex-initial">
        <div className="grid gap-2 md:grid-cols-[1.2fr_1fr] md:gap-16 lg:gap-24">
          {/* Left side - Header and text inputs */}
          <div className="flex flex-col">
            <div
              className={`mb-1.5 transition-all duration-700 md:mb-12 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
              }`}
            >
              <h2 className="mb-0.5 font-sans text-xl font-light leading-none tracking-tight text-foreground md:mb-3 md:text-7xl lg:text-8xl">
                Data Handling
              </h2>
              <p className="font-mono text-[9px] text-foreground/60 md:text-base">/ Vendor and data flow</p>
            </div>

            <div className="space-y-1.5 md:space-y-6">
              {/* PHI Types - Compact on mobile */}
              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <label className="mb-0.5 block font-mono text-[9px] text-foreground/60 md:mb-2 md:text-xs">
                  PHI Types
                </label>
                <div className="space-y-0.5 md:space-y-3">
                  {phiTypes.map((phiType, index) => (
                    <input
                      key={index}
                      ref={(el) => { phiInputRefs.current[index] = el }}
                      type="text"
                      value={phiType}
                      onChange={(e) => updatePhiType(index, e.target.value)}
                      disabled={isReviewReady}
                      className={`w-full border-b border-foreground/30 bg-transparent py-0.5 text-xs text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                      placeholder={index === 0 ? "e.g., Names, DOB, Records" : "Add another..."}
                    />
                  ))}
                </div>
                {!isReviewReady && (
                  <button
                    type="button"
                    onClick={addPhiType}
                    className="mt-0.5 font-mono text-[9px] text-foreground/50 transition-opacity hover:opacity-80 md:mt-2 md:text-xs"
                  >
                    + Add PHI type
                  </button>
                )}
              </div>

              {/* Vendors Section - Compact on mobile */}
              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "350ms" }}
              >
                <label className="mb-0.5 block font-mono text-[9px] text-foreground/60 md:mb-2 md:text-xs">
                  AI Vendors
                </label>
                <div className="space-y-1 md:space-y-4">
                  {vendors.map((vendor, index) => (
                    <div key={index} className="rounded border border-foreground/20 bg-foreground/5 p-1.5 md:p-3">
                      <input
                        ref={(el) => { vendorInputRefs.current[index] = el }}
                        type="text"
                        value={vendor.vendor_name}
                        onChange={(e) => updateVendorField(index, "vendor_name", e.target.value)}
                        disabled={isReviewReady}
                        className={`mb-1 w-full border-b border-foreground/30 bg-transparent py-0 text-xs text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:mb-3 md:py-1 md:text-sm ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                        placeholder="Vendor name"
                      />
                      <div className="grid grid-cols-3 gap-0.5 md:gap-2">
                        <select
                          value={vendor.baa_available}
                          onChange={(e) => updateVendorField(index, "baa_available", e.target.value)}
                          disabled={isReviewReady}
                          className={`w-full border-b border-foreground/30 bg-transparent py-0 text-[9px] text-foreground focus:border-foreground/50 focus:outline-none md:py-1 md:text-xs ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {baaOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={vendor.storage_behavior}
                          onChange={(e) => updateVendorField(index, "storage_behavior", e.target.value)}
                          disabled={isReviewReady}
                          className={`w-full border-b border-foreground/30 bg-transparent py-0 text-[9px] text-foreground focus:border-foreground/50 focus:outline-none md:py-1 md:text-xs ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {storageOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={vendor.logging_enabled}
                          onChange={(e) => updateVendorField(index, "logging_enabled", e.target.value)}
                          disabled={isReviewReady}
                          className={`w-full border-b border-foreground/30 bg-transparent py-0 text-[9px] text-foreground focus:border-foreground/50 focus:outline-none md:py-1 md:text-xs ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {vendorLoggingOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                {!isReviewReady && (
                  <button
                    type="button"
                    onClick={addVendor}
                    className="mt-0.5 font-mono text-[9px] text-foreground/50 transition-opacity hover:opacity-80 md:mt-2 md:text-xs"
                  >
                    + Add vendor
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Operational Controls */}
          <div className="flex flex-col">
            <p className="mb-0.5 font-mono text-[9px] uppercase tracking-wider text-foreground/40 md:hidden">
              Operational Controls
            </p>

            {/* 2x2 grid for dropdowns on mobile - tighter spacing */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 md:grid-cols-1 md:space-y-6">
              <div className={`transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
                <label className="mb-0 block font-mono text-[9px] text-foreground/60 md:mb-2 md:text-xs">
                  Logging
                </label>
                <select
                  value={loggingBehavior}
                  onChange={(e) => onLoggingBehaviorChange(e.target.value)}
                  disabled={isReviewReady}
                  className={`w-full border-b border-foreground/30 bg-transparent py-0.5 text-[10px] text-foreground focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {loggingOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-background text-foreground">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
                <label className="mb-0 block font-mono text-[9px] text-foreground/60 md:mb-2 md:text-xs">
                  Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => onEnvironmentChange(e.target.value)}
                  disabled={isReviewReady}
                  className={`w-full border-b border-foreground/30 bg-transparent py-0.5 text-[10px] text-foreground focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {environmentOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-background text-foreground">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
                <label className="mb-0 block font-mono text-[9px] text-foreground/60 md:mb-2 md:text-xs">
                  Retention?
                </label>
                <select
                  value={retentionPeriodDefined}
                  onChange={(e) => onRetentionPeriodDefinedChange(e.target.value)}
                  disabled={isReviewReady}
                  className={`w-full border-b border-foreground/30 bg-transparent py-0.5 text-[10px] text-foreground focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {retentionOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-background text-foreground">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
                <label className="mb-0 block font-mono text-[9px] text-foreground/60 md:mb-2 md:text-xs">
                  Access Ctrl?
                </label>
                <select
                  value={accessControlsDocumented}
                  onChange={(e) => onAccessControlsDocumentedChange(e.target.value)}
                  disabled={isReviewReady}
                  className={`w-full border-b border-foreground/30 bg-transparent py-0.5 text-[10px] text-foreground focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {accessControlsOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-background text-foreground">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA anchored to bottom - tighter padding */}
      <div
        className={`mx-auto w-full max-w-7xl border-t border-foreground/10 pt-2 transition-all duration-700 md:mt-16 md:border-0 md:pt-6 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
        style={{ transitionDelay: "500ms" }}
      >
        <MagneticButton
          variant="primary"
          size="lg"
          className={`w-full md:w-auto ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={isReviewReady ? undefined : onReviewClick}
        >
          {isReviewReady ? "Assessment Submitted" : "Review Assessment"}
        </MagneticButton>
        <p className="mt-0.5 text-center font-mono text-[9px] text-foreground/50 md:mt-3 md:text-left md:text-xs">
          {isReviewReady ? "Scroll right to view summary" : "Local state only — no data sent"}
        </p>
      </div>
    </section>
  )
}
