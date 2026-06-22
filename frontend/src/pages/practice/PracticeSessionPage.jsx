import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FaBookmark, FaDoorOpen, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import AnswerFeedback from "../../components/practice/AnswerFeedback";
import QuestionCard from "../../components/practice/QuestionCard";
import { getSubjectById } from "../../data/subjects";
import { buildSubjectProgress, completePracticeSession, getSubjectQuestions, normalizeLanguageMode } from "../../utils/practiceUtils";
import { getReviewQuestions, getUser, saveLastPracticeResult, saveReviewQuestions } from "../../utils/storageUtils";
import { getNextLevelProgress, getSubjectLevel } from "../../utils/xpUtils";
import "./PracticeSessionPage.css";

const soundModules = import.meta.glob("../../assets/audio/*.mp3", { eager: true, import: "default", query: "?url" });
const sounds = Object.entries(soundModules).reduce((library, [path, url]) => {
  const fileName = path.split("/").pop();
  return { ...library, [fileName]: url };
}, {});

function PracticeSessionPage() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = getUser();
  const subject = getSubjectById(subjectId);
  const selectedExam = user.selectedExam || localStorage.getItem("selectedExam");
  const questions = useMemo(() => getSubjectQuestions(subjectId, selectedExam), [subjectId, selectedExam]);
  const progress = buildSubjectProgress(subjectId);
  const level = getSubjectLevel(progress.xp);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionKey, setSelectedOptionKey] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem("prepquest_sound_muted") !== "false");
  const bgAudioRef = useRef(null);
  const languageMode = normalizeLanguageMode(localStorage.getItem("preferredLanguage") || user.preferredLanguage);
  const isRecommendedPractice = searchParams.get("recommended") === "1";

  if (!subject || !questions.length) {
    return (
      <DashboardLayout activeKey="practice">
        <section className="dashboard-content">
          <div className="dashboard-card">
            <h1>No validated practice questions found</h1>
            <p className="card-copy">This subject question bank is not ready yet.</p>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  const question = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const soundAvailable = Boolean(sounds["correct.mp3"] || sounds["wrong.mp3"] || sounds["click.mp3"] || sounds["practice-bg.mp3"]);
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const wrongCount = answers.filter((answer) => !answer.isCorrect).length;
  const answeredCount = answers.length;
  const accuracySoFar = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;
  const subjectLevelProgress = getNextLevelProgress(progress.xp);

  const playSound = (fileName) => {
    if (isMuted || !sounds[fileName]) return;
    const audio = new Audio(sounds[fileName]);
    audio.volume = fileName === "practice-bg.mp3" ? 0.18 : 0.45;
    audio.play().catch(() => {});
  };

  const handleSoundToggle = () => {
    setIsMuted((current) => {
      const next = !current;
      localStorage.setItem("prepquest_sound_muted", String(next));

      if (!next && sounds["practice-bg.mp3"]) {
        const bgAudio = bgAudioRef.current || new Audio(sounds["practice-bg.mp3"]);
        bgAudioRef.current = bgAudio;
        bgAudio.loop = true;
        bgAudio.volume = 0.12;
        bgAudio.play().catch(() => {});
      } else if (bgAudioRef.current) {
        bgAudioRef.current.pause();
      }

      if (!next && sounds["click.mp3"]) {
        const audio = new Audio(sounds["click.mp3"]);
        audio.volume = 0.35;
        audio.play().catch(() => {});
      }

      return next;
    });
  };

  const handleOptionSelect = (optionKey) => {
    if (feedback) return;
    playSound("click.mp3");
    setSelectedOptionKey(optionKey);
  };

  const handleSubmit = () => {
    if (!selectedOptionKey || feedback) return;
    const isCorrect = selectedOptionKey === question.correctOption;
    const answer = {
      questionId: question.id,
      selectedOptionKey,
      correctOption: question.correctOption,
      languageMode,
      isCorrect,
    };
    setAnswers((current) => [...current, answer]);
    setFeedback({ isCorrect, answer });
    playSound(isCorrect ? "correct.mp3" : "wrong.mp3");
  };

  const finishSession = (finalAnswers) => {
    const result = completePracticeSession({
      subjectId,
      subjectName: subject.name,
      answers: finalAnswers,
      questions,
      practiceType: "Quick Practice",
      isRecommendedPractice,
    });
    saveLastPracticeResult(result);
    navigate(`/practice/${subjectId}/result`);
  };

  const handleNext = () => {
    const currentAnswers = feedback?.answer && !answers.some((answer) => answer.questionId === feedback.answer.questionId)
      ? [...answers, feedback.answer]
      : answers;
    if (currentIndex === questions.length - 1) {
      finishSession(currentAnswers);
      return;
    }
    playSound("click.mp3");
    setCurrentIndex((index) => index + 1);
    setSelectedOptionKey("");
    setFeedback(null);
  };

  const handleSkip = () => {
    if (feedback) return;
    const skippedAnswer = {
      questionId: question.id,
      selectedOptionKey: "SKIPPED",
      correctOption: question.correctOption,
      languageMode,
      isCorrect: false,
    };
    const nextAnswers = [...answers, skippedAnswer];
    setAnswers(nextAnswers);
    setFeedback({ isCorrect: false, answer: skippedAnswer });
    playSound("wrong.mp3");
  };

  const handleSaveReview = () => {
    saveReviewQuestions([
      {
        questionId: question.id,
        question_en: question.question_en,
        question_np: question.question_np,
        selectedOptionKey: feedback.answer.selectedOptionKey,
        correctOption: question.correctOption,
        explanation_en: question.explanation_en,
        explanation_np: question.explanation_np,
        topic: question.topic,
        subjectId,
        subjectName: subject.name,
        languageMode,
        question,
        savedAt: new Date().toISOString(),
      },
      ...getReviewQuestions(),
    ]);
    playSound("click.mp3");
  };

  return (
    <DashboardLayout activeKey="practice">
      <header className="dashboard-header session-header">
        <div className="header-left">
          <p className="eyebrow subject-pill">{subject.name}</p>
          <h1>Level {level.level}: {level.name}</h1>
          <p>Quick Practice · Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <div className="header-right">
          <button
            className={`sound-toggle${!soundAvailable ? " unavailable" : ""}`}
            type="button"
            aria-label={isMuted ? "Unmute practice sounds" : "Mute practice sounds"}
            title={soundAvailable ? (isMuted ? "Unmute practice sounds" : "Mute practice sounds") : "Audio files not found"}
            onClick={handleSoundToggle}
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <button className="outline-pill exit-practice-btn" type="button" onClick={() => navigate(`/practice/${subjectId}`)}>
            <FaDoorOpen /> Exit Practice
          </button>
        </div>
      </header>

      <section className="dashboard-content practice-session-content">
        <div className={`practice-board${feedback ? " has-feedback" : ""}`}>
          <div className="board-question-side">
            <div className="board-top-strip">
              <div className="preview-progress-row">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>{progressPercent}% complete</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="progress-strip-footer">
                <span className="xp-chip">+10 XP for correct answer</span>
                <span className="practice-mode-chip">Quick Practice</span>
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
                levelLabel={`Level ${level.level}`}
                onSelectOption={handleOptionSelect}
              />
            </div>

            <div className={`question-actions${feedback ? " answered" : ""}`}>
              <span className="xp-preview">
                {!feedback && "Correct answer reward: +10 XP"}
                {feedback?.isCorrect && "+10 XP earned"}
                {feedback && !feedback.isCorrect && "No XP earned · Review explanation"}
              </span>
              {!feedback ? (
                <>
                  <button className="btn btn-secondary" type="button" onClick={handleSkip}>Skip</button>
                  <button className="btn" type="button" disabled={!selectedOptionKey} onClick={handleSubmit}>Submit Answer</button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary" type="button" onClick={handleSaveReview}>
                    <FaBookmark /> Save for Review
                  </button>
                  <button className="btn" type="button" onClick={handleNext}>{currentIndex === questions.length - 1 ? "Finish Practice" : "Next Question"}</button>
                </>
              )}
            </div>
          </div>

          <aside className="board-coach-panel" aria-label="Practice coach panel">
            <section className="coach-section mini-session-stats">
              <div className="coach-section-heading">
                <span>Session</span>
                <strong>{currentIndex + 1}/{questions.length}</strong>
              </div>
              <div className="summary-grid">
                <div>
                  <span>Correct</span>
                  <strong>{correctCount}</strong>
                </div>
                <div>
                  <span>Wrong</span>
                  <strong>{wrongCount}</strong>
                </div>
                <div>
                  <span>Accuracy</span>
                  <strong>{accuracySoFar}%</strong>
                </div>
                <div>
                  <span>Question</span>
                  <strong>{currentIndex + 1}/{questions.length}</strong>
                </div>
              </div>
            </section>

            <section className="coach-section subject-mini-progress">
              <div className="subject-progress-hero">
                <span>{subject.name}</span>
                <strong>Level {level.level}: {level.name}</strong>
              </div>
              <div className="subject-xp-row">
                <span>{progress.xp} / {subjectLevelProgress.nextLevelXp} XP</span>
                <strong>{subjectLevelProgress.percent}%</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${subjectLevelProgress.percent}%` }} />
              </div>
              <p className="subject-progress-copy">
                {subjectLevelProgress.nextLevel
                  ? `${subjectLevelProgress.remainingXp} XP needed for Level ${subjectLevelProgress.nextLevel.level}: ${subjectLevelProgress.nextLevel.name}`
                  : "Highest subject level reached."}
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
                  <strong>Choose an answer</strong>
                  <p>Select one option and submit to see the explanation.</p>
                  <small>Correct answer gives +10 XP.</small>
                </div>
              )}
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default PracticeSessionPage;
