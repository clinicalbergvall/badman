import { useId } from 'react'

const mpesaRegex = /^[A-Z0-9]{10}$/

type Props = {
  value: string
  onChange: (v: string) => void
  error?: string
}

export default function MpesaInput({ value, onChange, error }: Props) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="label">M-PESA Code</label>
      <input
        id={id}
        className="input uppercase tracking-wider"
        inputMode="text"
        name="mpesa"
        placeholder="e.g. QJT5L0ABCD"
        maxLength={10}
        pattern={mpesaRegex.source}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase().replace(/\s+/g, ''))}
      />
      <p className="helper">10 characters, letters & numbers</p>
      {error ? <p className="error">{error}</p> : null}
    </div>
  )
}
