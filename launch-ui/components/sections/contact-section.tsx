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
      className="flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-12 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-16 lg:gap-24">
          {/* Left side - Header and text inputs */}
          <div className="flex flex-col justify-center">
            <div
              className={`mb-6 transition-all duration-700 md:mb-12 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
              }`}
            >
              <h2 className="mb-2 font-sans text-4xl font-light leading-[1.05] tracking-tight text-foreground md:mb-3 md:text-7xl lg:text-8xl">
                Data
                <br />
                Handling
              </h2>
              <p className="font-mono text-xs text-foreground/60 md:text-base">/ Vendor and data flow details</p>
            </div>

            <div className="space-y-4 md:space-y-6">
              {/* PHI Types Inputs */}
              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">
                  PHI Types
                </label>
                <div className="space-y-3">
                  {phiTypes.map((phiType, index) => (
                    <input
                      key={index}
                      ref={(el) => { phiInputRefs.current[index] = el }}
                      type="text"
                      value={phiType}
                      onChange={(e) => updatePhiType(index, e.target.value)}
                      disabled={isReviewReady}
                      className={`w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                      placeholder={index === 0 ? "e.g., Names, DOB, Medical Records" : "Add another PHI type..."}
                    />
                  ))}
                </div>
                {!isReviewReady && (
                  <button
                    type="button"
                    onClick={addPhiType}
                    className="mt-2 font-mono text-xs text-foreground/50 transition-opacity hover:opacity-80"
                  >
                    + Add PHI type
                  </button>
                )}
              </div>

              {/* Vendors Section - Full kernel-aligned intake */}
              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "350ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">
                  AI Vendors / Third Parties
                </label>
                <div className="space-y-4">
                  {vendors.map((vendor, index) => (
                    <div key={index} className="rounded border border-foreground/20 bg-foreground/5 p-3">
                      {/* Vendor Name */}
                      <input
                        ref={(el) => { vendorInputRefs.current[index] = el }}
                        type="text"
                        value={vendor.vendor_name}
                        onChange={(e) => updateVendorField(index, "vendor_name", e.target.value)}
                        disabled={isReviewReady}
                        className={`mb-3 w-full border-b border-foreground/30 bg-transparent py-1 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                        placeholder={index === 0 ? "Vendor name (e.g., OpenAI)" : "Vendor name"}
                      />
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                        {/* BAA Available */}
                        <select
                          value={vendor.baa_available}
                          onChange={(e) => updateVendorField(index, "baa_available", e.target.value)}
                          disabled={isReviewReady}
                          className={`w-full border-b border-foreground/30 bg-transparent py-1 text-xs text-foreground focus:border-foreground/50 focus:outline-none ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {baaOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {/* Storage Behavior */}
                        <select
                          value={vendor.storage_behavior}
                          onChange={(e) => updateVendorField(index, "storage_behavior", e.target.value)}
                          disabled={isReviewReady}
                          className={`w-full border-b border-foreground/30 bg-transparent py-1 text-xs text-foreground focus:border-foreground/50 focus:outline-none ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {storageOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {/* Logging Enabled */}
                        <select
                          value={vendor.logging_enabled}
                          onChange={(e) => updateVendorField(index, "logging_enabled", e.target.value)}
                          disabled={isReviewReady}
                          className={`w-full border-b border-foreground/30 bg-transparent py-1 text-xs text-foreground focus:border-foreground/50 focus:outline-none ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
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
                    className="mt-2 font-mono text-xs text-foreground/50 transition-opacity hover:opacity-80"
                  >
                    + Add vendor
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Dropdowns */}
          <div className="flex flex-col justify-center">
            <div className="space-y-4 md:space-y-6">
              {/* Logging Behavior Dropdown */}
              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">
                  Logging Behavior
                </label>
                <select
                  value={loggingBehavior}
                  onChange={(e) => onLoggingBehaviorChange(e.target.value)}
                  disabled={isReviewReady}
                  className={`w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {loggingOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-background text-foreground">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Environment Dropdown */}
              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "350ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">
                  Deployment Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => onEnvironmentChange(e.target.value)}
                  disabled={isReviewReady}
                  className={`w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {environmentOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-background text-foreground">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Retention Period Defined Dropdown */}
              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "450ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">
                  Data Retention Period Defined?
                </label>
                <select
                  value={retentionPeriodDefined}
                  onChange={(e) => onRetentionPeriodDefinedChange(e.target.value)}
                  disabled={isReviewReady}
                  className={`w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {retentionOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-background text-foreground">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Access Controls Documented Dropdown */}
              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "550ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">
                  Access Controls Documented?
                </label>
                <select
                  value={accessControlsDocumented}
                  onChange={(e) => onAccessControlsDocumentedChange(e.target.value)}
                  disabled={isReviewReady}
                  className={`w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {accessControlsOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-background text-foreground">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div
                className={`pt-4 transition-all duration-700 md:pt-6 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "500ms" }}
              >
                <MagneticButton
                  variant="primary"
                  size="lg"
                  className={`w-full ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                  onClick={isReviewReady ? undefined : onReviewClick}
                >
                  {isReviewReady ? "Assessment Submitted" : "Review Assessment"}
                </MagneticButton>
                <p className="mt-3 text-center font-mono text-xs text-foreground/50">
                  {isReviewReady ? "Scroll right to view summary" : "Local state only — no data is sent"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
