import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaDoorOpen } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import AnswerFeedback from "../../components/practice/AnswerFeedback";
import QuestionCard from "../../components/practice/QuestionCard";
import { getSubjectById } from "../../data/subjects";
import { completePracticeSession, getSubjectQuestions, getText, buildSubjectProgress } from "../../utils/practiceUtils";
import { getReviewQuestions, getUser, saveLastPracticeResult, saveReviewQuestions } from "../../utils/storageUtils";
import { getSubjectLevel } from "../../utils/xpUtils";
import "./PracticeSessionPage.css";

function PracticeSessionPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const subject = getSubjectById(subjectId);
  const questions = useMemo(() => getSubjectQuestions(subjectId, user.selectedExam), [subjectId, user.selectedExam]);
  const progress = buildSubjectProgress(subjectId);
  const level = getSubjectLevel(progress.xp);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);

  if (!subject || !questions.length) {
    return (
      <DashboardLayout activeKey="practice">
        <section className="dashboard-content"><div className="dashboard-card"><h1>No practice questions found</h1></div></section>
      </DashboardLayout>
    );
  }

  const question = questions[currentIndex];
  const text = getText(question, user.preferredLanguage);
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSubmit = () => {
    if (!selectedAnswer || feedback) return;
    const normalizedAnswer = selectedAnswer.split(" / ")[0];
    const isCorrect = normalizedAnswer === question.correctAnswer || selectedAnswer === text.correctAnswer;
    const answer = {
      questionId: question.id,
      userAnswer: selectedAnswer,
      correctAnswer: text.correctAnswer,
      isCorrect,
    };
    setAnswers((current) => [...current, answer]);
    setFeedback({ isCorrect, answer });
  };

  const finishSession = (finalAnswers) => {
    const result = completePracticeSession({
      subjectId,
      subjectName: subject.name,
      answers: finalAnswers,
      questions,
      practiceType: "Quick Practice",
    });
    saveLastPracticeResult(result);
    navigate(`/practice/${subjectId}/result`);
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      finishSession(answers);
      return;
    }
    setCurrentIndex((index) => index + 1);
    setSelectedAnswer("");
    setFeedback(null);
  };

  const handleSkip = () => {
    if (feedback) return;
    const skippedAnswer = {
      questionId: question.id,
      userAnswer: "Skipped",
      correctAnswer: text.correctAnswer,
      isCorrect: false,
    };
    const nextAnswers = [...answers, skippedAnswer];
    setAnswers(nextAnswers);
    setFeedback({ isCorrect: false, answer: skippedAnswer });
  };

  const handleSaveReview = () => {
    saveReviewQuestions([
      { ...feedback.answer, question, subjectId, subjectName: subject.name, savedAt: new Date().toISOString() },
      ...getReviewQuestions(),
    ]);
  };

  return (
    <DashboardLayout activeKey="practice">
      <header className="dashboard-header session-header">
        <div className="header-left">
          <p className="eyebrow">{subject.name}</p>
          <h1>Level {level.level}: {level.name}</h1>
          <p>Quick Practice · Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <div className="header-right">
          <button className="outline-pill" type="button" onClick={() => navigate(`/practice/${subjectId}`)}>
            <FaDoorOpen /> Exit Practice
          </button>
        </div>
      </header>

      <section className="dashboard-content practice-session-content">
        <div className="session-progress">
          <div className="preview-progress-row">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <QuestionCard
          questionText={text.question}
          options={text.options}
          selectedAnswer={selectedAnswer}
          feedbackShown={Boolean(feedback)}
          onSelect={setSelectedAnswer}
        />

        <div className="question-actions">
          <span className="xp-preview">Correct answer reward: +10 XP</span>
          <button className="btn btn-secondary" type="button" disabled={Boolean(feedback)} onClick={handleSkip}>Skip</button>
          <button className="btn" type="button" disabled={!selectedAnswer || Boolean(feedback)} onClick={handleSubmit}>Submit Answer</button>
        </div>

        {feedback && (
          <AnswerFeedback
            isCorrect={feedback.isCorrect}
            correctAnswer={text.correctAnswer}
            explanation={text.explanation}
            onNext={handleNext}
            onSaveReview={handleSaveReview}
            isLastQuestion={currentIndex === questions.length - 1}
          />
        )}
      </section>
    </DashboardLayout>
  );
}

export default PracticeSessionPage;
