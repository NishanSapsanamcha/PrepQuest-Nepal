import { FaBookmark, FaCheckCircle, FaLightbulb, FaTimesCircle } from "react-icons/fa";

function AnswerFeedback({ isCorrect, correctAnswer, explanation, onNext, onSaveReview, isLastQuestion }) {
  return (
    <section className={`answer-feedback ${isCorrect ? "correct" : "wrong"}`}>
      <h3>{isCorrect ? <FaCheckCircle /> : <FaTimesCircle />} {isCorrect ? "Correct!" : "Not quite."}</h3>
      {isCorrect ? <p>You earned +10 XP.</p> : <p>Correct Answer: <strong>{correctAnswer}</strong></p>}
      <div className="feedback-explanation">
        <strong>Explanation:</strong>
        <span>{explanation}</span>
      </div>
      {!isCorrect && <div className="feedback-tip"><FaLightbulb /> Review this topic before your next practice.</div>}
      <div className="feedback-actions">
        <button className="btn" type="button" onClick={onNext}>{isLastQuestion ? "Finish Practice" : "Next Question"}</button>
        {!isCorrect && (
          <button className="btn btn-secondary" type="button" onClick={onSaveReview}>
            <FaBookmark /> Save for Review
          </button>
        )}
      </div>
    </section>
  );
}

export default AnswerFeedback;
