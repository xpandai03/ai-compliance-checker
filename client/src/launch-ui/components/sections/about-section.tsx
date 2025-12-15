import { MagneticButton } from "../magnetic-button"
import { useReveal } from "../../hooks/use-reveal"

interface AboutSectionProps {
  phiInvolved: string
  onPhiInvolvedChange: (value: string) => void
  isReviewReady: boolean
  onNext: () => void
}

export function AboutSection({
  phiInvolved,
  onPhiInvolvedChange,
  isReviewReady,
  onNext,
}: AboutSectionProps) {
  const { ref, isVisible } = useReveal(0.3)

  const phiOptions = [
    { value: "", label: "Select an option..." },
    { value: "yes", label: "Yes - PHI is processed by the AI" },
    { value: "no", label: "No - No PHI is involved" },
    { value: "not_sure", label: "Not Sure" },
  ]

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-6 pt-12 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* Left side - PHI Involvement */}
          <div>
            <div
              className={`mb-6 transition-all duration-700 md:mb-12 ${
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
              }`}
            >
              <h2 className="mb-2 font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
                PHI Involvement
              </h2>
              <p className="font-mono text-sm text-foreground/60 md:text-base">
                / Does this AI process Protected Health Information?
              </p>
            </div>

            <div
              className={`max-w-md transition-all duration-700 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">
                PHI Involvement
              </label>
              <select
                value={phiInvolved}
                onChange={(e) => onPhiInvolvedChange(e.target.value)}
                disabled={isReviewReady}
                className={`w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {phiOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-background text-foreground">
                    {option.label}
                  </option>
                ))}
              </select>
              {/* Compressed helper text - below input, smaller */}
              <p className="mt-2 text-xs leading-snug text-foreground/50 md:mt-3 md:text-sm">
                PHI: names, records, diagnoses, billing info that identifies individuals.
              </p>
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

          {/* Right side - PHI Examples (hidden on mobile) */}
          <div className="hidden flex-col justify-center space-y-12 md:flex">
            {[
              { value: "Names", label: "Patient names", sublabel: "Direct identifiers", direction: "right" },
              { value: "Records", label: "Medical records", sublabel: "Clinical data", direction: "left" },
              { value: "Billing", label: "Billing info", sublabel: "Financial PHI", direction: "right" },
            ].map((stat, i) => {
              const getRevealClass = () => {
                if (!isVisible) {
                  return stat.direction === "left" ? "-translate-x-16 opacity-0" : "translate-x-16 opacity-0"
                }
                return "translate-x-0 opacity-100"
              }

              return (
                <div
                  key={i}
                  className={`flex items-baseline gap-8 border-l border-foreground/30 pl-8 transition-all duration-700 ${getRevealClass()}`}
                  style={{
                    transitionDelay: `${400 + i * 150}ms`,
                    marginLeft: i % 2 === 0 ? "0" : "auto",
                    maxWidth: i % 2 === 0 ? "100%" : "85%",
                  }}
                >
                  <div className="text-4xl font-light text-foreground lg:text-5xl">{stat.value}</div>
                  <div>
                    <div className="font-sans text-xl font-light text-foreground">{stat.label}</div>
                    <div className="font-mono text-xs text-foreground/60">{stat.sublabel}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
