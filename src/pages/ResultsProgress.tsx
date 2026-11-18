import { getAnalytics } from '../services/analyticsService'
import { buildPdf, download, downloadJson, summaryJson, summaryLines } from '../services/exportService'
import { startLearning } from '../hooks/useLearningSession'
import ChapterBars from '../components/results/ChapterBars'
import HistoryTable from '../components/results/HistoryTable'
import IncorrectReview from '../components/results/IncorrectReview'

export default function ResultsProgress() {
  const a = getAnalytics()
  if (a.exams === 0 && a.attempts === 0) {
    return (<section><h1>Results and Progress</h1><div className="empty"><h2>No practice recorded yet</h2><p className="muted">Complete an examination or answer questions in Interactive Learning and your progress will appear here for this browser session.</p>
      <a className="btn primary" href="#practice">Start practising</a></div></section>)
  }
  const revise = () => { if (startLearning({ kind: 'revision' })) window.location.hash = 'learning' }
  const stat = (label: string, value: string, cls = '') => (<div className={cls}><span>{label}</span><strong>{value}</strong></div>)
  return (
    <section>
      <div className="q-head"><h1>Results and Progress</h1>
        <div className="actions tight">
          <button className="btn small" onClick={() => window.print()}>Print</button>
          <button className="btn small" onClick={() => download(buildPdf(summaryLines(a)), 'istqb-progress-summary.pdf')}>Download PDF</button>
          <button className="btn small" onClick={() => downloadJson(summaryJson(a), 'istqb-progress-summary.json')}>Download JSON</button></div></div>
      <p className="muted">Calculated locally from this browser session. Nothing is saved permanently or sent anywhere; export a file if you want to keep it.</p>
      <div className="stats">
        {stat('Examinations completed', String(a.exams))}
        {stat('Pass rate', a.passRate === null ? 'n/a' : `${a.passRate}%`)}
        {stat('Average score', a.avgScore === null ? 'n/a' : `${a.avgScore}%`)}
        {stat('Answers recorded', String(a.attempts))}
        {stat('Unique questions', String(a.uniqueQuestions))}
        {stat('Overall accuracy', a.accuracy === null ? 'n/a' : `${a.accuracy}%`)}
      </div>
      <h2>Performance by syllabus chapter</h2>
      <p className="muted small-print">Accuracy across all recorded answers. Chapters below 65% with at least three answers are flagged for revision.</p>
      <ChapterBars chapters={a.chapters} />
      <h2>Examination history</h2>
      {a.history.length ? <HistoryTable history={a.history} /> : <p className="muted">No Real-Time examinations completed yet.</p>}
      <h2>Frequently answered incorrectly</h2>
      <div className="actions tight"><button className="btn primary" disabled={a.stillIncorrectIds.length === 0} onClick={revise}>Revise {a.stillIncorrectIds.length} incorrect {a.stillIncorrectIds.length === 1 ? 'question' : 'questions'} in Interactive Learning</button></div>
      <IncorrectReview items={a.incorrect} />
    </section>
  )
}
