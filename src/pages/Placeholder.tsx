export default function Placeholder({ title, phase }: { title: string; phase: string }) {
  return (<section><h1>{title}</h1><p className="muted">This section is built in {phase} of the roadmap.</p></section>)
}
