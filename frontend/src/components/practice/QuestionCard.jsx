function QuestionCard({ questionText, options, selectedAnswer, feedbackShown, onSelect }) {
  return (
    <section className="dashboard-card question-card">
      <p className="question-text">{questionText}</p>
      <div className="answer-options">
        {options.map((option) => (
          <button
            className={`answer-option${selectedAnswer === option ? " selected" : ""}`}
            type="button"
            key={option}
            disabled={feedbackShown}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuestionCard;
