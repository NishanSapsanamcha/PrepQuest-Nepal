import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { t, translateDifficulty, translateSubjectName } from "../../data/translations";
import { getText } from "../../utils/practiceUtils";

function QuestionCard({ question, selectedOptionKey, correctOptionKey, onSelectOption, languageMode, isAnswered, levelLabel, practiceType, showXpBurst = false }) {
  const text = getText(question, languageMode);

  const getOptionState = (optionKey) => {
    if (!isAnswered) return selectedOptionKey === optionKey ? "selected" : "";
    if (optionKey === correctOptionKey) return "correct";
    if (selectedOptionKey === optionKey) return "wrong";
    return "muted";
  };

  return (
    <section className="dashboard-card question-card">
      <div className="question-meta-row">
        {question.difficulty && <span className="question-pill difficulty">{translateDifficulty(question.difficulty, languageMode)}</span>}
        {question.topic && <span className="question-pill">{translateSubjectName(question.topic, languageMode)}</span>}
        {levelLabel && <span className="question-pill level">{translateSubjectName(levelLabel, languageMode)}</span>}
        {practiceType && <span className="question-pill">{translateSubjectName(practiceType, languageMode)}</span>}
      </div>

      <p className="question-text">{text.question}</p>

      <div className="answer-options">
        {text.options.map((option) => {
          const optionState = getOptionState(option.key);
          const isCorrect = optionState === "correct";
          const isWrong = optionState === "wrong";

          return (
            <button
              className={`answer-option ${optionState}`}
              type="button"
              key={option.key}
              disabled={isAnswered}
              aria-pressed={selectedOptionKey === option.key}
              onClick={() => onSelectOption(option.key)}
            >
              <span className="option-letter">{option.key}</span>
              <span className="option-copy">{option.label}</span>
              {isCorrect && (
                <span className="option-status correct-answer">
                  <FaCheckCircle /> {t("correct", languageMode)}
                </span>
              )}
              {isCorrect && showXpBurst && <span className="floating-xp" aria-hidden="true">+10 XP</span>}
              {isWrong && (
                <span className="option-status your-answer">
                  <FaTimesCircle /> {languageMode === "nepali" ? "तपाईंको उत्तर" : "Your answer"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default QuestionCard;
