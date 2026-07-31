import { X } from 'lucide-react'
import { editHeaderStyles } from './styles'

interface EditModalHeaderProps {
  onClose: () => void
}

export default function EditModalHeader({ onClose }: EditModalHeaderProps) {
  return (
    <div className={editHeaderStyles.bar}>
      <h2 className={editHeaderStyles.title}>Edit Flashcard</h2>
      <button
        onClick={onClose}
        className={editHeaderStyles.closeButton}
      >
        <X className={editHeaderStyles.closeIcon} />
      </button>
    </div>
  )
}
