import { useEffect, useState } from 'react'
import { Icon } from './components/common/Icon'
import Home from './pages/Home'
import PracticeExaminations from './pages/PracticeExaminations'
import RealTimeExamination from './pages/RealTimeExamination'
import ResultsProgress from './pages/ResultsProgress'
import InteractiveLearning from './pages/InteractiveLearning'
import SyllabusReference from './pages/SyllabusReference'

const NAV = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'practice', label: 'Practice Examinations', icon: 'exam' },
  { id: 'learning', label: 'Interactive Learning', icon: 'learn' },
  { id: 'results', label: 'Results and Progress', icon: 'results' },
  { id: 'syllabus', label: 'Syllabus Reference', icon: 'book' },
] as const
type PageId = (typeof NAV)[number]['id'] | 'realtime'
const parse = (): { id: PageId; param: string } => { const [h, ...rest] = window.location.hash.slice(1).split('/'); const id: PageId = h === 'realtime' ? 'realtime' : (NAV.find((n) => n.id === h)?.id ?? 'home'); return { id, param: rest.join('/') } }

export default function App() {
  const [{ id: page, param }, setRoute] = useState(parse())
  useEffect(() => { const h = () => { setRoute(parse()); window.scrollTo(0, 0) }; window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h) }, [])
  const go = (id: PageId) => { window.location.hash = id }
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">ISTQB</span><span className="brand-sub">Foundation Level Practice Examinations</span></div>
        <nav className="nav" aria-label="Main navigation">
          {NAV.map((n) => (<a key={n.id} href={'#' + n.id} className={n.id === page || (n.id === 'practice' && page === 'realtime') ? 'active' : ''} aria-current={n.id === page ? 'page' : undefined}><Icon name={n.icon} />{n.label}</a>))}
        </nav>
      </header>
      <main className="content">
        {page === 'home' && <Home go={go} />}
        {page === 'practice' && <PracticeExaminations />}
        {page === 'realtime' && <RealTimeExamination />}
        {page === 'learning' && <InteractiveLearning />}
        {page === 'results' && <ResultsProgress />}
        {page === 'syllabus' && <SyllabusReference param={param} />}
      </main>
      <footer className="footer">Questions, answers and explanations: © International Software Testing Qualifications Board (ISTQB®), used for non-commercial exam preparation. Progress is held only in this browser tab and is cleared when the tab closes.</footer>
    </div>
  )
}
