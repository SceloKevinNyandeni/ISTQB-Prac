import type { Question } from '../types/question'
export interface Evaluation { answered: boolean; correct: boolean; marks: number }
/** All-or-nothing: the selected set must equal the correct set. The supplied ISTQB documents define no partial marks. */
export function evaluate(q: Question, selected: string[] | undefined): Evaluation {
  const sel = selected ?? []
  if (sel.length === 0) return { answered: false, correct: false, marks: 0 }
  const correct = sel.length === q.correctAnswer.length && q.correctAnswer.every((a) => sel.includes(a))
  return { answered: true, correct, marks: correct ? q.marks : 0 }
}
