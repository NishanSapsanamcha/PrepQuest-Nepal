import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaBookmark, FaCheckCircle, FaLightbulb, FaRedo, FaTrash } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import AnswerFeedback from "../../components/practice/AnswerFeedback";
import QuestionCard from "../../components/practice/QuestionCard";
import { getOptionLabel, getText, normalizeLanguageMode } from "../../utils/practiceUtils";
import {
  getSavedReviewQuestions,
  getUser,
  getWeakTopicsFromWrongAnswers,
  getWrongAnswerReview,
  markWrongAnswerMastered,
  removeSavedReviewQuestion,
  removeWrongAnswer,
} from "../../utils/storageUtils";
import "./PracticeSessionPage.css";
import "./PracticeReviewPage.css";

const tabs = [
  { key: "saved", label: "Saved Questions" },
  { key: "wrong", label: "Wrong Answers" },
  { key: "weak", label: "Weak Topics" },
];

function toQuestion(item) {
  return item.question || {
    id: item.questionId,
    subjectId: item.subjectId,
    subject: item.subjectName,
    topic: item.topic,
    difficulty: item.difficulty,
    examTracks: item.examTracks || [],
    question_en: item.question_en,
    question_np: item.question_np,
    options: item.options || [],
    correctOption: item.correctOption,
    explanation_en: item.explanation_en,
    explanation_np: item.explanation_np,
  };
}

function PracticeReviewPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = getUser();
  const languageMode = normalizeLanguageMode(localStorage.getItem("preferredLanguage") || user.preferredLanguage);
  const [savedQuestions, setSavedQuestions] = useState(getSavedReviewQuestions);
  const [wrongAnswers, setWrongAnswers] = useState(getWrongAnswerReview);
  const [reviewItem, setReviewItem] = useState(null);
  const [selectedOptionKey, setSelectedOptionKey] = useState("");
  const [feedback, setFeedback] = useState(null);
  const activeTab = tabs.some((tab) => tab.key === searchParams.get("tab")) ? searchParams.get("tab") : "saved";
  const activeWrongAnswers = wrongAnswers.filter((item) => !item.mastered);
  const weakTopics = useMemo(() => getWeakTopicsFromWrongAnswers(), [wrongAnswers]);

  const startReview = (item, source) => {
    setReviewItem({ ...item, source });
    setSelectedOptionKey("");
    setFeedback(null);
  };

  const handleSubmitReview = () => {
    if (!reviewItem || !selectedOptionKey || feedback) return;
    const question = toQuestion(reviewItem);
    const isCorrect = selectedOptionKey === question.correctOption;
    const answer = {
      selectedOptionKey,
      correctOption: question.correctOption,
      isCorrect,
    };
    setFeedback({ isCorrect, answer });

    if (isCorrect && reviewItem.source === "wrong") {
      markWrongAnswerMastered(question.id);
      setWrongAnswers(getWrongAnswerReview());
    }
  };

  const handleRemoveSaved = (questionId) => {
    removeSavedReviewQuestion(questionId);
    setSavedQuestions(getSavedReviewQuestions());
    if (reviewItem?.questionId === questionId) setReviewItem(null);
  };

  const handleRemoveWrong = (questionId) => {
    removeWrongAnswer(questionId);
    setWrongAnswers(getWrongAnswerReview());
    if (reviewItem?.questionId === questionId) setReviewItem(null);
  };

  const handleMarkMastered = (questionId) => {
    markWrongAnswerMastered(questionId);
    setWrongAnswers(getWrongAnswerReview());
  };

  const renderReviewPractice = () => {
    if (!reviewItem) return null;
    const question = toQuestion(reviewItem);

    return (
      <section className="dashboard-card review-practice-panel">
        <div className="review-practice-heading">
          <div>
            <p className="eyebrow">Review Practice</p>
            <h2>{reviewItem.source === "wrong" ? "Try this mistake again" : "Practice saved question"}</h2>
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => setReviewItem(null)}>Close</button>
        </div>
        <QuestionCard
          question={question}
          selectedOptionKey={selectedOptionKey}
          correctOptionKey={question.correctOption}
          onSelectOption={(optionKey) => !feedback && setSelectedOptionKey(optionKey)}
          languageMode={languageMode}
          isAnswered={Boolean(feedback)}
          levelLabel="Review"
          practiceType={reviewItem.source === "wrong" ? "Mistake Review" : "Saved Review"}
        />
        <div className="review-submit-row">
          <button className="btn" type="button" disabled={!selectedOptionKey || Boolean(feedback)} onClick={handleSubmitReview}>Submit Review Answer</button>
          {feedback?.isCorrect && reviewItem.source === "wrong" && <span className="mastered-note"><FaCheckCircle /> Mastered</span>}
        </div>
        {feedback && (
          <AnswerFeedback
            question={question}
            isCorrect={feedback.isCorrect}
            selectedOptionKey={feedback.answer.selectedOptionKey}
            languageMode={languageMode}
            showReward={false}
          />
        )}
      </section>
    );
  };

  const renderQuestionCard = (item, source) => {
    const question = toQuestion(item);
    const text = getText(question, languageMode);
    const previousAnswer = item.selectedOptionKey ? getOptionLabel(question, item.selectedOptionKey, languageMode) : "";
    const correctAnswer = getOptionLabel(question, question.correctOption, languageMode);

    return (
      <article className="review-list-card" key={`${source}-${item.questionId}`}>
        <div className="review-list-meta">
          <span>{item.subjectName}</span>
          {item.topic && <span>{item.topic}</span>}
          {item.difficulty && <span>{item.difficulty}</span>}
        </div>
        <h3>{text.question}</h3>
        {source === "wrong" && <p>Your previous answer: <strong>{previousAnswer}</strong></p>}
        <p>Correct answer: <strong>{correctAnswer}</strong></p>
        <p>{text.explanation}</p>
        {source === "wrong" && <small>Attempts: {item.attemptsCount || 1}</small>}
        <div className="review-card-actions">
          <button className="btn" type="button" onClick={() => startReview(item, source)}>{source === "wrong" ? <FaRedo /> : <FaBookmark />} {source === "wrong" ? "Try Again" : "Practice This Question"}</button>
          {source === "wrong" ? (
            <>
              <button className="btn btn-secondary" type="button" onClick={() => handleMarkMastered(item.questionId)}><FaCheckCircle /> Mark as Mastered</button>
              <button className="btn btn-secondary" type="button" onClick={() => handleRemoveWrong(item.questionId)}><FaTrash /> Remove</button>
            </>
          ) : (
            <button className="btn btn-secondary" type="button" onClick={() => handleRemoveSaved(item.questionId)}><FaTrash /> Remove from Saved</button>
          )}
        </div>
      </article>
    );
  };

  return (
    <DashboardLayout activeKey="practice">
      <header className="dashboard-header practice-header review-header">
        <div className="header-left">
          <p className="eyebrow">Practice Mode</p>
          <h1>Review &amp; Mistakes</h1>
          <p>Revisit saved questions, learn from wrong answers, and strengthen weak topics.</p>
        </div>
        <div className="header-right">
          <button className="outline-pill" type="button" onClick={() => navigate("/practice")}><FaArrowLeft /> Back to Practice</button>
        </div>
      </header>

      <section className="dashboard-content practice-review-content">
        <div className="review-tabs" role="tablist" aria-label="Review center tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "active" : ""}
              type="button"
              onClick={() => setSearchParams({ tab: tab.key })}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {renderReviewPractice()}

        {activeTab === "saved" && (
          <section className="review-list-section">
            {savedQuestions.length ? savedQuestions.map((item) => renderQuestionCard(item, "saved")) : (
              <div className="dashboard-card review-empty-state">
                <h2>No saved questions yet.</h2>
                <p>Save difficult questions during practice and they will appear here.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === "wrong" && (
          <section className="review-list-section">
            {activeWrongAnswers.length ? activeWrongAnswers.map((item) => renderQuestionCard(item, "wrong")) : (
              <div className="dashboard-card review-empty-state">
                <h2>No wrong answers to review.</h2>
                <p>Great work. Your mistakes will appear here after practice.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === "weak" && (
          <section className="review-list-section weak-topic-list">
            {weakTopics.length ? weakTopics.map((topic) => {
              const item = activeWrongAnswers.find((answer) => answer.subjectId === topic.subjectId && (answer.topic || "Core concepts") === topic.topic);
              return (
                <article className="review-list-card weak-topic-card" key={`${topic.subjectId}-${topic.topic}`}>
                  <div className="review-list-meta">
                    <span>{topic.subjectName}</span>
                    <span>{topic.count} mistakes</span>
                  </div>
                  <h3><FaLightbulb /> {topic.topic}</h3>
                  <p>Recommended topic based on recent mistakes.</p>
                  <div className="review-card-actions">
                    <button className="btn" type="button" disabled={!item} onClick={() => item && startReview(item, "wrong")}>Practice Topic</button>
                  </div>
                </article>
              );
            }) : (
              <div className="dashboard-card review-empty-state">
                <h2>No weak topic detected.</h2>
                <p>Practice more questions to generate recommendations.</p>
              </div>
            )}
          </section>
        )}
      </section>
    </DashboardLayout>
  );
}

export default PracticeReviewPage;
