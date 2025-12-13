"use client"

import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { WorkSection } from "@/components/sections/work-section"
import { ServicesSection } from "@/components/sections/services-section"
import { AiFunctionSection } from "@/components/sections/ai-function-section"
import { AboutSection } from "@/components/sections/about-section"
import { ContactSection, type VendorDraft, createEmptyVendor } from "@/components/sections/contact-section"
import { ReviewSection } from "@/components/sections/review-section"
import { ResultsSection } from "@/components/sections/results-section"
import { MagneticButton } from "@/components/magnetic-button"
import { useRef, useEffect, useState } from "react"
import { auditHIPAA } from "@/lib/hipaaAudit"
import { mapDraftToHIPAAProfile, createVendorMetadata } from "@/lib/mapDraftToProfile"
import type { HIPAAFindings, HIPAAUseCaseProfile, VendorPHIMetadata } from "@/lib/hipaaTypes"

// Assessment draft state shape
interface AssessmentDraft {
  useCaseName: string
  organizationType: string
  aiFunction: string
  phiInvolved: string
  phiTypes: string[]
  vendors: VendorDraft[]
  loggingBehavior: string
  environment: string
  retentionPeriodDefined: string
  accessControlsDocumented: string
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
}

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Local state for assessment draft
  const [draft, setDraft] = useState<AssessmentDraft>(initialDraft)

  // Review state - when true, inputs become read-only
  const [isReviewReady, setIsReviewReady] = useState(false)

  // Assessment results from kernel
  const [assessmentResult, setAssessmentResult] = useState<HIPAAFindings | null>(null)
  const [assessmentProfile, setAssessmentProfile] = useState<HIPAAUseCaseProfile | null>(null)
  const [assessmentVendors, setAssessmentVendors] = useState<VendorPHIMetadata[]>([])

  // Execute kernel and navigate to review
  const handleReviewClick = () => {
    const profile = mapDraftToHIPAAProfile(draft)
    // Pass draft.vendors directly to createVendorMetadata for 1-to-1 kernel mapping
    const vendors = createVendorMetadata(profile, draft.vendors)
    const findings = auditHIPAA(profile, vendors)
    setAssessmentProfile(profile)
    setAssessmentVendors(vendors)
    setAssessmentResult(findings)
    setIsReviewReady(true)
    scrollToSection(6)
  }

  const updateDraft = (field: keyof AssessmentDraft, value: string) => {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  const updatePhiTypes = (newPhiTypes: string[]) => {
    setDraft(prev => ({ ...prev, phiTypes: newPhiTypes }))
  }

  const updateVendors = (newVendors: VendorDraft[]) => {
    setDraft(prev => ({ ...prev, vendors: newVendors }))
  }
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const scrollThrottleRef = useRef<number>()

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 100)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const sectionWidth = scrollContainerRef.current.offsetWidth
      scrollContainerRef.current.scrollTo({
        left: sectionWidth * index,
        behavior: "smooth",
      })
      setCurrentSection(index)
    }
  }

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - touchStartY.current) > 10) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY
      const touchEndX = e.changedTouches[0].clientX
      const deltaY = touchStartY.current - touchEndY
      const deltaX = touchStartX.current - touchEndX

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentSection < 7) {
          scrollToSection(currentSection + 1)
        } else if (deltaY < 0 && currentSection > 0) {
          scrollToSection(currentSection - 1)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true })
      container.addEventListener("touchmove", handleTouchMove, { passive: false })
      container.addEventListener("touchend", handleTouchEnd, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()

        if (!scrollContainerRef.current) return

        scrollContainerRef.current.scrollBy({
          left: e.deltaY,
          behavior: "instant",
        })

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const scrollLeft = scrollContainerRef.current.scrollLeft
        const newSection = Math.round(scrollLeft / sectionWidth)

        if (newSection !== currentSection && newSection >= 0 && newSection <= 7) {
          setCurrentSection(newSection)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = undefined
          return
        }

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const scrollLeft = scrollContainerRef.current.scrollLeft
        const newSection = Math.round(scrollLeft / sectionWidth)

        if (newSection !== currentSection && newSection >= 0 && newSection <= 7) {
          setCurrentSection(newSection)
        }

        scrollThrottleRef.current = undefined
      })
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll)
      }
      if (scrollThrottleRef.current) {
        cancelAnimationFrame(scrollThrottleRef.current)
      }
    }
  }, [currentSection])

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <CustomCursor />
      <GrainOverlay />

      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full">
          <Swirl
            colorA="#1275d8"
            colorB="#e19136"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#0066ff"
            upColor="#0066ff"
            downColor="#d1d1d1"
            leftColor="#e19136"
            rightColor="#e19136"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div
        ref={scrollContainerRef}
        data-scroll-container
        className={`relative z-10 flex h-screen overflow-x-auto overflow-y-hidden transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Hero Section */}
        <section className="flex min-h-screen w-screen shrink-0 flex-col justify-center px-6 pb-24 pt-8 md:justify-end md:px-12 md:pb-24 md:pt-16">
          <div className="max-w-3xl">
            <div className="mb-2 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700 md:mb-4">
              <p className="font-mono text-xs text-foreground/90">Check AI Use Case </p>
            </div>
            <h1 className="mb-3 animate-in fade-in slide-in-from-bottom-8 font-sans text-5xl font-light leading-[1.1] tracking-tight text-foreground duration-1000 md:mb-6 md:text-7xl lg:text-8xl">
              <span className="text-balance">HIPAA AI Risk Assessment</span>
            </h1>
            <p className="mb-4 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-base leading-relaxed text-foreground/90 duration-1000 delay-200 md:mb-8 md:text-xl">
              <span className="text-pretty">
                Evaluate AI use cases that may process PHI using a deterministic, rules-based HIPAA risk assessment.
                Free to run. No signup required. Generate an auditor-ready report grounded in HIPAA Security Rule (45
                CFR §164) and NIST-aligned guidance.
              </span>
            </p>
            <div className="flex animate-in fade-in slide-in-from-bottom-4 flex-col gap-3 duration-1000 delay-300 sm:flex-row sm:items-center md:gap-4">
              <MagneticButton
                size="lg"
                variant="primary"
                onClick={() => scrollToSection(2)}
              >
                Start Free Assessment
              </MagneticButton>
              <MagneticButton size="lg" variant="secondary" onClick={() => scrollToSection(1)}>
                How This Works
              </MagneticButton>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-in fade-in duration-1000 delay-500 md:bottom-8">
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

        {/* Section 1: How it Works (informational only) */}
        <ServicesSection />

        {/* Section 2: Use Case Definition (first inputs) */}
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

        {/* Section 7: Results */}
        <ResultsSection
          findings={assessmentResult}
          profile={assessmentProfile}
          vendors={assessmentVendors}
        />
      </div>

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  )
}
