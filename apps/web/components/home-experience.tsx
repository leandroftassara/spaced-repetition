"use client";

import * as React from "react";
import { motion } from "framer-motion";
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
import { getApiBase } from "@/lib/api-base";
import { cn } from "@/lib/utils";
import { type FlashQuestion } from "@/lib/flash-cards-mock";

type ApiCategory = {
  _id: string;
  name: string;
  available: boolean;
};

type ApiQuestion = {
  _id: string;
  category_id: string;
  question: string;
  answers: string[];
  correctAnswerIndex: number;
};

type HomeRow =
  | { kind: "mixed"; label: string }
  | { kind: "category"; id: string; label: string; disabled: boolean };

function buildHomeRows(cats: ApiCategory[]): HomeRow[] {
  const mixed: HomeRow = { kind: "mixed", label: "Mixed" };
  if (cats.length === 0) return [mixed];
  const first = cats[0];
  return [
    {
      kind: "category",
      id: first._id,
      label: first.name,
      disabled: !first.available,
    },
    mixed,
    ...cats.slice(1).map(
      (c): HomeRow => ({
        kind: "category",
        id: c._id,
        label: c.name,
        disabled: !c.available,
      }),
    ),
  ];
}

function apiQuestionToFlash(
  q: ApiQuestion,
  nameById: Map<string, string>,
): FlashQuestion {
  const opts = q.answers;
  if (opts.length !== 4) {
    throw new Error("Expected 4 answers per question");
  }
  return {
    id: String(q._id),
    category: nameById.get(q.category_id) ?? "—",
    prompt: q.question,
    correctIndex: q.correctAnswerIndex as FlashQuestion["correctIndex"],
    options: opts as FlashQuestion["options"],
  };
}

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
  positioned = true,
}: {
  question: FlashQuestion;
  slot: Slot;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  /** When false, parent handles absolute 3D placement (e.g. motion wrappers). */
  positioned?: boolean;
}) {
  const isCenter = slot === "center";

  return (
    <Card
      className={cn(
        "gap-5 py-8 px-1.5 bg-primary-card text-primary-font shadow-lg ring-primary-font/10",
        !positioned && "relative w-full max-w-none",
        !isCenter && "pointer-events-none select-none",
      )}
      style={positioned ? slotWrapperStyle(slot) : undefined}
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
          key={`${slot}-${question.id}`}
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
  const [selectedMode, setSelectedMode] = React.useState<
    null | "mixed" | { categoryId: string }
  >(null);
  const [categories, setCategories] = React.useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  const [categoriesError, setCategoriesError] = React.useState<string | null>(
    null,
  );
  const [deck, setDeck] = React.useState<FlashQuestion[]>([]);
  const [gameLoading, setGameLoading] = React.useState(false);
  const [gameError, setGameError] = React.useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedByCard, setSelectedByCard] = React.useState<
    Record<string, number | null>
  >({});
  const [completeDialogOpen, setCompleteDialogOpen] = React.useState(false);
  const completeDialogTimerRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const [carouselDirection, setCarouselDirection] = React.useState<0 | 1 | -1>(
    0,
  );

  React.useEffect(() => {
    let cancelled = false;
    fetch(`${getApiBase()}/categories`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load categories");
        return r.json() as Promise<ApiCategory[]>;
      })
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setCategoriesError(e.message);
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categoriesRef = React.useRef(categories);
  React.useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  React.useEffect(() => {
    if (view !== "game" || selectedMode === null) return;
    let cancelled = false;
    const base = getApiBase();
    const url =
      selectedMode === "mixed"
        ? `${base}/questions`
        : `${base}/questions?category_id=${encodeURIComponent(selectedMode.categoryId)}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load questions");
        return r.json() as Promise<ApiQuestion[]>;
      })
      .then((data) => {
        if (cancelled) return;
        const nameById = new Map(
          categoriesRef.current.map((c) => [c._id, c.name] as const),
        );
        try {
          const mapped = data.map((q) => apiQuestionToFlash(q, nameById));
          setDeck(mapped);
        } catch (e) {
          setGameError(
            e instanceof Error ? e.message : "Invalid question data",
          );
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setGameError(e.message);
      })
      .finally(() => {
        if (!cancelled) setGameLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [view, selectedMode]);

  const homeRows = React.useMemo(
    () => buildHomeRows(categories),
    [categories],
  );

  const resetGame = React.useCallback(() => {
    if (completeDialogTimerRef.current != null) {
      clearTimeout(completeDialogTimerRef.current);
      completeDialogTimerRef.current = null;
    }
    setCompleteDialogOpen(false);
    setCarouselDirection(0);
    setSelectedByCard({});
    setCurrentIndex(0);
    setDeck([]);
    setGameError(null);
    setGameLoading(false);
    setSelectedMode(null);
  }, []);

  const n = deck.length;
  const leftIdx = n > 0 ? (currentIndex - 1 + n) % n : 0;
  const rightIdx = n > 0 ? (currentIndex + 1) % n : 0;
  const centerQuestion = deck[currentIndex];
  const leftQuestion = deck[leftIdx];
  const rightQuestion = deck[rightIdx];
  const selectedOption = centerQuestion
    ? (selectedByCard[centerQuestion.id] ?? null)
    : null;
  const leftSelected = leftQuestion
    ? (selectedByCard[leftQuestion.id] ?? null)
    : null;
  const rightSelected = rightQuestion
    ? (selectedByCard[rightQuestion.id] ?? null)
    : null;

  const canGoPrev = currentIndex > 0;
  const canGoNext = selectedOption !== null;

  const deckComplete =
    n > 0 && deck.every((q) => selectedByCard[q.id] != null);

  const goPrev = React.useCallback(() => {
    setCarouselDirection(-1);
    setCurrentIndex((i) => (i <= 0 ? 0 : i - 1));
  }, []);

  const goNext = React.useCallback(() => {
    if (selectedOption == null) return;
    if (deckComplete) {
      if (completeDialogTimerRef.current == null) return;
      clearTimeout(completeDialogTimerRef.current);
      completeDialogTimerRef.current = null;
      setCompleteDialogOpen(true);
      return;
    }
    setCarouselDirection(1);
    setCurrentIndex((i) => (i + 1) % n);
  }, [deckComplete, n, selectedOption]);

  const setSelectedForCurrent = React.useCallback(
    (optionIndex: number) => {
      if (!centerQuestion) return;
      setSelectedByCard((prev) => {
        if (prev[centerQuestion.id] != null) return prev;
        const next = { ...prev, [centerQuestion.id]: optionIndex };
        const allDone = deck.every((q) => next[q.id] != null);
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
    [centerQuestion, deck],
  );

  const returnToHomeFromComplete = React.useCallback(() => {
    resetGame();
    setView("home");
  }, [resetGame]);

  const goBackToHome = React.useCallback(() => {
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
          {categoriesError ? (
            <p className="font-body mt-6 text-sm text-destructive">
              {categoriesError}
            </p>
          ) : null}
          <div className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {categoriesLoading ? (
              <p className="col-span-full font-body text-sm text-primary-font/80">
                Loading categories…
              </p>
            ) : (
              homeRows.map((row) => {
                if (row.kind === "mixed") {
                  return (
                    <Button
                      key="mixed"
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        resetGame();
                        setSelectedMode("mixed");
                        setGameLoading(true);
                        setGameError(null);
                        setView("game");
                      }}
                      className={cn(
                        "h-12 w-full rounded-full border-0 bg-primary-card font-body text-base font-medium text-primary-font shadow-none hover:bg-primary-card-hover hover:text-primary-font focus-visible:ring-primary-font/25",
                        "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-primary-card/50 disabled:text-primary-font/45 disabled:opacity-100 disabled:hover:bg-primary-card/50 disabled:hover:text-primary-font/45",
                      )}
                    >
                      {row.label}
                    </Button>
                  );
                }
                return (
                  <Button
                    key={row.id}
                    type="button"
                    variant="ghost"
                    disabled={row.disabled}
                    onClick={() => {
                      if (row.disabled) return;
                      resetGame();
                      setSelectedMode({ categoryId: row.id });
                      setGameLoading(true);
                      setGameError(null);
                      setView("game");
                    }}
                    className={cn(
                      "h-12 w-full rounded-full border-0 bg-primary-card font-body text-base font-medium text-primary-font shadow-none hover:bg-primary-card-hover hover:text-primary-font focus-visible:ring-primary-font/25",
                      "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-primary-card/50 disabled:text-primary-font/45 disabled:opacity-100 disabled:hover:bg-primary-card/50 disabled:hover:text-primary-font/45",
                    )}
                  >
                    {row.label}
                  </Button>
                );
              })
            )}
          </div>
        </div>
      </main>
    );
  }

  const gameShell = (children: React.ReactNode) => (
    <>
      {completeDialogOpen ? (
        <Dialog open>
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
              className="h-10 w-full rounded-full border-0 bg-primary-card font-display text-sm font-semibold uppercase tracking-wide text-primary-font shadow-none hover:bg-primary-card-hover focus-visible:ring-primary-font/25"
              onClick={returnToHomeFromComplete}
            >
              Return home
            </Button>
          </DialogContent>
        </Dialog>
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col px-4 pb-8 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={goBackToHome}
          className="relative z-20 mb-4 h-10 w-fit shrink-0 rounded-full border-0 bg-primary-card px-4 font-display text-sm font-medium uppercase tracking-wide text-primary-font shadow-none hover:bg-primary-card-hover [&_svg]:text-primary-font focus-visible:ring-primary-font/25"
          aria-label="Go back"
        >
          <MoveLeft className="mr-0.5 size-4 shrink-0" aria-hidden />
          Go back
        </Button>
        {children}
      </main>
    </>
  );

  if (gameLoading) {
    return gameShell(
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="font-body text-primary-font">Loading questions…</p>
      </div>,
    );
  }

  if (selectedMode === null) {
    return gameShell(
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="font-body text-primary-font">Loading questions…</p>
      </div>,
    );
  }

  if (gameError) {
    return gameShell(
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-body text-destructive">{gameError}</p>
      </div>,
    );
  }

  if (n === 0) {
    return gameShell(
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-body text-primary-font">No questions in this set.</p>
      </div>,
    );
  }

  if (!centerQuestion) {
    return gameShell(
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="font-body text-primary-font">Loading questions…</p>
      </div>,
    );
  }

  const carousel = (
    <div className="relative z-0 flex min-h-0 flex-1 flex-col items-center justify-start">
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
          {n === 1 ? (
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="relative w-full" style={slotWrapperStyle("center")}>
                <motion.div
                  key={`center-${centerQuestion.id}`}
                  className="w-full"
                  initial={
                    carouselDirection === 0
                      ? false
                      : {
                          x: carouselDirection * 88,
                          opacity: 0.62,
                          rotateY: carouselDirection * -18,
                          scale: 0.93,
                        }
                  }
                  animate={{
                    x: 0,
                    opacity: 1,
                    rotateY: 0,
                    scale: 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 32,
                    mass: 0.85,
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <FlashCardFace
                    question={centerQuestion}
                    slot="center"
                    positioned={false}
                    selectedOption={selectedOption}
                    onSelectOption={setSelectedForCurrent}
                  />
                </motion.div>
              </div>
            </div>
          ) : (
            leftQuestion &&
            rightQuestion && (
              <div className="relative h-full w-full">
                <motion.div
                  key={`left-${leftIdx}-${leftQuestion.id}`}
                  style={slotWrapperStyle("left")}
                  initial={{ opacity: 0.35, filter: "blur(4px)" }}
                  animate={{ opacity: 0.55, filter: "blur(2px)" }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 38,
                  }}
                >
                  <FlashCardFace
                    question={leftQuestion}
                    slot="left"
                    positioned={false}
                    selectedOption={leftSelected}
                    onSelectOption={() => {}}
                  />
                </motion.div>
                <div style={slotWrapperStyle("center")}>
                  <motion.div
                    key={`center-${currentIndex}-${centerQuestion.id}`}
                    className="w-full"
                    initial={
                      carouselDirection === 0
                        ? false
                        : {
                            x: carouselDirection * 88,
                            opacity: 0.62,
                            rotateY: carouselDirection * -18,
                            scale: 0.93,
                          }
                    }
                    animate={{
                      x: 0,
                      opacity: 1,
                      rotateY: 0,
                      scale: 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 32,
                      mass: 0.85,
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <FlashCardFace
                      question={centerQuestion}
                      slot="center"
                      positioned={false}
                      selectedOption={selectedOption}
                      onSelectOption={setSelectedForCurrent}
                    />
                  </motion.div>
                </div>
                <motion.div
                  key={`right-${rightIdx}-${rightQuestion.id}`}
                  style={slotWrapperStyle("right")}
                  initial={{ opacity: 0.35, filter: "blur(4px)" }}
                  animate={{ opacity: 0.55, filter: "blur(2px)" }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 38,
                  }}
                >
                  <FlashCardFace
                    question={rightQuestion}
                    slot="right"
                    positioned={false}
                    selectedOption={rightSelected}
                    onSelectOption={() => {}}
                  />
                </motion.div>
              </div>
            )
          )}
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
  );

  return gameShell(carousel);
}
