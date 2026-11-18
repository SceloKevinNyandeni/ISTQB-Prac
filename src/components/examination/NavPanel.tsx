export type CellState = 'current' | 'answered' | 'unanswered' | 'correct' | 'incorrect' | 'skipped'
interface Props { count: number; current: number; onGo: (i: number) => void
  state: (i: number) => 'answered' | 'unanswered' | 'correct' | 'incorrect' | 'skipped'; flagged?: (i: number) => boolean; review?: boolean }
export default function NavPanel({ count, current, onGo, state, flagged, review }: Props) {
  return (
    <aside className="navpanel" aria-label="Question navigation">
      <div className="grid-nums">
        {Array.from({ length: count }, (_, i) => {
          const st = state(i); const fl = flagged?.(i) ?? false
          return (<button key={i} type="button" onClick={() => onGo(i)} aria-current={i === current ? 'true' : undefined}
            aria-label={`Question ${i + 1}, ${st}${fl ? ', flagged' : ''}`}
            className={`num ${st}${i === current ? ' current' : ''}${fl ? ' flag' : ''}`}>{i + 1}</button>)
        })}
      </div>
      <ul className="legend">
        {review
          ? (<><li><span className="num correct" />Correct</li><li><span className="num incorrect" />Incorrect</li><li><span className="num skipped" />Not answered</li>{flagged && <li><span className="num flag skipped" />Flagged</li>}</>)
          : (<><li><span className="num answered" />Answered</li><li><span className="num unanswered" />Unanswered</li><li><span className="num flag unanswered" />Flagged</li><li><span className="num unanswered current" />Current</li></>)}
      </ul>
    </aside>
  )
}
