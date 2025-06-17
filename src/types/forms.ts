export type QuestionType = "text" | "single-select" | "multiple-select";

export interface Question {
  questionType: QuestionType;
  label: string;
}

export interface FormView {
  label: string;
  questions: Question[];
}
