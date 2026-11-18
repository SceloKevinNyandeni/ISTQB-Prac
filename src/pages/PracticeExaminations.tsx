import { useState } from 'react'
import examinations from '../data/examinations.json'
import type { Examination } from '../types/examination'
import { load, save } from '../utils/sessionStorage'
import { startLearning } from '../hooks/useLearningSession'
import { RT_KEY, prepareRealTime, type RtSession } from '../hooks/useExamSession'

const exams = examinations as Examination[]
export default function PracticeExaminations() {
  const [selected, setSelected] = useState<string>(load('selectedExam', ''))
  const exam = exams.find((e) => e.id === selected && e.available)
  const choose = (id: string) => { setSelected(id); save('selectedExam', id) }
  const active = load<RtSession | null>(RT_KEY, null)
  const startLearn = () => { if (exam && startLearning({ kind: 'exam', examId: exam.id })) window.location.hash = 'learning' }
  const startRealTime = () => { if (exam && prepareRealTime(exam.id)) window.location.hash = 'realtime' }
  return (
    <section>
      <h1>Practice Examinations</h1>
      {active && active.status === 'active' && (<div className="notice" role="status">An examination is in progress. <a href="#realtime" onClick={() => save('selectedExam', active.examId)}>Return to the examination</a></div>)}
      <label htmlFor="exam-select" className="label">Examination paper</label>
      <select id="exam-select" className="select" value={selected} onChange={(e) => choose(e.target.value)}>
        <option value="">Select a practice examination</option>
        {exams.filter((e) => e.available).map((e) => (<option key={e.id} value={e.id}>{e.title}</option>))}
      </select>
      {exam && (
        <div className="card details">
          <h2>{exam.title}</h2>
          <dl>
            <dt>Examination ID</dt><dd>{exam.id}</dd>
            <dt>Questions</dt><dd>{exam.totalQuestions}</dd>
            <dt>Total marks</dt><dd>{exam.totalMarks}</dd>
            <dt>Pass mark</dt><dd>{exam.passMarkPoints !== null ? `${exam.passMarkPoints} of ${exam.totalMarks} (${exam.passMarkPercent}%)` : 'Not defined for this set'}</dd>
            <dt>Duration</dt><dd>{exam.durationMinutes !== null ? `${exam.durationMinutes} minutes` : 'Not defined for this set'}</dd>
            <dt>Syllabus version</dt><dd>{exam.syllabusVersion}</dd>
            <dt>Document version</dt><dd>{exam.questionDocumentVersion} (released {exam.released})</dd>
          </dl>
          {exam.note && <p className="muted">{exam.note}</p>}
          <div className="actions">
            <button className="btn primary" disabled={!exam.realTimeAvailable} title={exam.realTimeAvailable ? '' : 'Not available for this set'} onClick={startRealTime}>Real-Time Examination</button>
            <button className="btn" onClick={startLearn}>Interactive Learning</button>
          </div>
        </div>
      )}
    </section>
  )
}
