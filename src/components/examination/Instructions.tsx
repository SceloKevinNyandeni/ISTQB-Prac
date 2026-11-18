import { useState } from 'react'
import type { Examination } from '../../types/examination'
interface Props { exam: Examination; onBegin: (extraTime: boolean) => void }
export default function Instructions({ exam, onBegin }: Props) {
  const [extra, setExtra] = useState(false)
  const base = exam.durationMinutes ?? 0
  const withExtra = exam.extraTimePercent ? Math.round(base * (1 + exam.extraTimePercent / 100)) : base
  return (
    <section className="card">
      <h1>{exam.title}</h1>
      <h2>Examination instructions</h2>
      <ul className="plain">
        <li>The examination has <strong>{exam.totalQuestions} questions</strong>, each worth one point ({exam.totalMarks} points in total).</li>
        <li>The time allowed is <strong>{extra ? withExtra : base} minutes</strong>. The timer starts when you press Begin and keeps running if you refresh the page.</li>
        <li>You need <strong>{exam.passMarkPoints} of {exam.totalMarks} points ({exam.passMarkPercent}%)</strong> to pass.</li>
        <li>Select ONE option unless a question asks you to select TWO. A question with two correct answers is marked correct only if both are selected.</li>
        <li>You can move between questions, change answers and flag questions for review before submitting.</li>
        <li>Answers, explanations and your score are shown only after you submit or the time expires. When time expires the examination is submitted automatically.</li>
      </ul>
      {exam.extraTimePercent && (
        <label className="check"><input type="checkbox" checked={extra} onChange={(e) => setExtra(e.target.checked)} />
          My native language is not the examination language (adds {exam.extraTimePercent}% time: {withExtra} minutes)</label>)}
      <div className="actions"><button className="btn primary" onClick={() => onBegin(extra)}>Begin examination</button><a className="btn" href="#practice">Back</a></div>
    </section>
  )
}
