import type { Question } from '../../types/question'
import { evaluate } from '../../services/answerEvaluator'
import { StemView } from '../examination/QuestionView'

const strip = (t: string) => t.replace(/^Is (not )?correct\.?\s*/, '')
interface Props { q: Question; index: number; total: number; selected: string[]; flagged: boolean; onSelect: (optId: string) => void; onFlag: () => void }

/** Interactive Learning question: feedback appears only once the full answer set has been selected. */
export default function QuestionLearning({ q, index, total, selected, flagged, onSelect, onFlag }: Props) {
  const multi = q.type === 'multiple-select'
  const complete = selected.length === q.selectCount
  const ev = evaluate(q, selected)
  const ref = q.syllabusReference
  const ex = q.explanation
  const wrongSelected = selected.filter((s) => !q.correctAnswer.includes(s))
  const shown = new Set([...q.correctAnswer, ...(complete ? wrongSelected : [])])
  return (
    <article className="question">
      <div className="q-head">
        <h2>Question {index + 1} of {total}</h2>
        <button type="button" className={'btn small' + (flagged ? ' flagged' : '')} aria-pressed={flagged} onClick={onFlag}>{flagged ? 'Flagged for review' : 'Flag for review'}</button>
      </div>
      <StemView q={q} />
      <fieldset className="options">
        <legend>{multi ? `Select ${q.selectCount === 2 ? 'TWO' : q.selectCount} options.` : 'Select ONE option.'}</legend>
        {q.options.map((o) => {
          const checked = selected.includes(o.id)
          const cls = complete ? (q.correctAnswer.includes(o.id) ? ' correct' : checked ? ' incorrect' : '') : checked ? ' chosen' : ''
          return (
            <label key={o.id} className={'option' + cls}>
              <input type={multi ? 'checkbox' : 'radio'} name={q.id} checked={checked} disabled={multi && selected.length >= q.selectCount && !checked} onChange={() => onSelect(o.id)} />
              <span className="opt-id">{o.id})</span><span>{o.text}</span>
              {complete && <span className="tags">{checked && <em>Your answer</em>}{q.correctAnswer.includes(o.id) && <em>Correct answer</em>}</span>}
            </label>)
        })}
      </fieldset>
      {multi && !complete && selected.length > 0 && <p className="muted" role="status">Select {q.selectCount - selected.length} more to see feedback.</p>}
      {complete && (
        <div aria-live="polite">
          <p className={'feedback ' + (ev.correct ? 'ok' : 'bad')}><strong>{ev.correct ? 'Correct Answer' : 'Incorrect Answer'}</strong></p>
          <div className="explain">
            <h3>Explanation</h3>
            {ex.general && <p>{ex.general}</p>}
            {q.correctAnswer.map((id) => ex.options[id] && <p key={id}><strong>{id}) is correct.</strong> {strip(ex.options[id].text)}</p>)}
            {!ev.correct && wrongSelected.map((id) => ex.options[id] && <p key={id}><strong>Why {id}) is not correct.</strong> {strip(ex.options[id].text)}</p>)}
            {q.options.some((o) => !shown.has(o.id)) && (
              <details><summary>Why the other options are not correct</summary>
                {q.options.filter((o) => !shown.has(o.id)).map((o) => ex.options[o.id] && <p key={o.id}><strong>{o.id})</strong> {strip(ex.options[o.id].text)}</p>)}
              </details>)}
            <p className="muted small-print">Explanations are the official ISTQB sample exam answer justifications.</p>
          </div>
          <div className="syllref">
            <h3>Syllabus Reference</h3>
            <p>Chapter {ref.chapter} – {ref.chapterTitle}<br />
              <a href={`#syllabus/${ref.section}/${q.learningObjective.id}`}>Section {ref.section} – {ref.sectionTitle}</a><br />
              {q.learningObjective.id} ({q.learningObjective.kLevel}): {q.learningObjective.text}</p>
          </div>
        </div>)}
    </article>
  )
}
