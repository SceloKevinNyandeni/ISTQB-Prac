import { useState } from 'react'
import type { IncorrectQ } from '../../services/analyticsService'
import { StemView } from '../examination/QuestionView'
const strip = (t: string) => t.replace(/^Is (not )?correct\.?\s*/, '')

function Item({ item }: { item: IncorrectQ }) {
  const [open, setOpen] = useState(false); const q = item.q; const ex = q.explanation
  return (
    <details className="rev-item" onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>
        <span>{q.examinationId} question {q.questionNumber} – chapter {q.syllabusReference.chapter}, section {q.syllabusReference.section}</span>
        <span className="muted small-print"> Incorrect {item.wrong} of {item.attempts} {item.attempts === 1 ? 'attempt' : 'attempts'}{item.stillIncorrect ? '' : ' (since answered correctly)'}</span>
      </summary>
      {open && (
        <div className="rev-body">
          <StemView q={q} />
          <ul className="options review">{q.options.map((o) => (<li key={o.id} className={'option' + (q.correctAnswer.includes(o.id) ? ' correct' : '')}><span className="opt-id">{o.id})</span><span>{o.text}</span>{q.correctAnswer.includes(o.id) && <span className="tags"><em>Correct answer</em></span>}</li>))}</ul>
          <div className="explain"><h3>Official explanation</h3>{ex.general && <p>{ex.general}</p>}
            {q.correctAnswer.map((id) => ex.options[id] && <p key={id}><strong>{id}) is correct.</strong> {strip(ex.options[id].text)}</p>)}</div>
          <p><a href={`#syllabus/${q.syllabusReference.section}/${q.learningObjective.id}`}>Revisit syllabus section {q.syllabusReference.section} – {q.syllabusReference.sectionTitle}</a></p>
        </div>)}
    </details>
  )
}
export default function IncorrectReview({ items }: { items: IncorrectQ[] }) {
  const [all, setAll] = useState(false); const shown = all ? items : items.slice(0, 10)
  if (items.length === 0) return <p className="muted">No incorrect answers recorded yet.</p>
  return (
    <div>
      {shown.map((i) => <Item key={i.q.id} item={i} />)}
      {items.length > 10 && <button className="btn small" onClick={() => setAll(!all)}>{all ? 'Show fewer' : `Show all ${items.length}`}</button>}
    </div>
  )
}
