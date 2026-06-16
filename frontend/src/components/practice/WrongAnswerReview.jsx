import { FaRedo } from "react-icons/fa";
import { getOptionLabel, getText, normalizeLanguageMode } from "../../utils/practiceUtils";

function WrongAnswerReview({ wrongAnswers, language, onTryAgain }) {
  if (!wrongAnswers?.length) {
    return (
      <section className="dashboard-card">
        <h2 className="card-title">Wrong Answer Review</h2>
        <p className="card-copy">No wrong answers in this session. Clean work.</p>
      </section>
    );
  }

  return (
    <section className="dashboard-card wrong-review">
      <h2 className="card-title">Wrong Answer Review</h2>
      <div className="wrong-review-list">
        {wrongAnswers.map((item) => {
          const question = item.question || {
            id: item.questionId,
            question_en: item.question_en,
            question_np: item.question_np,
            correctOption: item.correctOption,
            explanation_en: item.explanation_en,
            explanation_np: item.explanation_np,
            options: item.options || [],
          };
          const mode = normalizeLanguageMode(language || item.languageMode);
          const text = getText(question, mode);
          return (
            <article className="wrong-review-item" key={`${item.questionId}-${item.savedAt || item.selectedOptionKey}`}>
              <span className="subject-badge">{item.topic || question.topic}</span>
              <h3>{text.question}</h3>
              <p>Your answer: <strong>{getOptionLabel(question, item.selectedOptionKey, mode)}</strong></p>
              <p>Correct answer: <strong>{getOptionLabel(question, item.correctOption, mode)}</strong></p>
              <p>{text.explanation}</p>
              <button className="subject-btn" type="button" onClick={onTryAgain}><FaRedo /> Try Again</button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default WrongAnswerReview;
