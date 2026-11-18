import type { Question } from '../../types/question'

interface Props { q: Question; index: number; total: number; selected: string[]; flagged: boolean
  onSelect: (optId: string) => void; onClear: () => void; onFlag: () => void }
export const figureUrl = (path: string) => import.meta.env.BASE_URL + path

export function StemView({ q }: { q: Question }) {
  return q.stemImage
    ? <img className="stem-image" src={figureUrl(q.stemImage)} alt={q.question || `Question ${q.questionNumber}`} />
    : <p className="stem">{q.question}</p>
}

/** Examination-mode question: renders only the question and options; never any correctness information. */
export default function QuestionView({ q, index, total, selected, flagged, onSelect, onClear, onFlag }: Props) {
  const multi = q.type === 'multiple-select'
  const full = multi && selected.length >= q.selectCount
  return (
    <article className="question" aria-labelledby="qhead">
      <div className="q-head">
        <h2 id="qhead">Question {index + 1} of {total}</h2>
        <button type="button" className={'btn small' + (flagged ? ' flagged' : '')} aria-pressed={flagged} onClick={onFlag}>{flagged ? 'Flagged for review' : 'Flag for review'}</button>
      </div>
      <StemView q={q} />
      <fieldset className="options">
        <legend>{multi ? `Select ${q.selectCount === 2 ? 'TWO' : q.selectCount} options.` : 'Select ONE option.'}</legend>
        {q.options.map((o) => {
          const checked = selected.includes(o.id)
          return (
            <label key={o.id} className={'option' + (checked ? ' chosen' : '')}>
              <input type={multi ? 'checkbox' : 'radio'} name={q.id} checked={checked} disabled={multi && full && !checked} onChange={() => onSelect(o.id)} />
              <span className="opt-id">{o.id})</span><span>{o.text}</span>
            </label>)
        })}
      </fieldset>
      <button type="button" className="btn small linkish" onClick={onClear} disabled={selected.length === 0}>Clear answer</button>
    </article>
  )
}
