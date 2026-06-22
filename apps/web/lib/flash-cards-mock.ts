export type VocabAnswer = { value: string; explanation?: string };

export type MultipleChoiceQuestion = {
  kind: "multiple-choice";
  id: string;
  categoryId?: string;
  category: string;
  prompt: string;
  correctIndex: 0 | 1 | 2 | 3;
  options: [string, string, string, string];
};

export type VocabularyQuestion = {
  kind: "vocabulary";
  id: string;
  categoryId?: string;
  category: string;
  prompt: string;
  example?: string;
  vocabAnswers: VocabAnswer[];
};

export type FlashQuestion = MultipleChoiceQuestion | VocabularyQuestion;

export const FLASH_CARDS_MOCK: FlashQuestion[] = [
  {
    kind: "multiple-choice",
    id: "1",
    category: "Sentences",
    prompt:
      'Which word matches "cabide"? Adding some text to fill up three lines and test the layout.',
    correctIndex: 0,
    options: ["Coat hanger", "Shelf", "Drawer", "Hook"],
  },
  {
    kind: "vocabulary",
    id: "2",
    category: "Vocabulary",
    prompt: "How do you say 'Escadaria'?",
    vocabAnswers: [
      { value: "Staircase", explanation: "The most common term." },
      { value: "Flight of stairs" },
    ],
  },
];
