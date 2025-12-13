"use client"

import { useReveal } from "@/hooks/use-reveal"
import { MagneticButton } from "@/components/magnetic-button"

interface AiFunctionSectionProps {
  aiFunction: string
  onAiFunctionChange: (value: string) => void
  isReviewReady: boolean
  onNext: () => void
}

export function AiFunctionSection({
  aiFunction,
  onAiFunctionChange,
  isReviewReady,
  onNext,
}: AiFunctionSectionProps) {
  const { ref, isVisible } = useReveal(0.3)

  const aiFunctionOptions = [
    { value: "", label: "Select AI function..." },
    { value: "chatbot", label: "Chatbot" },
    { value: "transcription", label: "Transcription" },
    { value: "summarization", label: "Summarization" },
    { value: "intake", label: "Intake" },
    { value: "other", label: "Other" },
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
            AI Function
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">
            / Define how AI is used in your workflow
          </p>
        </div>

        <div
          className={`max-w-md transition-all duration-700 ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">
            Primary AI Function
          </label>
          <select
            value={aiFunction}
            onChange={(e) => onAiFunctionChange(e.target.value)}
            disabled={isReviewReady}
            className={`w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {aiFunctionOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-background text-foreground">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Next Button */}
        <div
          className={`mt-8 max-w-md transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "350ms" }}
        >
          <MagneticButton variant="secondary" size="lg" onClick={onNext}>
            Next
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
