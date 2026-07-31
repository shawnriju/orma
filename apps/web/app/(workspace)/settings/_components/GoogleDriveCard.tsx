import { googleDriveCardStyles } from './styles'

export default function GoogleDriveCard() {
  return (
    <div className={googleDriveCardStyles.card}>
      <div className={googleDriveCardStyles.textWrap}>
        <h3 className={googleDriveCardStyles.heading}>Google Drive Backup</h3>
        <p className={googleDriveCardStyles.bodyText}>
          Auto-export your notes as Markdown format directly to your Google Drive.
        </p>
      </div>
      <button className={googleDriveCardStyles.comingSoonButton}>
        Coming Soon
      </button>
    </div>
  )
}
