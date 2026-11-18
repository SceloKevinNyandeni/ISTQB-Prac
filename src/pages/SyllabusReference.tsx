import { useEffect, useMemo, useState } from 'react'
import syllabus from '../data/syllabus.json'
import type { Block, Chapter, Section, Syllabus } from '../types/syllabus'

const syl = syllabus as Syllabus
const allSections: { ch: Chapter; sec: Section }[] = syl.chapters.flatMap((ch) => ch.sections.map((sec) => ({ ch, sec })))
const textOf = (s: Section) => [s.title, ...s.learningObjectives.map((l) => l.id + ' ' + l.text), ...s.content.map((b) => b.text),
  ...s.subsections.flatMap((u) => [u.number + ' ' + u.title, ...u.content.map((b) => b.text)])].join(' \n ')

function Blocks({ blocks }: { blocks: Block[] }) {
  const out: JSX.Element[] = []; let list: Block[] = []
  const flush = () => { if (list.length) { out.push(<ul key={'l' + out.length}>{list.map((b, i) => <li key={i}>{b.text}</li>)}</ul>); list = [] } }
  blocks.forEach((b, i) => { if (b.type === 'li') list.push(b); else { flush(); out.push(<p key={i}>{b.text}</p>) } })
  flush(); return <>{out}</>
}
const go = (sec: string, lo?: string) => { window.location.hash = 'syllabus/' + sec + (lo ? '/' + lo : '') }

export default function SyllabusReference({ param }: { param: string }) {
  const [secNo, loId] = param.split('/')
  const current = allSections.find((x) => x.sec.number === secNo) ?? allSections[0]
  const [query, setQuery] = useState('')
  useEffect(() => { document.getElementById('lo-hl')?.scrollIntoView({ block: 'center' }) }, [param])
  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1); if (!words.length) return []
    return allSections.map(({ ch, sec }) => {
      const full = textOf(sec); const low = full.toLowerCase()
      if (!words.every((w) => low.includes(w))) return null
      const titleHits = words.filter((w) => sec.title.toLowerCase().includes(w)).length
      const i = low.indexOf(words[0]); const snip = full.slice(Math.max(0, i - 60), i + 140).replace(/\s+/g, ' ')
      return { ch, sec, score: titleHits * 10 + words.reduce((n, w) => n + low.split(w).length - 1, 0), snip }
    }).filter((x): x is NonNullable<typeof x> => x !== null).sort((a, b) => b.score - a.score).slice(0, 20)
  }, [query])
  const { ch, sec } = current
  return (
    <section>
      <h1>Syllabus Reference</h1>
      <p className="muted">ISTQB Certified Tester Foundation Level, syllabus version {syl.version}.</p>
      <label htmlFor="syl-search" className="label">Search the syllabus</label>
      <input id="syl-search" type="search" className="select" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="For example: boundary value analysis" />
      <div className="syl-layout">
        <nav className="syl-nav" aria-label="Syllabus chapters and sections">
          {syl.chapters.map((c) => (
            <div key={c.number}><h2 className="syl-ch">{c.number}. {c.title}</h2>
              <ul>{c.sections.map((s) => (<li key={s.number}><a href={`#syllabus/${s.number}`} aria-current={s.number === sec.number ? 'true' : undefined} className={s.number === sec.number ? 'active' : ''}>{s.number} {s.title}</a></li>))}</ul></div>))}
        </nav>
        <div className="syl-main">
          {query.trim() ? (
            <div><h2>{results.length} result{results.length === 1 ? '' : 's'} for “{query}”</h2>
              {results.map((r) => (<div key={r.sec.number} className="card result"><a href={`#syllabus/${r.sec.number}`} onClick={() => setQuery('')}><strong>{r.sec.number} {r.sec.title}</strong></a>
                <div className="muted small-print">Chapter {r.ch.number} – {r.ch.title}</div><p>…{r.snip}…</p></div>))}</div>
          ) : (
            <article>
              <div className="muted small-print">Chapter {ch.number} – {ch.title} ({ch.minutes} minutes)</div>
              <h2 className="syl-title">{sec.number} {sec.title}</h2>
              <h3>Learning objectives</h3>
              <ul className="los">{sec.learningObjectives.map((l) => (<li key={l.id} id={l.id === loId ? 'lo-hl' : undefined} className={l.id === loId ? 'hl' : ''}><strong>{l.id}</strong> ({l.k}) {l.text}</li>))}</ul>
              <Blocks blocks={sec.content} />
              {sec.subsections.map((u) => (<div key={u.number}><h3>{u.number} {u.title}</h3><Blocks blocks={u.content} /></div>))}
              <div className="actions">
                {(() => { const i = allSections.indexOf(current); return (<><button className="btn" disabled={i === 0} onClick={() => go(allSections[i - 1].sec.number)}>Previous section</button>
                  <button className="btn" disabled={i === allSections.length - 1} onClick={() => go(allSections[i + 1].sec.number)}>Next section</button></>) })()}
              </div>
            </article>)}
        </div>
      </div>
    </section>
  )
}
