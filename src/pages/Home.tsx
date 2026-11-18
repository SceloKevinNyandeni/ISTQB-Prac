import { Icon } from '../components/common/Icon'
import { getAnalytics } from '../services/analyticsService'
import ChapterBars from '../components/results/ChapterBars'
export default function Home({ go }: { go: (id: 'practice' | 'learning') => void }) {
  const a = getAnalytics(); const empty = a.exams === 0 && a.attempts === 0
  return (
    <section>
      <h1>Welcome</h1>
      <p className="muted">Prepare for the ISTQB Certified Tester Foundation Level examination using the official sample papers. No account is needed.</p>
      <div className="grid-2">
        <article className="card"><h2><Icon name="clock" /> Real-Time Examination</h2><p>Simulate the actual examination environment. Answers and explanations stay hidden until the examination is submitted or the timer expires.</p><button className="btn primary" onClick={() => go('practice')}>Choose an examination</button></article>
        <article className="card"><h2><Icon name="learn" /> Interactive Learning</h2><p>Practise without time restrictions, receive immediate feedback and understand the reasoning behind each answer.</p><button className="btn" onClick={() => go('learning')}>Start learning</button></article>
      </div>
      {empty ? (<div className="empty"><h2>No examinations attempted yet</h2><p className="muted">Select a practice examination to begin. Your session statistics will appear here.</p></div>) : (
        <div>
          <h2>This session</h2>
          <div className="stats">
            <div><span>Questions attempted</span><strong>{a.uniqueQuestions}</strong></div>
            <div><span>Overall accuracy</span><strong>{a.accuracy === null ? 'n/a' : `${a.accuracy}%`}</strong></div>
            <div><span>Completed examinations</span><strong>{a.exams}</strong></div>
          </div>
          <h2>Recent examination results</h2>
          {a.history.length === 0 ? <p className="muted">No examinations completed yet.</p> : (
            <ul className="plain">{a.history.slice(-3).reverse().map((h) => (<li key={h.sessionId}>{h.title}: {h.marks}/{h.maxMarks} ({h.percent}%) – <strong className={h.passed ? 'ok-text' : 'bad-text'}>{h.passed ? 'Passed' : 'Not passed'}</strong></li>))}</ul>)}
          <h2>Performance by syllabus chapter</h2>
          <ChapterBars chapters={a.chapters} />
          <p><a href="#results">View full results and progress</a></p>
        </div>)}
    </section>
  )
}
