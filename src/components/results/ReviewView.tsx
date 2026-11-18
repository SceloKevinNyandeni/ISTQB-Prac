import { useState } from 'react'
import type { Question } from '../../types/question'
import { evaluate } from '../../services/answerEvaluator'
import NavPanel from '../examination/NavPanel'
import { StemView } from '../examination/QuestionView'
interface Props { questions: Question[]; answers: Record<string, string[]>; onBack: () => void }
export default function ReviewView({ questions, answers, onBack }: Props) {
  const [i, setI] = useState(0); const q = questions[i]
  const sel = answers[q.id] ?? []; const ev = evaluate(q, sel)
  const state = (n: number) => { const e = evaluate(questions[n], answers[questions[n].id]); return !e.answered ? 'skipped' : e.correct ? 'correct' : 'incorrect' } 
  const ref = q.syllabusReference
  return (
    <section>
      <div className="q-head"><h1>Review</h1><button className="btn" onClick={onBack}>Back to results</button></div>
      <div className="exam-layout">
        <article className="question">
          <h2>Question {i + 1} of {questions.length}</h2>
          <p className={'status ' + (ev.correct ? 'ok' : 'bad')}><strong>{!ev.answered ? 'Not answered' : ev.correct ? 'Correct' : 'Incorrect'}</strong></p>
          <StemView q={q} />
          <ul className="options review">
            {q.options.map((o) => {
              const isSel = sel.includes(o.id), isCor = q.correctAnswer.includes(o.id)
              return (<li key={o.id} className={'option ' + (isCor ? 'correct' : isSel ? 'incorrect' : '')}>
                <span className="opt-id">{o.id})</span><span>{o.text}</span>
                <span className="tags">{isSel && <em>Your answer</em>}{isCor && <em>Correct answer</em>}</span></li>)
            })}
          </ul>
          <div className="explain">
            <h3>Official explanation</h3>
            {q.explanation.general && <p>{q.explanation.general}</p>}
            {q.options.map((o) => q.explanation.options[o.id] && (<p key={o.id}><strong>{o.id}) {q.explanation.options[o.id].correct ? 'Correct.' : 'Not correct.'}</strong> {q.explanation.options[o.id].text.replace(/^Is (not )?correct\.?\s*/, '')}</p>))}
          </div>
          <div className="syllref">
            <h3>Syllabus reference</h3>
            <p>Chapter {ref.chapter} – {ref.chapterTitle}<br /><a href={`#syllabus/${ref.section}/${q.learningObjective.id}`}>Section {ref.section} – {ref.sectionTitle}</a><br />{q.learningObjective.id} ({q.learningObjective.kLevel}) {q.learningObjective.text}</p>
          </div>
          <div className="actions"><button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button><button className="btn" disabled={i === questions.length - 1} onClick={() => setI(i + 1)}>Next</button></div>
        </article>
        <NavPanel count={questions.length} current={i} onGo={setI} state={state} review />
      </div>
    </section>
  )
}
