import source from "./starter-content.json";

export type StarterWord = (typeof source.words)[number];
export type StarterQuestion = (typeof source.quiz)[number];

export const starterWords = source.words;
export const starterQuiz = source.quiz;
