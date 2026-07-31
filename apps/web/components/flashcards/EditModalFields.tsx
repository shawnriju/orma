import { editFieldsStyles } from './styles'

interface EditModalFieldsProps {
  question: string
  onQuestionChange: (value: string) => void
  answer: string
  onAnswerChange: (value: string) => void
  errorMsg: string
}

export default function EditModalFields({ question, onQuestionChange, answer, onAnswerChange, errorMsg }: EditModalFieldsProps) {
  return (
    <div className={editFieldsStyles.wrap}>
      {errorMsg && (
        <div className={editFieldsStyles.errorBanner}>
          {errorMsg}
        </div>
      )}

      <div className={editFieldsStyles.fieldWrap}>
        <label className={editFieldsStyles.fieldLabel}>Question</label>
        <textarea
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          className={editFieldsStyles.questionTextarea}
        />
      </div>

      <div className={editFieldsStyles.fieldWrap}>
        <label className={editFieldsStyles.fieldLabel}>Answer</label>
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          className={editFieldsStyles.answerTextarea}
        />
      </div>
    </div>
  )
}
