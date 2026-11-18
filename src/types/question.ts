export interface Option { id: string; text: string }
export interface SyllabusReference { chapter: string; chapterTitle: string; section: string; sectionTitle: string }
export interface Question {
  id: string; examinationId: string; questionNumber: number; sourceNumber: string
  type: 'single-choice' | 'multiple-select'; selectCount: number
  question: string; stemImage: string | null; options: Option[]; correctAnswer: string[]
  explanation: { source: 'official'; general: string; options: Record<string, { correct: boolean; text: string }> }
  syllabusReference: SyllabusReference
  learningObjective: { id: string; text: string; kLevel: string }
  kLevel: string; marks: number
}
