import { useReveal } from "../../hooks/use-reveal"
import { MagneticButton } from "../magnetic-button"

interface WorkSectionProps {
  useCaseName: string
  organizationType: string
  onUseCaseNameChange: (value: string) => void
  onOrganizationTypeChange: (value: string) => void
  isReviewReady: boolean
  onNext: () => void
}

export function WorkSection({
  useCaseName,
  organizationType,
  onUseCaseNameChange,
  onOrganizationTypeChange,
  isReviewReady,
  onNext,
}: WorkSectionProps) {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-6 pt-12 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`mb-12 transition-all duration-700 md:mb-16 ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Use Case
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">/ Define your AI use case context</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* Left side - Use Case Name */}
          <div className="flex flex-col justify-center">
            <div
              className={`transition-all duration-700 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">Use Case Name</label>
              <input
                type="text"
                value={useCaseName}
                onChange={(e) => onUseCaseNameChange(e.target.value)}
                disabled={isReviewReady}
                className={`w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="e.g., Patient Intake Chatbot"
              />
            </div>

            <div
              className={`mt-8 transition-all duration-700 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
              }`}
              style={{ transitionDelay: "350ms" }}
            >
              <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">Organization Type</label>
              <select
                value={organizationType}
                onChange={(e) => onOrganizationTypeChange(e.target.value)}
                disabled={isReviewReady}
                className={`w-full appearance-none border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none md:py-2 md:text-base ${isReviewReady ? "opacity-60 cursor-not-allowed" : ""}`}
                style={{ cursor: isReviewReady ? "not-allowed" : "pointer" }}
              >
                <option value="" className="bg-background text-foreground">Select type...</option>
                <option value="covered_entity" className="bg-background text-foreground">Covered Entity</option>
                <option value="business_associate" className="bg-background text-foreground">Business Associate</option>
                <option value="other" className="bg-background text-foreground">Other</option>
                <option value="not_sure" className="bg-background text-foreground">Not Sure</option>
              </select>
            </div>

            {/* Next Button */}
            <div
              className={`mt-8 transition-all duration-700 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              <MagneticButton variant="secondary" size="lg" onClick={onNext}>
                Next
              </MagneticButton>
            </div>
          </div>

          {/* Right side - Context */}
          <div className="flex flex-col justify-center">
            <div
              className={`space-y-3 transition-all duration-700 md:space-y-4 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <p className="max-w-md text-sm leading-relaxed text-foreground/80 md:text-base">
                Start by naming your AI use case. This helps identify the specific deployment being assessed.
              </p>
              <p className="max-w-md text-sm leading-relaxed text-foreground/80 md:text-base">
                Your organization type determines which HIPAA requirements apply. Covered Entities include healthcare providers, health plans, and clearinghouses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
