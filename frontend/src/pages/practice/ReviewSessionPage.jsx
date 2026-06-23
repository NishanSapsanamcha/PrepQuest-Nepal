import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FaDoorOpen, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import AnswerFeedback from "../../components/practice/AnswerFeedback";
import QuestionCard from "../../components/practice/QuestionCard";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import { normalizeLanguageMode } from "../../utils/practiceUtils";
import {
  getUser,
  markWrongAnswerMastered,
  getWrongAnswerReview,
  getSavedReviewQuestions,
  saveWrongAnswer,
} from "../../utils/storageUtils";
import "./PracticeSessionPage.css";

function ReviewSessionPage() {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const [searchParams] = useSearchParams();
  const user = getUser();
  const sourceParam = searchParams.get("source") || "auto";
  const reviewSessionIdRef = useRef(`review-${questionId}-${Date.now()}`);

  const [question, setQuestion] = useState(null);
  const [source, setSource] = useState(null);
  const [itemData, setItemData] = useState(null);
  const [selectedOptionKey, setSelectedOptionKey] = useState("");
  const [feedback, setFeedback] = useState(null);
  const { isMuted, toggleMute, playClick, playCorrect, playWrong } = usePrepQuestSound();
  const languageMode = normalizeLanguageMode(localStorage.getItem("preferredLanguage") || user.preferredLanguage);

  useEffect(() => {
    if (!questionId) {
      navigate("/practice/review");
      return;
    }

    // Try to find question in wrong answers first if source is auto or wrong
    if (sourceParam === "auto" || sourceParam === "wrong") {
      const wrongAnswers = getWrongAnswerReview();
      const wrongItem = wrongAnswers.find((item) => item.questionId === questionId);

      if (wrongItem) {
        setSource("wrong");
        setItemData(wrongItem);
        setQuestion(wrongItem.question || wrongItem);
        return;
      }
    }

    // Try to find in saved questions if source is auto or saved
    if (sourceParam === "auto" || sourceParam === "saved") {
      const savedQuestions = getSavedReviewQuestions();
      const savedItem = savedQuestions.find((item) => item.questionId === questionId);

      if (savedItem) {
        setSource("saved");
        setItemData(savedItem);
        setQuestion(savedItem.question || savedItem);
        return;
      }
    }

    // Question not found
    navigate("/practice/review");
  }, [questionId, sourceParam, navigate]);

  if (!question || !source || !itemData) {
    return (
      <DashboardLayout activeKey="practice">
        <section className="dashboard-content">
          <div className="dashboard-card">
            <h1>Loading question...</h1>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  const progressPercent = feedback ? 100 : 0;
  const subjectName = itemData.subjectName || "Subject";
  const isWrongAnswerReview = source === "wrong";
  const titleText = isWrongAnswerReview ? "Learn from This Mistake" : "Practice This Question";
  const subtitleText = isWrongAnswerReview ? "Mistake Review · Question 1 of 1" : "Saved Question Review · Question 1 of 1";

  const handleSoundToggle = () => {
    toggleMute();
  };

  const handleOptionSelect = (optionKey) => {
    if (feedback) return;
    playClick();
    setSelectedOptionKey(optionKey);
  };

  const handleSubmit = () => {
    if (!selectedOptionKey || feedback) return;
    playClick();
    const isCorrect = selectedOptionKey === question.correctOption;

    setFeedback({ isCorrect, answer: { selectedOptionKey, correctOption: question.correctOption, isCorrect } });

    // If this is from wrong answers and user answered correctly, mark as mastered
    if (isCorrect && isWrongAnswerReview) {
      setTimeout(() => {
        markWrongAnswerMastered(question.id || itemData.questionId);
      }, 500);
    }

    // If this is from wrong answers and user answered incorrectly, save as wrong (increment attempts)
    if (!isCorrect && isWrongAnswerReview) {
      saveWrongAnswer(question, selectedOptionKey, languageMode);
    }

    // Play correct/wrong sound after a slight delay
    setTimeout(() => {
      if (isCorrect) playCorrect();
      else playWrong();
    }, 100);
  };

  const handleBackToReview = () => {
    playClick();
    navigate("/practice/review");
  };

  const handleTryAnother = () => {
    playClick();
    setSelectedOptionKey("");
    setFeedback(null);
  };

  return (
    <DashboardLayout activeKey="practice">
      <header className="dashboard-header session-header">
        <div className="header-left">
          <p className="eyebrow subject-pill">{subjectName}</p>
          <h1>{titleText}</h1>
          <p>{subtitleText}</p>
        </div>
        <div className="header-right">
          <button
            className="sound-toggle"
            type="button"
            aria-label={isMuted ? "Sound Off" : "Sound On"}
            title={isMuted ? "Sound Off" : "Sound On"}
            onClick={handleSoundToggle}
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <button
            className="outline-pill exit-practice-btn"
            type="button"
            onClick={() => {
              playClick();
              navigate("/practice/review");
            }}
          >
            <FaDoorOpen /> Back to Review
          </button>
        </div>
      </header>

      <section className="dashboard-content practice-session-content">
        <div className={`practice-board${feedback ? " has-feedback" : ""}`}>
          <div className="board-question-side">
            <div className="board-top-strip">
              <div className="preview-progress-row">
                <span>Question 1 of 1</span>
                <span>{progressPercent}% complete</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="progress-strip-footer">
                <span className="xp-chip">Review mode · No XP reward</span>
                <span className="practice-mode-chip">{isWrongAnswerReview ? "Mistake Review" : "Saved Review"}</span>
              </div>
            </div>

            <div className={`practice-question-stack${feedback?.isCorrect ? " answered-correct" : ""}`}>
              {feedback?.isCorrect && (
                <div className="celebration-burst" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
                </div>
              )}
              <QuestionCard
                question={question}
                selectedOptionKey={selectedOptionKey}
                correctOptionKey={question.correctOption}
                languageMode={languageMode}
                isAnswered={Boolean(feedback)}
                levelLabel={isWrongAnswerReview ? "Mistake" : "Review"}
                onSelectOption={handleOptionSelect}
                showXpBurst={Boolean(feedback?.isCorrect)}
              />
            </div>

            <div className={`question-actions${feedback ? " answered" : ""}`}>
              <span className="xp-preview">
                {!feedback && "Choose an answer to check your understanding"}
                {feedback?.isCorrect && isWrongAnswerReview && "Mastered!"}
                {feedback?.isCorrect && !isWrongAnswerReview && "Correct answer reviewed"}
                {feedback && !feedback.isCorrect && "Review the explanation and try again"}
              </span>
              {!feedback ? (
                <>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleBackToReview}
                  >
                    Back to Review
                  </button>
                  <button
                    className="btn"
                    type="button"
                    disabled={!selectedOptionKey}
                    onClick={handleSubmit}
                  >
                    Submit Answer
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleBackToReview}
                  >
                    Back to Review
                  </button>
                  <button
                    className="btn"
                    type="button"
                    onClick={feedback.isCorrect ? handleBackToReview : handleTryAnother}
                  >
                    {feedback.isCorrect ? "Continue" : "Try Another Answer"}
                  </button>
                </>
              )}
            </div>
          </div>

          <aside className="board-coach-panel" aria-label="Review coach panel">
            <section className="coach-section mini-session-stats">
              <div className="coach-section-heading">
                <span>Review</span>
                <strong>1/1</strong>
              </div>
              <div className="summary-grid">
                <div>
                  <span>Status</span>
                  <strong>{isWrongAnswerReview ? "Mistake" : "Saved"}</strong>
                </div>
                <div>
                  <span>Subject</span>
                  <strong>{subjectName.substring(0, 12)}</strong>
                </div>
                {itemData.difficulty && (
                  <div>
                    <span>Difficulty</span>
                    <strong>{itemData.difficulty}</strong>
                  </div>
                )}
                {isWrongAnswerReview && (
                  <div>
                    <span>Attempts</span>
                    <strong>{itemData.attemptsCount || 1}</strong>
                  </div>
                )}
              </div>
            </section>

            <section className="coach-section subject-mini-progress">
              <div className="subject-progress-hero">
                <span>{subjectName}</span>
                <strong>{isWrongAnswerReview ? "Mistake Review Mode" : "Saved Question Review"}</strong>
              </div>
              <p className="subject-progress-copy" style={{ marginTop: "0.5rem" }}>
                {isWrongAnswerReview
                  ? "Review this mistake to strengthen your understanding."
                  : "Practice this saved question to reinforce your learning."}
              </p>
              <p className="subject-progress-copy" style={{ color: "#99f6e4", fontWeight: 900 }}>
                Review mode does not award normal practice XP.
              </p>
            </section>

            <section className="coach-feedback-shell">
              {feedback ? (
                <AnswerFeedback
                  question={question}
                  isCorrect={feedback.isCorrect}
                  selectedOptionKey={feedback.answer.selectedOptionKey}
                  languageMode={languageMode}
                />
              ) : (
                <div className="coach-placeholder">
                  <span>Coach</span>
                  <p>
                    {isWrongAnswerReview
                      ? "Review this question carefully. Understanding your mistake will help you avoid it in the future."
                      : "Take your time and select the correct answer. This will help reinforce your learning."}
                  </p>
                </div>
              )}
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default ReviewSessionPage;
