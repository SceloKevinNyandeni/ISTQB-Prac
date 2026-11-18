import { useState } from 'react'
import type { ExamResult } from '../../services/resultsService'
import { formatDuration } from '../../utils/examinationHelpers'
export default function HistoryTable({ history }: { history: ExamResult[] }) {
  const [failedOnly, setFailedOnly] = useState(false)
  const rows = history.map((h, i) => {
    const prev = history.slice(0, i).reverse().find((x) => x.examId === h.examId)
    return { h, delta: prev ? Math.round((h.percent - prev.percent) * 10) / 10 : null }
  }).filter((r) => !failedOnly || r.h.passed === false).reverse()
  return (
    <div>
      <label className="check"><input type="checkbox" checked={failedOnly} onChange={(e) => setFailedOnly(e.target.checked)} /> Show only examinations not passed</label>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Examination</th><th>Status</th><th>Score</th><th>Percentage</th><th>Result</th><th>Time taken</th><th>Completed</th><th>Change vs previous attempt</th></tr></thead>
          <tbody>
            {rows.map(({ h, delta }) => (
              <tr key={h.sessionId}><td>{h.title}</td><td>{h.expired ? 'Time expired' : 'Completed'}</td><td>{h.marks} / {h.maxMarks}</td><td>{h.percent}%</td>
                <td className={h.passed ? 'ok-text' : 'bad-text'}><strong>{h.passed === null ? 'n/a' : h.passed ? 'Passed' : 'Not passed'}</strong></td>
                <td>{formatDuration(h.timeTakenSeconds)}</td><td>{new Date(h.completedAt).toLocaleString()}</td>
                <td>{delta === null ? '-' : `${delta > 0 ? '+' : ''}${delta} points`}</td></tr>))}
            {rows.length === 0 && <tr><td colSpan={8} className="muted">No examinations to show.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="muted small-print">History is held only in this browser tab and is not saved permanently.</p>
    </div>
  )
}
