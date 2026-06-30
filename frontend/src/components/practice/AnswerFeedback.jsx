import { FaCheckCircle, FaLightbulb, FaTimesCircle } from "react-icons/fa";
import { t, formatReviewTopic } from "../../data/translations";
import { getOptionLabel, getText, normalizeLanguageMode } from "../../utils/practiceUtils";

function AnswerFeedback({ question, isCorrect, selectedOptionKey, languageMode, showReward = true }) {
  const mode = normalizeLanguageMode(languageMode);
  const text = getText(question, mode);
  const correctAnswer = getOptionLabel(question, question.correctOption, mode);
  const selectedAnswer = getOptionLabel(question, selectedOptionKey, mode);

  return (
    <section className={`answer-feedback ${isCorrect ? "correct" : "wrong"}`}>
      <div className="feedback-heading">
        <span className="feedback-icon">{isCorrect ? <FaCheckCircle /> : <FaTimesCircle />}</span>
        <div>
          <h3>{isCorrect ? (showReward ? `${t("correct", mode)}! +10 XP` : t("correct", mode)) : t("wrong", mode)}</h3>
          <p>{isCorrect ? t("niceWorkCorrect", mode) : t("goodAttempt", mode)}</p>
        </div>
      </div>

      <div className="feedback-answer-grid">
        {!isCorrect && (
          <div>
            <span>{t("yourAnswer", mode)}</span>
            <strong>{selectedAnswer}</strong>
          </div>
        )}
        <div>
          <span>{t("correctAnswer", mode)}</span>
          <strong>{correctAnswer}</strong>
        </div>
      </div>

      <div className="feedback-explanation">
        <strong>{t("explanation", mode)}</strong>
        <span>{text.explanation}</span>
      </div>

      {isCorrect && showReward ? (
        <div className="feedback-reward-row">
          <span>{t("xpGained", mode)} <strong>+10</strong></span>
          <span>{t("progressSaved", mode)}</span>
        </div>
      ) : !isCorrect ? (
        <div className="feedback-tip">
          <FaLightbulb /> {question.topic ? formatReviewTopic(question.topic, mode) : t("reviewThisTopic", mode)}
        </div>
      ) : null}
    </section>
  );
}

export default AnswerFeedback;
