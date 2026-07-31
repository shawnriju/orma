import { overtimeModalStyles } from './styles'

interface OvertimeWarningModalProps {
  onCancel: () => void
  onConfirm: () => void
}

export default function OvertimeWarningModal({ onCancel, onConfirm }: OvertimeWarningModalProps) {
  return (
    <div className={overtimeModalStyles.backdrop}>
      <div className={overtimeModalStyles.panel}>
        <div>
          <h3 className={overtimeModalStyles.heading}>Start Overtime Session?</h3>
          <p className={overtimeModalStyles.bodyText}>
            You have completed your daily review. Further attempts will fetch future cards and affect their scheduling. Are you sure you want to proceed?
          </p>
        </div>
        <div className={overtimeModalStyles.buttonRow}>
          <button onClick={onCancel} className={overtimeModalStyles.cancelButton}>
            Cancel
          </button>
          <button onClick={onConfirm} className={overtimeModalStyles.confirmButton}>
            Proceed
          </button>
        </div>
      </div>
    </div>
  )
}
