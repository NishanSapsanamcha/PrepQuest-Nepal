import { getText } from "../../utils/practiceUtils";

function QuestionCard({ question, selectedOptionKey, onSelectOption, languageMode, isAnswered }) {
  const text = getText(question, languageMode);

  return (
    <section className="dashboard-card question-card">
      <p className="question-text">{text.question}</p>
      <div className="answer-options">
        {text.options.map((option) => (
          <button
            className={`answer-option${selectedOptionKey === option.key ? " selected" : ""}`}
            type="button"
            key={option.key}
            disabled={isAnswered}
            onClick={() => onSelectOption(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuestionCard;
