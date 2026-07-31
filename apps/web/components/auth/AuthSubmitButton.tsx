import { authSubmitButtonStyles } from './styles'

interface AuthSubmitButtonProps {
  loading: boolean
  loadingLabel: string
  label: string
}

export default function AuthSubmitButton({ loading, loadingLabel, label }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={authSubmitButtonStyles.button}
    >
      {loading ? loadingLabel : label}
    </button>
  )
}
