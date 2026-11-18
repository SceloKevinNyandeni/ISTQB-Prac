import type { Question } from '../../types/question'
import { evaluate } from '../../services/answerEvaluator'
interface Props { questions: Question[]; answers: Record<string, string[]>; onBack: () => void; onGoto: (i: number) => void
  onRestart: () => void; onPractiseIncorrect: (ids: string[]) => void; onEnd: () => void }
export default function LearningSummary({ questions, answers, onBack, onGoto, onRestart, onPractiseIncorrect, onEnd }: Props) {
  const evals = questions.map((q) => evaluate(q, answers[q.id]))
  const answered = evals.filter((e) => e.answered).length, correct = evals.filter((e) => e.correct).length
  const wrong = questions.filter((_, i) => evals[i].answered && !evals[i].correct)
  const chapters = [...new Set(questions.map((q) => q.syllabusReference.chapter))].sort((a, b) => Number(a) - Number(b)).map((c) => {
    const qs = questions.map((q, i) => ({ q, e: evals[i] })).filter((x) => x.q.syllabusReference.chapter === c && x.e.answered)
    return { c, title: questions.find((q) => q.syllabusReference.chapter === c)!.syllabusReference.chapterTitle, n: qs.length, ok: qs.filter((x) => x.e.correct).length }
  })
  return (
    <section>
      <div className="q-head"><h1>Session summary</h1><button className="btn" onClick={onBack}>Back to questions</button></div>
      <div className="stats">
        <div><span>Questions in set</span><strong>{questions.length}</strong></div><div><span>Attempted</span><strong>{answered}</strong></div>
        <div className="ok"><span>Correct</span><strong>{correct}</strong></div><div className="bad"><span>Incorrect</span><strong>{answered - correct}</strong></div>
        <div><span>Accuracy</span><strong>{answered ? Math.round((correct / answered) * 100) : 0}%</strong></div>
      </div>
      <h2>By syllabus chapter</h2>
      <table className="table"><thead><tr><th>Chapter</th><th>Attempted</th><th>Correct</th></tr></thead>
        <tbody>{chapters.map((c) => (<tr key={c.c}><td><a href={`#syllabus/${c.c}.1`}>{c.c}. {c.title}</a></td><td>{c.n}</td><td>{c.ok}</td></tr>))}</tbody></table>
      <h2>Questions answered incorrectly</h2>
      {wrong.length === 0 ? <p className="muted">None so far.</p> : (
        <ul className="plain">{wrong.map((q) => (<li key={q.id}><button className="btn small linkish" onClick={() => onGoto(questions.indexOf(q))}>Question {questions.indexOf(q) + 1}</button> – Chapter {q.syllabusReference.chapter}, section {q.syllabusReference.section}</li>))}</ul>)}
      <div className="actions">
        <button className="btn primary" disabled={wrong.length === 0} onClick={() => onPractiseIncorrect(wrong.map((q) => q.id))}>Practise incorrect answers only</button>
        <button className="btn" onClick={onRestart}>Practise this set again</button><button className="btn" onClick={onEnd}>End session</button>
      </div>
    </section>
  )
}
