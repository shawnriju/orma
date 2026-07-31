import { googleAuthButtonStyles } from './styles'

interface GoogleAuthButtonProps {
  onClick: () => void
}

export default function GoogleAuthButton({ onClick }: GoogleAuthButtonProps) {
  return (
    <button
      onClick={onClick}
      className={googleAuthButtonStyles.button}
    >
      <svg className={googleAuthButtonStyles.icon} viewBox="0 0 24 24">
        <path
          fill="#EA4335"
          d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.44 0-6.228-2.788-6.228-6.228 0-3.44 2.788-6.229 6.228-6.229 1.5 0 2.87.53 3.96 1.402l3.107-3.108C18.99 1.94 15.816 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.786 0 10.826-4.04 10.826-11.24 0-.648-.078-1.25-.218-1.955H12.24z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  )
}
