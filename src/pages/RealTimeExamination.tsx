import { useMemo, useState } from 'react'
import type { Examination } from '../types/examination'
import { getExamination, getQuestions } from '../services/examinationService'
import { RT_KEY, useExamSession, type RtSession } from '../hooks/useExamSession'
import { useTimer } from '../hooks/useTimer'
import { load } from '../utils/sessionStorage'
import { formatClock } from '../utils/examinationHelpers'
import Instructions from '../components/examination/Instructions'
import QuestionView from '../components/examination/QuestionView'
import NavPanel from '../components/examination/NavPanel'
import SubmitDialog from '../components/examination/SubmitDialog'
import ResultsView from '../components/results/ResultsView'
import ReviewView from '../components/results/ReviewView'

export default function RealTimeExamination() {
  const stored = load<RtSession | null>(RT_KEY, null)
  const selected = load('selectedExam', '')
  const exam = getExamination(stored && stored.status !== 'instructions' ? stored.examId : selected)
  if (!exam || !exam.realTimeAvailable) {
    return (<section><h1>Real-Time Examination</h1><p className="muted">Select an examination that supports Real-Time mode first.</p><a className="btn primary" href="#practice">Choose an examination</a></section>)
  }
  return <ExamRunner key={exam.id} exam={exam} />
}

function ExamRunner({ exam }: { exam: Examination }) {
  const questions = useMemo(() => getQuestions(exam), [exam])
  const { session, begin, select, clear, goto, toggleFlag, submit, finish } = useExamSession(exam, questions)
  const [confirming, setConfirming] = useState(false)
  const [view, setView] = useState<'results' | 'review'>('results')
  const remaining = useTimer(session.status === 'active' ? session.deadline : null, () => { setConfirming(false); submit(true) })
  const leave = () => { finish(); window.location.hash = 'practice' }

  if (session.status === 'instructions') return <Instructions exam={exam} onBegin={begin} />
  if (session.status === 'submitted' && session.result) {
    return view === 'review'
      ? <ReviewView questions={questions} answers={session.answers} onBack={() => setView('results')} />
      : <ResultsView result={session.result} onReview={() => setView('review')} onFinish={leave} />
  }

  const q = questions[session.current]
  const answered = questions.filter((x) => (session.answers[x.id]?.length ?? 0) > 0).length
  const isFlagged = (i: number) => session.flagged.includes(questions[i].id)
  const nextFlagged = () => {
    for (let k = 1; k <= questions.length; k++) { const i = (session.current + k) % questions.length; if (isFlagged(i)) { goto(i); return } }
  }
  const low = remaining !== null && remaining < 5 * 60000
  return (
    <section>
      <div className="exam-bar">
        <h1>{exam.title}</h1>
        <div className={'timer' + (low ? ' low' : '')} role="timer" aria-label="Time remaining">{remaining === null ? '--:--' : formatClock(remaining)}</div>
      </div>
      <div className="exam-layout">
        <div>
          <QuestionView q={q} index={session.current} total={questions.length} selected={session.answers[q.id] ?? []} flagged={isFlagged(session.current)}
            onSelect={(o) => select(q.id, o, q.type === 'multiple-select', q.selectCount)} onClear={() => clear(q.id)} onFlag={() => toggleFlag(q.id)} />
          <div className="actions">
            <button className="btn" disabled={session.current === 0} onClick={() => goto(session.current - 1)}>Previous</button>
            <button className="btn" disabled={session.current === questions.length - 1} onClick={() => goto(session.current + 1)}>Next</button>
            <button className="btn" disabled={session.flagged.length === 0} onClick={nextFlagged}>Next flagged question</button>
            <button className="btn primary push" onClick={() => setConfirming(true)}>Submit examination</button>
          </div>
        </div>
        <NavPanel count={questions.length} current={session.current} onGo={goto} flagged={isFlagged}
          state={(i) => ((session.answers[questions[i].id]?.length ?? 0) > 0 ? 'answered' : 'unanswered')} />
      </div>
      {confirming && <SubmitDialog total={questions.length} answered={answered} flagged={session.flagged.length}
        onCancel={() => setConfirming(false)} onConfirm={() => { setConfirming(false); submit(false) }} />}
    </section>
  )
}
