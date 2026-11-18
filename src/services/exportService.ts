import type { Analytics } from './analyticsService'
import type { ExamResult } from './resultsService'
import { formatDuration } from '../utils/examinationHelpers'

export function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export const downloadJson = (data: unknown, name: string) => download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), name)

const ascii = (t: string) => t.replace(/[–—]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/•/g, '-').replace(/[^\x20-\x7e]/g, '?')
const esc = (t: string) => ascii(t).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
export interface Line { text: string; bold?: boolean; size?: number; gap?: number }
/** Minimal text-only PDF (A4, Helvetica) generated locally in the browser; no external library or upload. */
export function buildPdf(lines: Line[]): Blob {
  const W = 595, H = 842, M = 50, perPage: string[][] = [[]]; let y = H - M
  for (const l of lines) {
    const size = l.size ?? 10, lh = size + 4 + (l.gap ?? 0), maxChars = Math.floor((W - 2 * M) / (size * (l.bold ? 0.56 : 0.5)))
    const words = ascii(l.text).split(' '); const wrapped: string[] = []; let cur = ''
    for (const w of words) { if ((cur + ' ' + w).trim().length > maxChars) { wrapped.push(cur); cur = w } else cur = (cur + ' ' + w).trim() }
    wrapped.push(cur)
    for (const t of wrapped) {
      if (y - lh < M) { perPage.push([]); y = H - M }
      y -= lh; perPage[perPage.length - 1].push(`BT /${l.bold ? 'F2' : 'F1'} ${size} Tf ${M} ${y} Td (${esc(t)}) Tj ET`)
    }
  }
  const objs: string[] = []; const n = perPage.length
  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objs[2] = `<< /Type /Pages /Kids [${perPage.map((_, i) => `${5 + i * 2} 0 R`).join(' ')}] /Count ${n} >>`
  objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  perPage.forEach((cmds, i) => {
    const stream = cmds.join('\n')
    objs[5 + i * 2] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`
    objs[6 + i * 2] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  })
  let out = '%PDF-1.4\n'; const offs: number[] = []
  for (let i = 1; i < objs.length; i++) { offs[i] = out.length; out += `${i} 0 obj\n${objs[i]}\nendobj\n` }
  const xref = out.length
  out += `xref\n0 ${objs.length}\n0000000000 65535 f \n` + offs.slice(1).map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')
  out += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([out], { type: 'application/pdf' })
}

const when = (t: number) => new Date(t).toLocaleString()
export function resultLines(r: ExamResult): Line[] {
  return [
    { text: r.title, bold: true, size: 16, gap: 6 },
    { text: 'ISTQB Foundation Level practice result - generated locally in the browser; not an official result.', size: 9, gap: 8 },
    { text: `Completed: ${when(r.completedAt)}${r.expired ? ' (time expired, submitted automatically)' : ''}` },
    { text: `Outcome: ${r.passed === null ? 'n/a' : r.passed ? 'Passed' : 'Not passed'} (pass mark ${r.passMarkPoints ?? 'n/a'} points, ${r.passMarkPercent ?? 'n/a'}%)`, bold: true },
    { text: `Marks: ${r.marks} of ${r.maxMarks} (${r.percent}%)` },
    { text: `Questions: ${r.total}   Correct: ${r.correct}   Incorrect: ${r.incorrect}   Unanswered: ${r.unanswered}` },
    { text: `Time taken: ${formatDuration(r.timeTakenSeconds)}`, gap: 8 },
    { text: 'Performance by syllabus chapter', bold: true, size: 12, gap: 2 },
    ...r.perChapter.map((c) => ({ text: `Chapter ${c.chapter} ${c.title}: ${c.correct} correct of ${c.attempted} answered` })),
  ]
}
export function summaryLines(a: Analytics): Line[] {
  return [
    { text: 'ISTQB Foundation Level - Session progress summary', bold: true, size: 16, gap: 6 },
    { text: 'Generated locally in the browser. Covers this browser session only; not an official result.', size: 9, gap: 8 },
    { text: `Generated: ${when(Date.now())}`, gap: 6 },
    { text: `Examinations completed: ${a.exams}   Passed: ${a.passed}   Not passed: ${a.failed}   Pass rate: ${a.passRate ?? 'n/a'}${a.passRate === null ? '' : '%'}` },
    { text: `Average examination score: ${a.avgScore ?? 'n/a'}${a.avgScore === null ? '' : '%'}` },
    { text: `Answers recorded: ${a.attempts}   Unique questions: ${a.uniqueQuestions}   Overall accuracy: ${a.accuracy ?? 'n/a'}${a.accuracy === null ? '' : '%'}`, gap: 8 },
    { text: 'Performance by syllabus chapter', bold: true, size: 12, gap: 2 },
    ...a.chapters.map((c) => ({ text: `Chapter ${c.chapter} ${c.title}: ${c.attempts ? `${c.accuracy}% (${c.right} of ${c.attempts})` : 'no answers yet'}` })),
    { text: 'Examination history', bold: true, size: 12, gap: 2 },
    ...(a.history.length ? a.history.map((h) => ({ text: `${when(h.completedAt)} - ${h.title}: ${h.marks}/${h.maxMarks} (${h.percent}%) ${h.passed === null ? '' : h.passed ? 'Passed' : 'Not passed'}${h.expired ? ' [time expired]' : ''}` })) : [{ text: 'None yet.' }]),
    { text: 'Most frequently incorrect questions', bold: true, size: 12, gap: 2 },
    ...(a.incorrect.length ? a.incorrect.slice(0, 15).map((i) => ({ text: `${i.q.examinationId} question ${i.q.questionNumber} (chapter ${i.q.syllabusReference.chapter}, section ${i.q.syllabusReference.section}): incorrect ${i.wrong} of ${i.attempts}` })) : [{ text: 'None.' }]),
  ]
}
export function summaryJson(a: Analytics) {
  return { generatedAt: new Date().toISOString(), note: 'Session-only practice data generated locally in the browser; not an official ISTQB result.',
    summary: { examinations: a.exams, passed: a.passed, notPassed: a.failed, passRatePercent: a.passRate, averageScorePercent: a.avgScore, answersRecorded: a.attempts, uniqueQuestions: a.uniqueQuestions, overallAccuracyPercent: a.accuracy },
    chapters: a.chapters, history: a.history,
    frequentlyIncorrect: a.incorrect.map((i) => ({ id: i.q.id, examination: i.q.examinationId, questionNumber: i.q.questionNumber, chapter: i.q.syllabusReference.chapter, section: i.q.syllabusReference.section, incorrectCount: i.wrong, attempts: i.attempts, stillIncorrect: i.stillIncorrect })) }
}
