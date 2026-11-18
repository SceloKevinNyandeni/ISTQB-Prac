export interface Examination {
  id: string; title: string; kind: 'official-structure' | 'additional'
  questionDocumentVersion: string; answerDocumentVersion: string; released: string; syllabusVersion: string
  totalQuestions: number; totalMarks: number
  passMarkPoints: number | null; passMarkPercent: number | null
  durationMinutes: number | null; extraTimePercent: number | null
  realTimeAvailable: boolean; available: boolean; questionFile: string; note?: string
}
