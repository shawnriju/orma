import { authFieldStyles } from './styles'

interface AuthFieldProps {
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export default function AuthField({ label, type, value, onChange, placeholder }: AuthFieldProps) {
  return (
    <div className={authFieldStyles.wrap}>
      <label className={authFieldStyles.label}>{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={authFieldStyles.input}
      />
    </div>
  )
}
