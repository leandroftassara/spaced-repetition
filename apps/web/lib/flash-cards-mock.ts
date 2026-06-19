export type FlashQuestion = {
  id: string;
  /** API category ObjectId; used for mode-specific UI (e.g. vocabulary). */
  categoryId?: string;
  category: string;
  prompt: string;
  /** Index 0–3 of the correct option in `options`. */
  correctIndex: 0 | 1 | 2 | 3;
  options: [string, string, string, string];
};

export const FLASH_CARDS_MOCK: FlashQuestion[] = [
  {
    id: "1",
    category: "Vocabulary",
    prompt:
      'Which word matches "cabide"? Adding some text to fill up three lines and test the layout.',
    correctIndex: 0,
    options: ["Coat hanger", "Shelf", "Drawer", "Hook"],
  },
  {
    id: "2",
    category: "Vocabulary",
    prompt: "Pick the English equivalent of \"obrigado\" in a neutral register.",
    correctIndex: 0,
    options: ["Thanks", "Please", "Sorry", "Hello"],
  },
  {
    id: "3",
    category: "Vocabulary",
    prompt: "Which option best describes a \"brief\" meeting?",
    correctIndex: 0,
    options: ["Short", "Formal", "Weekly", "Optional"],
  },
];
