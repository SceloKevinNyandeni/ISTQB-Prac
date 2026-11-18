import type { ChapterPerf } from '../../services/analyticsService'
import { WEAK_BELOW } from '../../services/analyticsService'
export default function ChapterBars({ chapters }: { chapters: ChapterPerf[] }) {
  return (
    <ul className="bars">
      {chapters.map((c) => (
        <li key={c.chapter}>
          <div className="bar-head"><a href={`#syllabus/${c.chapter}.1`}>{c.chapter}. {c.title}</a>
            <span>{c.accuracy === null ? 'No answers yet' : `${c.accuracy}% (${c.right} of ${c.attempts})`}{c.accuracy !== null && c.accuracy < WEAK_BELOW && c.attempts >= 3 && <strong className="weak"> Needs revision</strong>}</span></div>
          <div className="bar" role="progressbar" aria-label={`Chapter ${c.chapter} accuracy`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.accuracy ?? 0}><div style={{ width: `${c.accuracy ?? 0}%` }} /></div>
        </li>))}
    </ul>
  )
}
