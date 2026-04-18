"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoveLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { type FlashQuestion, FLASH_CARDS_MOCK } from "@/lib/flash-cards-mock";

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

type Slot = "left" | "center" | "right";

function slotWrapperStyle(slot: Slot): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "min(100%, 360px)",
    transformStyle: "preserve-3d",
    transition:
      "transform 300ms cubic-bezier(0.33, 1, 0.68, 1), opacity 300ms ease, filter 300ms ease",
  };
  switch (slot) {
    case "left":
      return {
        ...base,
        zIndex: 10,
        transform:
          "translate(calc(-50% - 6.75rem), -50%) scale(0.88) rotateY(12deg)",
        opacity: 0.55,
        filter: "blur(2px)",
      };
    case "center":
      return {
        ...base,
        zIndex: 20,
        transform: "translate(-50%, -50%) scale(1) rotateY(0deg)",
        opacity: 1,
        filter: "none",
      };
    case "right":
      return {
        ...base,
        zIndex: 10,
        transform:
          "translate(calc(-50% + 6.75rem), -50%) scale(0.88) rotateY(-12deg)",
        opacity: 0.55,
        filter: "blur(2px)",
      };
    default:
      return base;
  }
}

function AnswerOptions({
  question,
  selectedIndex,
  onSelect,
  disabled,
  interactive = true,
}: {
  question: FlashQuestion;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled: boolean;
  interactive?: boolean;
}) {
  const letters = ["A", "B", "C", "D"] as const;
  const revealed = selectedIndex !== null;
  const inputLocked = interactive && (disabled || revealed);

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex flex-col gap-1.5"
        role="radiogroup"
        aria-label="Answer choices"
      >
        {question.options.map((label, i) => {
          const isCorrect = i === question.correctIndex;
          const isWrongPick = revealed && selectedIndex === i && !isCorrect;
          const isNeutral = revealed && !isCorrect && !isWrongPick;

          return (
            <Button
              key={i}
              type="button"
              role="radio"
              aria-checked={selectedIndex === i}
              disabled={inputLocked}
              onClick={() => onSelect(i)}
              variant="ghost"
              className={cn(
                "h-auto min-h-0 w-full origin-center justify-start gap-2 rounded-xl border-0 px-3 py-2.5 text-left font-body text-sm font-medium normal-case text-primary-font shadow-none whitespace-normal",
                interactive &&
                  !revealed &&
                  "bg-primary-card-hover/90 duration-200 ease-out hover:scale-[1.05] hover:bg-primary-card-hover hover:text-primary-font focus-visible:ring-2 focus-visible:ring-primary-font/25 focus-visible:outline-none",
                revealed && "hover:scale-100",
                revealed &&
                  isCorrect &&
                  "animate-answer-correct-pop bg-rating-easy/25 ring-2 ring-rating-easy disabled:opacity-100",
                revealed &&
                  isWrongPick &&
                  "animate-answer-shake bg-destructive/15 ring-2 ring-destructive disabled:opacity-100",
                revealed &&
                  isNeutral &&
                  "bg-primary-card-hover/50 opacity-60 disabled:opacity-60",
                "disabled:pointer-events-none",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold",
                  revealed &&
                    isCorrect &&
                    "bg-rating-easy text-primary-foreground",
                  revealed &&
                    isWrongPick &&
                    "bg-destructive text-primary-foreground",
                  revealed &&
                    isNeutral &&
                    "bg-primary-font/50 text-primary-background",
                  !revealed && "bg-primary-font text-primary-background",
                )}
              >
                {letters[i]}
              </span>
              <span className="min-w-0 flex-1">{label}</span>
            </Button>
          );
        })}
      </div>
      {revealed ? (
        <p
          role="status"
          className={cn(
            "mt-3 text-center font-display text-sm font-semibold uppercase tracking-wide animate-answer-feedback-in",
            selectedIndex === question.correctIndex
              ? "text-rating-easy"
              : "text-destructive",
          )}
        >
          {selectedIndex === question.correctIndex ? "Correct!" : "Incorrect"}
        </p>
      ) : null}
    </div>
  );
}

function FlashCardFace({
  question,
  slot,
  selectedOption,
  onSelectOption,
}: {
  question: FlashQuestion;
  slot: Slot;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
}) {
  const isCenter = slot === "center";

  return (
    <Card
      className={cn(
        "gap-5 py-8 px-1.5 bg-primary-card text-primary-font shadow-lg ring-primary-font/10",
        !isCenter && "pointer-events-none select-none",
      )}
      style={slotWrapperStyle(slot)}
      {...(!isCenter ? { inert: true } : {})}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-5">
        <CardTitle className="text-xs font-display font-light tracking-wide text-primary-font uppercase">
          {question.category}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 px-5 pt-0">
        <p className="font-body text-base leading-snug text-primary-font">
          {question.prompt}
        </p>
        <div
          key={question.id}
          className={cn("mt-5", isCenter && "animate-flash-card-swap")}
        >
          <AnswerOptions
            question={question}
            selectedIndex={selectedOption}
            onSelect={onSelectOption}
            disabled={false}
            interactive={isCenter}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function HomeExperience() {
  const [view, setView] = React.useState<"home" | "game">("home");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedByCard, setSelectedByCard] = React.useState<
    Record<string, number | null>
  >({});
  const [completeDialogOpen, setCompleteDialogOpen] = React.useState(false);
  const completeDialogTimerRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const resetGame = React.useCallback(() => {
    if (completeDialogTimerRef.current != null) {
      clearTimeout(completeDialogTimerRef.current);
      completeDialogTimerRef.current = null;
    }
    setCompleteDialogOpen(false);
    setSelectedByCard({});
    setCurrentIndex(0);
  }, []);

  const n = FLASH_CARDS_MOCK.length;
  const leftIdx = (currentIndex - 1 + n) % n;
  const rightIdx = (currentIndex + 1) % n;
  const centerQuestion = FLASH_CARDS_MOCK[currentIndex];
  const leftQuestion = FLASH_CARDS_MOCK[leftIdx];
  const rightQuestion = FLASH_CARDS_MOCK[rightIdx];
  const selectedOption = selectedByCard[centerQuestion.id] ?? null;
  const leftSelected = selectedByCard[leftQuestion.id] ?? null;
  const rightSelected = selectedByCard[rightQuestion.id] ?? null;

  const canGoPrev = currentIndex > 0;
  const canGoNext = selectedOption !== null;

  const deckComplete = FLASH_CARDS_MOCK.every(
    (q) => selectedByCard[q.id] != null,
  );

  const goPrev = React.useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? 0 : i - 1));
  }, []);

  const goNext = React.useCallback(() => {
    if (selectedOption == null) return;
    if (deckComplete) {
      // Only skip the wait if the debounced timer is still pending (never open
      // on the same interaction as the last answer when ref is still unset).
      if (completeDialogTimerRef.current == null) return;
      clearTimeout(completeDialogTimerRef.current);
      completeDialogTimerRef.current = null;
      setCompleteDialogOpen(true);
      return;
    }
    setCurrentIndex((i) => (i + 1) % n);
  }, [deckComplete, n, selectedOption]);

  const setSelectedForCurrent = React.useCallback(
    (optionIndex: number) => {
      setSelectedByCard((prev) => {
        if (prev[centerQuestion.id] != null) return prev;
        const next = { ...prev, [centerQuestion.id]: optionIndex };
        const allDone = FLASH_CARDS_MOCK.every((q) => next[q.id] != null);
        if (allDone) {
          if (completeDialogTimerRef.current != null) {
            clearTimeout(completeDialogTimerRef.current);
          }
          completeDialogTimerRef.current = setTimeout(() => {
            setCompleteDialogOpen(true);
            completeDialogTimerRef.current = null;
          }, 10_000);
        }
        return next;
      });
    },
    [centerQuestion.id],
  );

  const returnToHomeFromComplete = React.useCallback(() => {
    resetGame();
    setView("home");
  }, [resetGame]);

  if (view === "home") {
    return (
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
                  onClick={() => {
                    if (!isDisabled) {
                      resetGame();
                      setView("game");
                    }
                  }}
                  className={cn(
                    "h-12 w-full rounded-full border-0 bg-primary-card font-body text-base font-medium text-primary-font shadow-none hover:bg-primary-card-hover hover:text-primary-font focus-visible:ring-primary-font/25",
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
    );
  }

  return (
    <>
      <Dialog open={completeDialogOpen}>
        <DialogContent
          className="flex max-w-[min(100%-2rem,17.5rem)] min-h-[300px] flex-col items-center justify-between gap-0 border-0 bg-primary-background px-6 py-8 text-center text-primary-font ring-0 sm:max-w-xs"
          showCloseButton={false}
        >
          <DialogHeader className="items-center gap-3 text-center">
            <DialogTitle className="font-display text-lg font-semibold leading-snug tracking-wide text-primary-font uppercase">
              All cards finished
            </DialogTitle>
            <DialogDescription className="font-body mt-6 text-base leading-relaxed text-primary-font/80">
              You&apos;ve answered every card in this session.
            </DialogDescription>
          </DialogHeader>
          <Button
            type="button"
            className="w-full h-10 rounded-full border-0 bg-primary-card font-display text-sm font-semibold uppercase tracking-wide text-primary-font shadow-none hover:bg-primary-card-hover focus-visible:ring-primary-font/25"
            onClick={returnToHomeFromComplete}
          >
            Return home
          </Button>
        </DialogContent>
      </Dialog>

      <main className="flex min-h-0 flex-1 flex-col px-4 pb-8 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            resetGame();
            setView("home");
          }}
          className="mb-4 h-10 w-fit shrink-0 rounded-full border-0 bg-primary-card px-4 font-display text-sm font-medium uppercase tracking-wide text-primary-font shadow-none hover:bg-primary-card-hover [&_svg]:text-primary-font focus-visible:ring-primary-font/25"
          aria-label="Go back"
        >
          <MoveLeft className="mr-0.5 size-4 shrink-0" aria-hidden />
          Go back
        </Button>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center -mt-24">
          <div className="flex w-full max-w-[min(100%,660px)] items-center justify-center gap-0 sm:gap-0">
            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              aria-label={canGoPrev ? "Previous card" : "Already on first card"}
              disabled={!canGoPrev}
              onClick={goPrev}
              className="size-11 shrink-0 rounded-full border-0 bg-primary-font text-primary-background shadow-md hover:bg-primary-font/90 disabled:pointer-events-none disabled:opacity-40 disabled:hover:bg-primary-font [&_svg]:text-primary-background"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </Button>

            <div className="relative h-[min(70vh,520px)] w-full min-w-0 flex-1 perspective-[1000px]">
              <div className="relative h-full w-full">
                <FlashCardFace
                  question={leftQuestion}
                  slot="left"
                  selectedOption={leftSelected}
                  onSelectOption={() => {}}
                />
                <FlashCardFace
                  question={centerQuestion}
                  slot="center"
                  selectedOption={selectedOption}
                  onSelectOption={setSelectedForCurrent}
                />
                <FlashCardFace
                  question={rightQuestion}
                  slot="right"
                  selectedOption={rightSelected}
                  onSelectOption={() => {}}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              aria-label={
                canGoNext
                  ? "Next card"
                  : "Answer the question before continuing"
              }
              disabled={!canGoNext}
              onClick={goNext}
              className="size-11 shrink-0 rounded-full border-0 bg-primary-font text-primary-background shadow-md hover:bg-primary-font/90 disabled:pointer-events-none disabled:opacity-40 disabled:hover:bg-primary-font [&_svg]:text-primary-background"
            >
              <ChevronRight className="size-5" aria-hidden />
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
