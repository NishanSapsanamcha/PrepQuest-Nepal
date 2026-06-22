import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookmark,
  FaCheckCircle,
  FaLightbulb,
  FaRedo,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
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
  { key: "saved", label: "Saved Questions", icon: FaBookmark },
  { key: "wrong", label: "Wrong Answers", icon: FaRedo },
  { key: "weak", label: "Weak Topics", icon: FaLightbulb },
];

function formatReviewDate(value) {
  if (!value) return "Saved recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved recently";

  return `Saved ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  })}`;
}

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
  const languageMode = normalizeLanguageMode(
    localStorage.getItem("preferredLanguage") || user.preferredLanguage
  );
  const [savedQuestions, setSavedQuestions] = useState(getSavedReviewQuestions);
  const [wrongAnswers, setWrongAnswers] = useState(getWrongAnswerReview);
  const [reviewItem, setReviewItem] = useState(null);
  const [selectedOptionKey, setSelectedOptionKey] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const activeTab = tabs.some((tab) => tab.key === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "saved";
  const activeWrongAnswers = wrongAnswers.filter((item) => !item.mastered);
  const weakTopics = useMemo(() => getWeakTopicsFromWrongAnswers(), [wrongAnswers]);

  const allItems =
    activeTab === "saved"
      ? savedQuestions
      : activeTab === "wrong"
      ? activeWrongAnswers
      : [];
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set(allItems.map((item) => item.subjectName));
    return Array.from(subjects).sort();
  }, [allItems]);

  const uniqueDifficulties = useMemo(() => {
    const difficulties = new Set(allItems.map((item) => item.difficulty));
    return Array.from(difficulties).sort();
  }, [allItems]);

  const filteredAndSortedItems = useMemo(() => {
    let items = activeTab === "saved" ? savedQuestions : activeWrongAnswers;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const question = getText(toQuestion(item), languageMode);
        return (
          question.question.toLowerCase().includes(query) ||
          item.subjectName?.toLowerCase().includes(query) ||
          item.topic?.toLowerCase().includes(query) ||
          item.difficulty?.toLowerCase().includes(query)
        );
      });
    }

    if (selectedSubject !== "all") {
      items = items.filter((item) => item.subjectName === selectedSubject);
    }

    if (selectedDifficulty !== "all") {
      items = items.filter((item) => item.difficulty === selectedDifficulty);
    }

    let sorted = [...items];
    if (sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.savedAt || b.answeredAt) - new Date(a.savedAt || a.answeredAt));
    } else if (sortBy === "oldest") {
      sorted.sort((a, b) => new Date(a.savedAt || a.answeredAt) - new Date(b.savedAt || b.answeredAt));
    } else if (sortBy === "subject") {
      sorted.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
    } else if (sortBy === "difficulty") {
      sorted.sort((a, b) => {
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        return (order[a.difficulty] || 0) - (order[b.difficulty] || 0);
      });
    }

    return sorted;
  }, [activeTab, savedQuestions, activeWrongAnswers, searchQuery, selectedSubject, selectedDifficulty, sortBy, languageMode]);

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
          <button className="btn btn-secondary" type="button" onClick={() => setReviewItem(null)}>
            Close
          </button>
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
          <button
            className="btn"
            type="button"
            disabled={!selectedOptionKey || Boolean(feedback)}
            onClick={handleSubmitReview}
          >
            Submit Review Answer
          </button>
          {feedback?.isCorrect && reviewItem.source === "wrong" && (
            <span className="mastered-note">
              <FaCheckCircle /> Mastered
            </span>
          )}
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

  const renderCompactListItem = (item, source) => {
    const question = toQuestion(item);
    const text = getText(question, languageMode);
    const primaryTopic = item.topic || item.subjectName || "General Review";
    const showSubjectMeta = item.subjectName && item.subjectName !== primaryTopic;
    const isSelected =
      reviewItem?.questionId === item.questionId && reviewItem?.source === source;

    return (
      <button
        key={`${source}-${item.questionId}`}
        className={`review-list-item ${isSelected ? "active" : ""}`}
        type="button"
        onClick={() => startReview(item, source)}
      >
        <div className="list-item-chips">
          <span className="chip chip-topic">{primaryTopic}</span>
          {item.difficulty && <span className="chip chip-difficulty">{item.difficulty}</span>}
          {item.mastered && <span className="chip chip-status">Mastered</span>}
        </div>
        <p className="list-item-question">{text.question}</p>
        <div className="list-item-meta">
          <span>
            {source === "wrong"
              ? `Attempts: ${item.attemptsCount || 1}`
              : formatReviewDate(item.savedAt)}
          </span>
          {showSubjectMeta && (
            <>
              <span className="meta-separator">·</span>
              <span>{item.subjectName}</span>
            </>
          )}
        </div>
      </button>
    );
  };

  const renderDetailPanel = () => {
    if (!reviewItem) {
      return (
        <div className="review-detail-panel empty-detail">
          <div className="empty-detail-content">
            <FaBookmark className="empty-detail-icon" />
            <h3>Select a question</h3>
            <p>Choose a saved question or mistake to view the answer and explanation.</p>
          </div>
        </div>
      );
    }

    const question = toQuestion(reviewItem);
    const text = getText(question, languageMode);
    const previousAnswer = reviewItem.selectedOptionKey
      ? getOptionLabel(question, reviewItem.selectedOptionKey, languageMode)
      : "";
    const correctAnswer = getOptionLabel(
      question,
      question.correctOption,
      languageMode
    );
    const source = reviewItem.source;

    return (
      <div className="review-detail-panel">
        <div className="detail-header">
          <div className="detail-meta">
            <span className="chip chip-subject">{reviewItem.subjectName}</span>
            {reviewItem.topic && <span className="chip chip-topic">{reviewItem.topic}</span>}
            {reviewItem.difficulty && (
              <span className="chip chip-difficulty">{reviewItem.difficulty}</span>
            )}
          </div>
        </div>

        <div className="detail-question-section">
          <h3 className="detail-question">{text.question}</h3>
        </div>

        {source === "wrong" && (
          <div className="detail-answer-section">
            <div className="answer-item your-answer">
              <span className="answer-label">Your Answer</span>
              <p className="answer-text">{previousAnswer}</p>
            </div>
            <div className="answer-item correct-answer">
              <span className="answer-label">Correct Answer</span>
              <p className="answer-text">{correctAnswer}</p>
            </div>
          </div>
        )}

        <div className="detail-explanation">
          <p className="explanation-text">{text.explanation}</p>
        </div>

        {source === "wrong" && (
          <div className="detail-meta-info">
            <span>Attempts: {reviewItem.attemptsCount || 1}</span>
          </div>
        )}
      </div>
    );
  };

  const getSummaryData = () => ({
    savedCount: savedQuestions.length,
    wrongCount: activeWrongAnswers.length,
    weakCount: weakTopics.length,
  });

  const summaryData = getSummaryData();

  return (
    <DashboardLayout activeKey="practice">
      <header className="dashboard-header practice-header review-header">
        <div className="header-left">
          <p className="eyebrow">Practice Mode</p>
          <h1>Review &amp; Mistakes</h1>
          <p>Revisit saved questions, learn from wrong answers, and strengthen weak topics.</p>
        </div>
        <div className="header-right">
          <button
            className="outline-pill"
            type="button"
            onClick={() => navigate("/practice")}
          >
            <FaArrowLeft /> Back to Practice
          </button>
        </div>
      </header>

      <section className="dashboard-content practice-review-content">
        {/* Summary Cards */}
        <div className="review-summary-row">
          <div className="summary-card">
            <span className="summary-icon"><FaBookmark /></span>
            <div>
              <p className="summary-label">Saved Questions</p>
              <p className="summary-count">{summaryData.savedCount}</p>
            </div>
          </div>
          <div className="summary-card">
            <span className="summary-icon"><FaRedo /></span>
            <div>
              <p className="summary-label">Wrong Answers</p>
              <p className="summary-count">{summaryData.wrongCount}</p>
            </div>
          </div>
          <div className="summary-card">
            <span className="summary-icon"><FaLightbulb /></span>
            <div>
              <p className="summary-label">Weak Topics</p>
              <p className="summary-count">{summaryData.weakCount}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="review-tabs-wrapper">
          <div className="review-tabs" role="tablist" aria-label="Review center tabs">
            {tabs.map((tab) => {
              const count =
                tab.key === "saved"
                  ? summaryData.savedCount
                  : tab.key === "wrong"
                  ? summaryData.wrongCount
                  : summaryData.weakCount;
              return (
                <button
                  key={tab.key}
                  className={`review-tab ${activeTab === tab.key ? "active" : ""}`}
                  type="button"
                  onClick={() => {
                    setSearchParams({ tab: tab.key });
                    setReviewItem(null);
                    setSearchQuery("");
                    setSelectedSubject("all");
                    setSelectedDifficulty("all");
                    setSortBy("newest");
                  }}
                >
                  <tab.icon /> {tab.label}{" "}
                  <span className="tab-count">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls Row */}
        {(activeTab === "saved" || activeTab === "wrong") && (
          <div className="review-controls-row">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search question, subject, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Difficulty</option>
              {uniqueDifficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="subject">Subject</option>
              <option value="difficulty">Difficulty</option>
            </select>
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="review-layout">
          {/* Left Column */}
          <div className="review-list-column">
            {activeTab === "weak" ? (
              weakTopics.length ? (
                <div className="weak-topics-grid">
                  {weakTopics.map((topic) => {
                    const topicMistakes = activeWrongAnswers.filter(
                      (item) =>
                        item.subjectId === topic.subjectId &&
                        (item.topic || "Core concepts") === topic.topic
                    );
                    return (
                      <div key={`${topic.subjectId}-${topic.topic}`} className="weak-topic-item">
                        <div className="weak-topic-content">
                          <h4 className="weak-topic-name">{topic.topic}</h4>
                          <p className="weak-topic-subject">{topic.subjectName}</p>
                          <div className="weak-topic-stats">
                            <span className="stat">{topic.count} mistakes</span>
                          </div>
                        </div>
                        <button
                          className="btn btn-sm"
                          type="button"
                          onClick={() =>
                            topicMistakes.length > 0 &&
                            startReview(topicMistakes[0], "wrong")
                          }
                          disabled={topicMistakes.length === 0}
                        >
                          View Mistakes
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="review-empty-state">
                  <FaLightbulb className="empty-icon" />
                  <h2>No weak topics detected yet</h2>
                  <p>Practice more questions to generate weak topic recommendations.</p>
                  <button className="btn" onClick={() => navigate("/practice")}>
                    <FaArrowLeft /> Start Practice
                  </button>
                </div>
              )
            ) : filteredAndSortedItems.length ? (
              <div className="review-items-list">
                {filteredAndSortedItems.map((item) =>
                  renderCompactListItem(item, activeTab === "saved" ? "saved" : "wrong")
                )}
              </div>
            ) : (
              <div className="review-empty-state">
                {activeTab === "saved" ? (
                  <>
                    <FaBookmark className="empty-icon" />
                    <h2>No saved questions yet</h2>
                    <p>Save difficult questions during practice and they will appear here.</p>
                    <button className="btn" onClick={() => navigate("/practice")}>
                      <FaArrowLeft /> Start Practice
                    </button>
                  </>
                ) : (
                  <>
                    <FaRedo className="empty-icon" />
                    <h2>No mistakes to review</h2>
                    <p>Wrong answers from practice will appear here with explanations.</p>
                    <button className="btn" onClick={() => navigate("/practice")}>
                      <FaArrowLeft /> Start Practice
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="review-detail-column">
            {reviewItem && feedback ? (
              renderReviewPractice()
            ) : reviewItem && selectedOptionKey ? (
              renderReviewPractice()
            ) : reviewItem ? (
              <div className="review-detail-wrapper">
                <div className="detail-close-header">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setReviewItem(null)}
                  >
                    ×
                  </button>
                </div>

                {renderDetailPanel()}

                <div className="detail-actions">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() =>
                      navigate(
                        `/practice/review/session/${reviewItem.questionId || reviewItem.id}?source=${reviewItem.source}`
                      )
                    }
                  >
                    {reviewItem.source === "wrong" ? (
                      <>
                        <FaRedo /> Try Again
                      </>
                    ) : (
                      <>
                        <FaBookmark /> Practice This Question
                      </>
                    )}
                  </button>

                  {reviewItem.source === "wrong" && (
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => {
                        handleMarkMastered(reviewItem.questionId);
                        setWrongAnswers(getWrongAnswerReview());
                      }}
                    >
                      <FaCheckCircle /> Mark as Mastered
                    </button>
                  )}

                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      if (reviewItem.source === "saved") {
                        handleRemoveSaved(reviewItem.questionId);
                      } else {
                        handleRemoveWrong(reviewItem.questionId);
                      }
                      setReviewItem(null);
                    }}
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              </div>
            ) : (
              renderDetailPanel()
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default PracticeReviewPage;
