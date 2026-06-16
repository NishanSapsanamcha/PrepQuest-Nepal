import { FaRedo } from "react-icons/fa";
import { getText } from "../../utils/practiceUtils";

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
          const text = getText(item.question, language);
          return (
            <article className="wrong-review-item" key={`${item.questionId}-${item.savedAt || item.userAnswer}`}>
              <span className="subject-badge">{item.question.topic}</span>
              <h3>{text.question}</h3>
              <p>Your answer: <strong>{item.userAnswer || "Skipped"}</strong></p>
              <p>Correct answer: <strong>{text.correctAnswer}</strong></p>
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
