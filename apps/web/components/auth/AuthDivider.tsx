import { authDividerStyles } from './styles'

export default function AuthDivider() {
  return (
    <div className={authDividerStyles.wrap}>
      <div className={authDividerStyles.line}></div>
      <span className={authDividerStyles.label}>or</span>
      <div className={authDividerStyles.line}></div>
    </div>
  )
}
