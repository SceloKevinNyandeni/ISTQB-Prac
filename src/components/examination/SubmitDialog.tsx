import { useEffect, useRef } from 'react'
interface Props { total: number; answered: number; flagged: number; onCancel: () => void; onConfirm: () => void }
export default function SubmitDialog({ total, answered, flagged, onCancel, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { ref.current?.showModal() }, [])
  return (
    <dialog ref={ref} className="dialog" onCancel={(e) => { e.preventDefault(); onCancel() }} aria-labelledby="sd-title">
      <h2 id="sd-title">Submit examination?</h2>
      <dl>
        <dt>Total questions</dt><dd>{total}</dd><dt>Answered</dt><dd>{answered}</dd>
        <dt>Unanswered</dt><dd>{total - answered}</dd><dt>Flagged for review</dt><dd>{flagged}</dd>
      </dl>
      <p className="muted">After submission you cannot change your answers.</p>
      <div className="actions"><button className="btn" onClick={onCancel} autoFocus>Return to examination</button><button className="btn primary" onClick={onConfirm}>Submit examination</button></div>
    </dialog>
  )
}
