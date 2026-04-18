import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

const actions = [
  "Vocabulary",
  "Mixed",
  "Expressions",
  "Prepositions",
  "Pronounce",
  "Phrasal Verbs",
] as const;

const disabledActions = new Set<string>([
  "Expressions",
  "Prepositions",
  "Pronounce",
  "Phrasal Verbs",
]);

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-primary-background text-primary-font">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-32">
        <div className="flex w-full max-w-3xl flex-col items-center text-center">
          <h1
            aria-label="Spaced"
            className="font-display flex flex-wrap justify-center gap-x-[0.3em] text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold leading-[0.95] text-primary-font uppercase"
          >
            {Array.from("SPACED").map((char, i) => (
              <span key={i} className="inline-block" aria-hidden>
                {char}
              </span>
            ))}
          </h1>
          <p className="font-display mt-1 text-[clamp(1.25rem,3.5vw,2.25rem)] font-bold tracking-wide text-primary-font uppercase">
            Repetition
          </p>
          <p className="font-body mt-16 max-w-xl text-lg text-primary-font sm:text-xl">
            What do you want to work on today?
          </p>
          <div className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {actions.map((label) => {
              const isDisabled = disabledActions.has(label);
              return (
                <Button
                  key={label}
                  type="button"
                  variant="ghost"
                  disabled={isDisabled}
                  className={cn(
                    "h-12 w-full cursor-pointer rounded-full border-0 bg-primary-card font-body text-base font-medium text-primary-font shadow-none hover:bg-primary-card-hover hover:text-primary-font focus-visible:ring-primary-font/25",
                    "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-primary-card/50 disabled:text-primary-font/45 disabled:opacity-100 disabled:hover:bg-primary-card/50 disabled:hover:text-primary-font/45",
                  )}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
