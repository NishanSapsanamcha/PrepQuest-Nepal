import { FaCheckCircle, FaLightbulb, FaTimesCircle } from "react-icons/fa";
import { getOptionLabel, getText, normalizeLanguageMode } from "../../utils/practiceUtils";

function AnswerFeedback({ question, isCorrect, selectedOptionKey, languageMode }) {
  const mode = normalizeLanguageMode(languageMode);
  const text = getText(question, mode);
  const correctAnswer = getOptionLabel(question, question.correctOption, mode);
  const selectedAnswer = getOptionLabel(question, selectedOptionKey, mode);

  return (
    <section className={`answer-feedback ${isCorrect ? "correct" : "wrong"}`}>
      <div className="feedback-heading">
        <span className="feedback-icon">{isCorrect ? <FaCheckCircle /> : <FaTimesCircle />}</span>
        <div>
          <h3>{isCorrect ? "Correct! +10 XP" : "Not quite"}</h3>
          <p>{isCorrect ? "Nice work - your answer was correct." : "Good attempt. Review the correction and continue."}</p>
        </div>
      </div>

      <div className="feedback-answer-grid">
        {!isCorrect && (
          <div>
            <span>Your answer</span>
            <strong>{selectedAnswer}</strong>
          </div>
        )}
        <div>
          <span>Correct answer</span>
          <strong>{correctAnswer}</strong>
        </div>
      </div>

      <div className="feedback-explanation">
        <strong>Explanation</strong>
        <span>{text.explanation}</span>
      </div>

      {isCorrect ? (
        <div className="feedback-reward-row">
          <span>XP gained: <strong>+10</strong></span>
          <span>Progress saved</span>
        </div>
      ) : (
        <div className="feedback-tip">
          <FaLightbulb /> {question.topic ? `Review ${question.topic} before your next practice.` : "Review this topic before your next practice."}
        </div>
      )}
    </section>
  );
}

export default AnswerFeedback;
