import { Loader2, Save, Trash2 } from 'lucide-react'
import { editFooterStyles } from './styles'

interface EditModalFooterProps {
  onDelete: () => void
  onCancel: () => void
  onSave: () => void
  isDeleting: boolean
  isSaving: boolean
  canSave: boolean
}

export default function EditModalFooter({ onDelete, onCancel, onSave, isDeleting, isSaving, canSave }: EditModalFooterProps) {
  return (
    <div className={editFooterStyles.bar}>
      <button
        onClick={onDelete}
        disabled={isDeleting || isSaving}
        className={editFooterStyles.deleteButton}
      >
        {isDeleting ? <Loader2 className={`${editFooterStyles.deleteIcon} animate-spin`} /> : <Trash2 className={editFooterStyles.deleteIcon} />}
        <span>Delete</span>
      </button>

      <div className={editFooterStyles.rightGroup}>
        <button
          onClick={onCancel}
          disabled={isSaving || isDeleting}
          className={editFooterStyles.cancelButton}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isSaving || isDeleting || !canSave}
          className={editFooterStyles.saveButton}
        >
          {isSaving ? <Loader2 className={`${editFooterStyles.saveIcon} animate-spin`} /> : <Save className={editFooterStyles.saveIcon} />}
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  )
}
