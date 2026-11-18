import type { ExamResult } from '../../services/resultsService'
import { formatDuration } from '../../utils/examinationHelpers'
import { buildPdf, download, downloadJson, resultLines } from '../../services/exportService'
interface Props { result: ExamResult; onReview: () => void; onFinish: () => void }
export default function ResultsView({ result: r, onReview, onFinish }: Props) {
  const status = r.passed === null ? null : r.passed ? 'PASSED' : 'NOT PASSED'
  return (
    <section>
      <h1>{r.title}</h1>
      {r.expired && <p className="notice" role="status">The examination time expired and your answers were submitted automatically.</p>}
      {status && (<div className={'verdict ' + (r.passed ? 'pass' : 'fail')} role="status"><strong>{status}</strong>
        <span>{r.marks} of {r.maxMarks} points ({r.percent}%). The pass mark is {r.passMarkPoints} points ({r.passMarkPercent}%).</span></div>)}
      <div className="stats">
        <div><span>Total questions</span><strong>{r.total}</strong></div>
        <div className="ok"><span>Correct</span><strong>{r.correct}</strong></div>
        <div className="bad"><span>Incorrect</span><strong>{r.incorrect}</strong></div>
        <div><span>Unanswered</span><strong>{r.unanswered}</strong></div>
        <div><span>Marks</span><strong>{r.marks} / {r.maxMarks}</strong></div>
        <div><span>Percentage</span><strong>{r.percent}%</strong></div>
        <div><span>Time taken</span><strong>{formatDuration(r.timeTakenSeconds)}</strong></div>
      </div>
      <h2>Performance by syllabus chapter</h2>
      <table className="table"><thead><tr><th>Chapter</th><th>Answered</th><th>Correct</th></tr></thead>
        <tbody>{r.perChapter.map((c) => (<tr key={c.chapter}><td>{c.chapter}. {c.title}</td><td>{c.attempted}</td><td>{c.correct}</td></tr>))}</tbody></table>
      <p className="muted">Results are held only in this browser tab and disappear when it closes.</p>
      <div className="actions"><button className="btn primary" onClick={onReview}>Review questions</button><button className="btn" onClick={() => window.print()}>Print results</button><button className="btn" onClick={() => download(buildPdf(resultLines(r)), `${r.examId}-result.pdf`)}>Download PDF</button><button className="btn" onClick={() => downloadJson(r, `${r.examId}-result.json`)}>Download JSON</button><button className="btn" onClick={onFinish}>Back to practice examinations</button></div>
    </section>
  )
}
