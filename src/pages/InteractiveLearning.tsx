import { useMemo, useState } from 'react'
import { getExaminations, getQuestionById } from '../services/examinationService'
import { chapterCounts } from '../services/learningService'
import { getProgress } from '../services/progressService'
import { evaluate } from '../services/answerEvaluator'
import { useLearningSession } from '../hooks/useLearningSession'
import { load } from '../utils/sessionStorage'
import QuestionLearning from '../components/learning/QuestionLearning'
import LearningSummary from '../components/learning/LearningSummary'
import NavPanel from '../components/examination/NavPanel'

export default function InteractiveLearning() {
  const L = useLearningSession()
  const [summary, setSummary] = useState(false)
  const questions = useMemo(() => (L.session?.ids ?? []).map((id) => getQuestionById(id)!).filter(Boolean), [L.session?.ids])
  if (!L.session) return <StartPanel onStart={L.start} />
  const s = L.session
  if (summary) return (<LearningSummary questions={questions} answers={s.answers} onBack={() => setSummary(false)} onGoto={(i) => { L.goto(i); setSummary(false) }}
    onRestart={() => { L.restart(); setSummary(false) }} onPractiseIncorrect={(ids) => { L.start({ kind: 'ids', ids, label: 'Incorrect answers from ' + s.title }); setSummary(false) }} onEnd={() => { L.end(); setSummary(false) }} />)
  const q = questions[s.current]
  const stateOf = (i: number) => { const e = evaluate(questions[i], s.answers[questions[i].id]); return !e.answered ? 'skipped' : (s.answers[questions[i].id].length === questions[i].selectCount ? (e.correct ? 'correct' : 'incorrect') : 'skipped') }
  const done = questions.filter((x, i) => stateOf(i) !== 'skipped').length
  const correct = questions.filter((x, i) => stateOf(i) === 'correct').length
  return (
    <section>
      <div className="exam-bar">
        <h1>{s.title}</h1>
        <div className="progress-line" role="status">{done} of {questions.length} answered{done ? `, ${correct} correct` : ''}</div>
      </div>
      <div className="exam-layout">
        <div>
          <QuestionLearning key={q.id} q={q} index={s.current} total={questions.length} selected={s.answers[q.id] ?? []} flagged={s.flagged.includes(q.id)}
            onSelect={(o) => L.select(q, o)} onFlag={() => L.toggleFlag(q.id)} />
          <div className="actions">
            <button className="btn" disabled={s.current === 0} onClick={() => L.goto(s.current - 1)}>Previous</button>
            <button className="btn" disabled={s.current === questions.length - 1} onClick={() => L.goto(s.current + 1)}>Next</button>
            <button className="btn push" onClick={() => setSummary(true)}>Session summary</button>
          </div>
        </div>
        <NavPanel count={questions.length} current={s.current} onGo={L.goto} state={stateOf} flagged={(i) => s.flagged.includes(questions[i].id)} review />
      </div>
    </section>
  )
}

function StartPanel({ onStart }: { onStart: ReturnType<typeof useLearningSession>['start'] }) {
  const exams = getExaminations().filter((e) => e.available)
  const [exam, setExam] = useState(load('selectedExam', ''))
  const [chapter, setChapter] = useState('')
  const chapters = chapterCounts(); const revision = getProgress().incorrect.length
  return (
    <section>
      <h1>Interactive Learning</h1>
      <p className="muted">No time limit. Feedback and explanations appear as soon as you answer.</p>
      <div className="grid-2">
        <div className="card"><h2>Full examination paper</h2>
          <label htmlFor="l-exam" className="label">Examination paper</label>
          <select id="l-exam" className="select" value={exam} onChange={(e) => setExam(e.target.value)}><option value="">Select a practice examination</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select>
          <div className="actions"><button className="btn primary" disabled={!exam} onClick={() => onStart({ kind: 'exam', examId: exam })}>Start</button></div></div>
        <div className="card"><h2>Practise by chapter</h2>
          <label htmlFor="l-ch" className="label">Syllabus chapter</label>
          <select id="l-ch" className="select" value={chapter} onChange={(e) => setChapter(e.target.value)}><option value="">Select a chapter</option>{chapters.map((c) => <option key={c.number} value={c.number}>{c.number}. {c.title} ({c.count} questions)</option>)}</select>
          <div className="actions"><button className="btn primary" disabled={!chapter} onClick={() => onStart({ kind: 'chapter', chapter })}>Start</button></div></div>
      </div>
      <div className="card"><h2>Revise incorrect answers</h2>
        <p className="muted">{revision ? `${revision} question${revision === 1 ? '' : 's'} answered incorrectly in this browser session.` : 'Questions you answer incorrectly in this session will be collected here.'}</p>
        <button className="btn primary" disabled={!revision} onClick={() => onStart({ kind: 'revision' })}>Start revision</button></div>
    </section>
  )
}
