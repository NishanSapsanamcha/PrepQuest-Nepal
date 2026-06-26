import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaAward,
  FaBookOpen,
  FaBullseye,
  FaCheckCircle,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaGraduationCap,
  FaHistory,
  FaLanguage,
  FaListAlt,
  FaLock,
  FaShieldAlt,
  FaStar,
} from "react-icons/fa";
import ConfirmModal from "../../components/common/ConfirmModal";
import { CoinValue, RewardDisplay } from "../../components/common/Coin";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { mockTestRules } from "../../data/mockTestMockData";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import {
  EXTRA_MOCK_COST,
  formatMockDuration,
  getMockAttempts,
  getMockContext,
  getMockDashboardStats,
  getMockReadiness,
  getMockTypesForExam,
  getMockBadgeProgress,
  startMockSession,
} from "../../utils/mockTestUtils";
import "./MockTestsPage.css";

const languageLabels = { english: "English", nepali: "Nepali", both: "Both" };

function MockTestsPage() {
  const navigate = useNavigate();
  const { playClick } = usePrepQuestSound();
  const context = getMockContext();
  const stats = getMockDashboardStats();
  const attempts = getMockAttempts();
  const recentAttempts = attempts.slice(0, 5);
  const mockTypes = getMockTypesForExam(context.selectedExam);
  const [emptyState, setEmptyState] = useState("");
  const [paidConfirmMockTypeId, setPaidConfirmMockTypeId] = useState("");
  const badges = getMockBadgeProgress();
  const userCoins = context.user.coins || 0;
  const canUseFree = stats.freeMocksLeft > 0;
  const canUseCoins = !canUseFree && userCoins >= EXTRA_MOCK_COST;
  const fullMock = mockTypes.find((type) => type.type === "full") || mockTypes[0];
  const fullMockReadiness = useMemo(
    () => fullMock ? getMockReadiness(fullMock, context.selectedExam) : null,
    [context.selectedExam, fullMock]
  );

  const handleStart = (mockTypeId = fullMock?.id, options = {}) => {
    playClick();
    setEmptyState("");
    if (!canUseFree && canUseCoins && !options.confirmPaid) {
      setPaidConfirmMockTypeId(mockTypeId);
      return;
    }
    const result = startMockSession(mockTypeId, { confirmPaid: options.confirmPaid });
    if (result.ok) {
      navigate("/mock-tests/session");
      return;
    }
    if (result.reason === "paid_confirmation_required") {
      setPaidConfirmMockTypeId(mockTypeId);
      return;
    }
    if (result.reason === "not_enough_questions") {
      setEmptyState("Not enough validated questions are available for this mock test yet. Add more reviewed questions to the question bank before starting this mock.");
      return;
    }
    if (result.reason === "not_enough_coins") {
      setEmptyState("You used all 3 free mock tests today. Extra mock tests cost 100 coins. Earn more coins through daily quiz, practice, or tomorrow's free mocks.");
    }
  };

  const handleConfirmPaidStart = () => {
    const mockTypeId = paidConfirmMockTypeId || fullMock?.id;
    setPaidConfirmMockTypeId("");
    handleStart(mockTypeId, { confirmPaid: true });
  };

  const statusCards = [
    { label: "Best Mock Score", value: stats.bestScore === null ? "No attempts" : `${stats.bestScore}%`, helper: stats.hasRealAttempts ? "Highest completed mock" : "Complete a mock to set this", Icon: FaStar },
    { label: "Average Accuracy", value: stats.averageAccuracy === null ? "No attempts" : `${stats.averageAccuracy}%`, helper: stats.hasRealAttempts ? "Based on completed mocks" : "Real attempts only", Icon: FaBullseye },
    { label: "Exam Readiness", value: stats.examReadiness === null ? "Not ready" : `${stats.examReadiness}%`, helper: stats.hasRealAttempts ? "Recent mock average" : "Take a mock to calculate", Icon: FaShieldAlt },
    { label: "Completed Mocks", value: stats.totalMocksCompleted.toString(), helper: "Real completed attempts", Icon: FaCheckCircle },
  ];
  const usedFreeMocks = Math.min(stats.freeMocksTotal, stats.freeMocksTotal - stats.freeMocksLeft);
  const accessButtonText = canUseFree ? "Start Free Mock" : canUseCoins ? "Use 100 Coins & Start Mock" : "Not Enough Coins";
  const mockTypeButtonText = canUseFree ? "Start Free Mock" : canUseCoins ? "Use 100 Coins" : "Not Enough Coins";

  return (
    <DashboardLayout activeKey="mock-tests">
      <header className="dashboard-header mock-header">
        <div className="header-left">
          <p className="eyebrow">Exam Readiness</p>
          <h1>Mock Tests</h1>
          <p>Take exam-style Loksewa mock tests, track accuracy, find weak areas, and improve your exam readiness.</p>
        </div>
        <div className="header-right">
          <div className="header-chips">
            <span className="chip"><FaGraduationCap /> Exam: <strong>{context.selectedExamLabel}</strong></span>
            <span className="chip"><FaLanguage /> Language: <strong>{languageLabels[context.preferredLanguage]}</strong></span>
          </div>
        </div>
      </header>

      <section className="dashboard-content mock-tests-content">
        <section className="mock-status-grid" aria-label="Mock test stats">
          {statusCards.map(({ label, value, helper, Icon }) => (
            <article className="stat-card" key={label}>
              <div className="stat-icon"><Icon /></div>
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
                <div className="stat-helper">{helper}</div>
              </div>
            </article>
          ))}
        </section>

        <div className="mock-top-action-grid">
          <section className="dashboard-card mock-hero-card">
            <div>
              <div className="card-heading">
                <h2 className="card-title"><FaListAlt /> Today's Full Mock Test</h2>
                <span className={`status-chip${fullMockReadiness?.ready ? " complete" : ""}`}>
                  {fullMockReadiness?.ready ? "Ready" : "Not Ready Yet"}: {fullMockReadiness?.available || 0}/{fullMock?.questions || 25}
                </span>
              </div>
              <p className="mock-hero-subtitle">A balanced 25-question mock to check your current exam readiness.</p>
              <div className="mock-launch-section">
                <span>Mock Format</span>
                <div className="mock-launch-grid">
                  <strong>25 Questions</strong>
                  <strong>20 Minutes</strong>
                  <strong>Mixed Subjects</strong>
                </div>
              </div>
              <div className="mock-launch-section">
                <span>After Completion</span>
                <div className="mock-launch-grid">
                  <strong>Score Report</strong>
                  <strong>Weak Areas</strong>
                  <strong>Review Answers</strong>
                </div>
              </div>
              <div className="mock-launch-section">
                <span>Rewards</span>
                <div className="mock-reward-row">
                  <strong>Complete <RewardDisplay coins={40} xp={100} /></strong>
                  <strong>80%+ <RewardDisplay coins={30} xp={50} /></strong>
                  <strong>90%+: Badge progress</strong>
                </div>
              </div>
              {fullMockReadiness?.ready && <p className="mock-ready-note">Balanced mixed mock ready across {fullMockReadiness.subjectsAvailable} subjects.</p>}
              {!fullMockReadiness?.ready && (
                <p className="mock-warning"><FaExclamationTriangle /> Need {fullMockReadiness?.missing || 0} more reviewed questions before this full mock can start.</p>
              )}
              <div className="mock-primary-action">
                <button className="btn btn-full" type="button" disabled={!fullMockReadiness?.ready || (!canUseFree && !canUseCoins)} onClick={() => handleStart(fullMock?.id)}>
                  {accessButtonText}
                </button>
                <p className="muted-copy">
                  {canUseFree
                    ? "This will use 1 of your 3 free mock attempts for today after submission."
                    : canUseCoins
                      ? "You used all free mocks today. This extra attempt costs 100 coins."
                      : "Complete daily quiz or practice to earn more coins."}
                </p>
              </div>
              {emptyState && <p className="mock-warning"><FaExclamationTriangle /> {emptyState}</p>}
            </div>
          </section>

          <section className="dashboard-card mock-access-card">
            <div className="card-heading">
              <h2 className="card-title"><FaClipboardCheck /> Daily Mock Access</h2>
            </div>
            <div className="mock-access-hero">
              <strong>{stats.freeMocksLeft} / {stats.freeMocksTotal}</strong>
              <span>free mocks remaining today</span>
            </div>
            <p className="card-copy">{canUseFree ? "Use your free mock to check today's exam readiness." : "You used all free mock tests for today."}</p>
            <div className="mock-access-progress-row">
              <span>Daily free mock progress</span>
              <strong>{usedFreeMocks}/{stats.freeMocksTotal} used</strong>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(usedFreeMocks / stats.freeMocksTotal) * 100}%` }} />
              </div>
            </div>
            <div className="mock-access-details">
              <div><span>Extra attempt</span><strong>{canUseFree ? `${EXTRA_MOCK_COST} coins after free limit` : `${EXTRA_MOCK_COST} coins`}</strong></div>
              <div><span>Your coins</span><strong><CoinValue amount={userCoins} /></strong></div>
            </div>
            <p className="muted-copy">Free attempts reset daily. Extra attempts use coins but basic practice remains free.</p>
            <button className="btn btn-full btn-secondary" type="button" onClick={() => document.querySelector(".mock-section-heading")?.scrollIntoView({ behavior: "smooth" })}>
              View Mock Options
            </button>
          </section>
        </div>

        <div className="mock-layout-grid">
          <div className="mock-main-column">
            <section className="mock-section-heading">
              <h2>Mock Type Selection</h2>
            </section>
            <section className="mock-type-grid">
              {mockTypes.map((mockType) => {
                const readiness = getMockReadiness(mockType, context.selectedExam);
                return (
                  <article className={`dashboard-card mock-type-card${readiness.ready ? " ready" : " not-ready"}`} key={mockType.id}>
                    <div className="mock-card-icon"><FaBookOpen /></div>
                    <h3>{mockType.title}</h3>
                    <p>{mockType.description}</p>
                    <div className="mock-meta-grid">
                      <span>{mockType.questions} questions</span>
                      <span>{mockType.estimatedTime}</span>
                      <span>Difficulty: {mockType.difficulty}</span>
                      <span>{readiness.ready ? "Ready" : "Needs more questions"}: {readiness.available}/{readiness.required}</span>
                    </div>
                    {!readiness.ready && (
                      <p className="mock-card-empty">Not Ready Yet. Only {readiness.available} of {readiness.required} reviewed questions are available. Add {readiness.missing} more reviewed questions to unlock this mock.</p>
                    )}
                    {mockType.type === "full" && readiness.ready && <p className="mock-card-empty ready-copy">Balanced mixed mock ready.</p>}
                    <div className="mock-card-reward">Reward <RewardDisplay coins={40} xp={100} /></div>
                    <button className="action-btn" type="button" disabled={!readiness.ready || (!canUseFree && !canUseCoins)} onClick={() => handleStart(mockType.id)}>
                      {!readiness.ready ? "Not Ready Yet" : mockTypeButtonText}
                    </button>
                  </article>
                );
              })}
            </section>

            <section className="dashboard-card mock-history-card">
              <div className="card-heading">
                <h2 className="card-title"><FaHistory /> Recent Mock History</h2>
                <span className="status-chip">{recentAttempts.length} recent</span>
              </div>
              {recentAttempts.length ? (
                <div className="mock-history-list">
                  {recentAttempts.map((attempt) => (
                    <article className="mock-history-item" key={attempt.id}>
                      <div>
                        <h3>{attempt.mockTitle}</h3>
                        <p>Score: {attempt.accuracy}% - Time: {formatMockDuration(attempt.timeTakenSeconds)}</p>
                        <span>Weak Subject: {attempt.weakestSubject || "None"}</span>
                      </div>
                      <div className="history-result">
                        <strong>{attempt.readinessLabel}</strong>
                        <RewardDisplay coins={attempt.coinsEarned} xp={attempt.xpEarned} />
                        <button className="btn btn-secondary" type="button" onClick={() => { playClick(); navigate("/mock-tests/result", { state: { resultId: attempt.id } }); }}>
                          Review Result
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="card-copy">No mock tests completed yet. Take your first mock to see score, weak areas, and rewards.</p>
              )}
            </section>
          </div>

          <aside className="mock-side-column">
            <section className="dashboard-card">
              <h2 className="card-title"><FaShieldAlt /> Exam Readiness Preview</h2>
              <p className="insight-value">{stats.examReadiness === null ? "Take a mock" : `${stats.examReadiness}%`}</p>
              <p className="card-copy">Recent mock accuracy becomes your readiness checkpoint.</p>
            </section>
            <section className="dashboard-card">
              <h2 className="card-title"><FaAward /> Badge Progress Preview</h2>
              <div className="badge-progress-list">
                {badges.map((badge) => (
                  <div className="badge-progress-item" key={badge.id}>
                    <span>{badge.name}</span>
                    <strong>{badge.progress}/{badge.target}</strong>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, (badge.progress / badge.target) * 100)}%` }} /></div>
                  </div>
                ))}
              </div>
            </section>
            <section className="dashboard-card">
              <h2 className="card-title"><FaLock /> Mock Test Rules</h2>
              <ul className="mock-rules-list">
                {mockTestRules.map((rule) => <li key={rule}>{rule}</li>)}
              </ul>
            </section>
          </aside>
        </div>
      </section>
      <ConfirmModal
        isOpen={Boolean(paidConfirmMockTypeId)}
        title="Use 100 Coins?"
        description={`You have used all 3 free mocks today. This extra mock attempt costs 100 coins.\nYour coins: ${userCoins}\nAfter this attempt: ${Math.max(0, userCoins - EXTRA_MOCK_COST)}`}
        cancelLabel="Cancel"
        confirmLabel="Use Coins & Start"
        confirmAriaLabel="Use coins and start mock"
        onCancel={() => setPaidConfirmMockTypeId("")}
        onConfirm={handleConfirmPaidStart}
      />
    </DashboardLayout>
  );
}

export default MockTestsPage;
