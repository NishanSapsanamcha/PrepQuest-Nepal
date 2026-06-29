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
import { languageLabel as getLanguageLabel, t, translateExamName, translateSubjectName, translateDifficulty } from "../../data/translations";
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
      setEmptyState(t("notEnoughQuestionsMock", context.preferredLanguage));
      return;
    }
    if (result.reason === "not_enough_coins") {
      setEmptyState(t("usedAllFreeMocksMsg", context.preferredLanguage));
    }
  };

  const handleConfirmPaidStart = () => {
    const mockTypeId = paidConfirmMockTypeId || fullMock?.id;
    setPaidConfirmMockTypeId("");
    handleStart(mockTypeId, { confirmPaid: true });
  };

  const lang = context.preferredLanguage;
  const statusCards = [
    { label: t("bestMockScore", lang), value: stats.bestScore === null ? t("noAttempts", lang) : `${stats.bestScore}%`, helper: stats.hasRealAttempts ? t("highestCompletedMock", lang) : t("completeMockToSet", lang), Icon: FaStar },
    { label: t("averageAccuracy", lang), value: stats.averageAccuracy === null ? t("noAttempts", lang) : `${stats.averageAccuracy}%`, helper: stats.hasRealAttempts ? t("basedOnCompletedMocks", lang) : t("realAttemptsOnly", lang), Icon: FaBullseye },
    { label: t("examReadinessTitle", lang), value: stats.examReadiness === null ? t("notReadyStat", lang) : `${stats.examReadiness}%`, helper: stats.hasRealAttempts ? t("recentMockAverage", lang) : t("takeMockToCalculate", lang), Icon: FaShieldAlt },
    { label: t("completedMocks", lang), value: stats.totalMocksCompleted.toString(), helper: t("realCompletedAttempts", lang), Icon: FaCheckCircle },
  ];
  const usedFreeMocks = Math.min(stats.freeMocksTotal, stats.freeMocksTotal - stats.freeMocksLeft);
  const accessButtonText = canUseFree ? t("startFreeMock", lang) : canUseCoins ? t("use100Start", lang) : t("notEnoughCoins", lang);
  const mockTypeButtonText = canUseFree ? t("startFreeMock", lang) : canUseCoins ? t("use100Coins", lang) : t("notEnoughCoins", lang);

  return (
    <DashboardLayout activeKey="mock-tests">
      <header className="dashboard-header mock-header">
        <div className="header-left">
          <p className="eyebrow">{t("examReadinessTitle", lang)}</p>
          <h1>{t("mockTestsTitle", lang)}</h1>
          <p>{t("mockTestsSubtitle", lang)}</p>
        </div>
        <div className="header-right">
          <div className="header-chips">
            <span className="chip"><FaGraduationCap /> {t("exam", lang)}: <strong>{translateExamName(context.selectedExamLabel, lang)}</strong></span>
            <span className="chip"><FaLanguage /> {t("language", lang)}: <strong>{getLanguageLabel(lang)}</strong></span>
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
                <h2 className="card-title"><FaListAlt /> {t("todaysFullMock", lang)}</h2>
                <span className={`status-chip${fullMockReadiness?.ready ? " complete" : ""}`}>
                  {fullMockReadiness?.ready ? t("ready", lang) : t("notReadyYet", lang)}: {fullMockReadiness?.available || 0}/{fullMock?.questions || 25}
                </span>
              </div>
              <p className="mock-hero-subtitle">{t("mockHeroSubtitle", lang)}</p>
              <div className="mock-launch-section">
                <span>{t("mockFormat", lang)}</span>
                <div className="mock-launch-grid">
                  <strong>{t("questions25", lang)}</strong>
                  <strong>{t("minutes20", lang)}</strong>
                  <strong>{t("mixedSubjects", lang)}</strong>
                </div>
              </div>
              <div className="mock-launch-section">
                <span>{t("afterCompletion", lang)}</span>
                <div className="mock-launch-grid">
                  <strong>{t("scoreReport", lang)}</strong>
                  <strong>{t("weakAreas", lang)}</strong>
                  <strong>{t("reviewAnswers", lang)}</strong>
                </div>
              </div>
              <div className="mock-launch-section">
                <span>{t("rewardsWord", lang)}</span>
                <div className="mock-reward-row">
                  <strong>{t("complete", lang)} <RewardDisplay coins={40} xp={100} /></strong>
                  <strong>80%+ <RewardDisplay coins={30} xp={50} /></strong>
                  <strong>90%+: {t("badgeProgressWord", lang)}</strong>
                </div>
              </div>
              {fullMockReadiness?.ready && <p className="mock-ready-note">{t("balancedMockReady", lang)}</p>}
              {!fullMockReadiness?.ready && (
                <p className="mock-warning"><FaExclamationTriangle /> {t("notReadyYet", lang)}</p>
              )}
              <div className="mock-primary-action">
                <button className="btn btn-full" type="button" disabled={!fullMockReadiness?.ready || (!canUseFree && !canUseCoins)} onClick={() => handleStart(fullMock?.id)}>
                  {accessButtonText}
                </button>
                <p className="muted-copy">
                  {canUseFree
                    ? t("willUseFreeAttempt", lang)
                    : canUseCoins
                      ? t("extraCosts100", lang)
                      : t("completeToEarnCoins", lang)}
                </p>
              </div>
              {emptyState && <p className="mock-warning"><FaExclamationTriangle /> {emptyState}</p>}
            </div>
          </section>

          <section className="dashboard-card mock-access-card">
            <div className="card-heading">
              <h2 className="card-title"><FaClipboardCheck /> {t("dailyMockAccess", lang)}</h2>
            </div>
            <div className="mock-access-hero">
              <strong>{stats.freeMocksLeft} / {stats.freeMocksTotal}</strong>
              <span>{t("freeMocksRemainingToday", lang)}</span>
            </div>
            <p className="card-copy">{canUseFree ? t("useFreeMockCheck", lang) : t("usedAllFreeMocks", lang)}</p>
            <div className="mock-access-progress-row">
              <span>{t("dailyFreeMockProgress", lang)}</span>
              <strong>{usedFreeMocks}/{stats.freeMocksTotal} {t("usedLabel", lang)}</strong>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(usedFreeMocks / stats.freeMocksTotal) * 100}%` }} />
              </div>
            </div>
            <div className="mock-access-details">
              <div><span>{t("extraAttempt", lang)}</span><strong>{EXTRA_MOCK_COST} {t("coinsWord", lang)}</strong></div>
              <div><span>{t("yourCoins", lang)}</span><strong><CoinValue amount={userCoins} /></strong></div>
            </div>
            <p className="muted-copy">{t("freeAttemptsReset", lang)}</p>
            <button className="btn btn-full btn-secondary" type="button" onClick={() => document.querySelector(".mock-section-heading")?.scrollIntoView({ behavior: "smooth" })}>
              {t("viewMockOptions", lang)}
            </button>
          </section>
        </div>

        <div className="mock-layout-grid">
          <div className="mock-main-column">
            <section className="mock-section-heading">
              <h2>{t("mockTypeSelection", lang)}</h2>
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
                      <span>{mockType.questions} {t("questionsWord", lang)}</span>
                      <span>{mockType.estimatedTime}</span>
                      <span>{t("difficultyLabel", lang)}: {translateDifficulty(mockType.difficulty, lang)}</span>
                      <span>{readiness.ready ? t("ready", lang) : t("needsMoreQuestions", lang)}: {readiness.available}/{readiness.required}</span>
                    </div>
                    {!readiness.ready && (
                      <p className="mock-card-empty">{t("notReadyYet", lang)}</p>
                    )}
                    {mockType.type === "full" && readiness.ready && <p className="mock-card-empty ready-copy">{t("balancedMockReady", lang)}</p>}
                    <div className="mock-card-reward">{t("rewardWord", lang)} <RewardDisplay coins={40} xp={100} /></div>
                    <button className="action-btn" type="button" disabled={!readiness.ready || (!canUseFree && !canUseCoins)} onClick={() => handleStart(mockType.id)}>
                      {!readiness.ready ? t("notReadyYet", lang) : mockTypeButtonText}
                    </button>
                  </article>
                );
              })}
            </section>

            <section className="dashboard-card mock-history-card">
              <div className="card-heading">
                <h2 className="card-title"><FaHistory /> {t("recentMockHistory", lang)}</h2>
                <span className="status-chip">{recentAttempts.length} {t("recentLabel", lang)}</span>
              </div>
              {recentAttempts.length ? (
                <div className="mock-history-list">
                  {recentAttempts.map((attempt) => (
                    <article className="mock-history-item" key={attempt.id}>
                      <div>
                        <h3>{attempt.mockTitle}</h3>
                        <p>{t("scoreLabel", lang)}: {attempt.accuracy}% - {t("timeLabel", lang)}: {formatMockDuration(attempt.timeTakenSeconds)}</p>
                        <span>{t("weakSubjectLabel", lang)}: {attempt.weakestSubject ? translateSubjectName(attempt.weakestSubject, lang) : t("none", lang)}</span>
                      </div>
                      <div className="history-result">
                        <strong>{attempt.readinessLabel}</strong>
                        <RewardDisplay coins={attempt.coinsEarned} xp={attempt.xpEarned} />
                        <button className="btn btn-secondary" type="button" onClick={() => { playClick(); navigate("/mock-tests/result", { state: { resultId: attempt.id } }); }}>
                          {t("reviewResult", lang)}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="card-copy">{t("noMockCompleted", lang)}</p>
              )}
            </section>
          </div>

          <aside className="mock-side-column">
            <section className="dashboard-card">
              <h2 className="card-title"><FaShieldAlt /> {t("examReadinessPreview", lang)}</h2>
              <p className="insight-value">{stats.examReadiness === null ? t("takeMock", lang) : `${stats.examReadiness}%`}</p>
              <p className="card-copy">{t("recentMockReadiness", lang)}</p>
            </section>
            <section className="dashboard-card">
              <h2 className="card-title"><FaAward /> {t("badgeProgressPreview", lang)}</h2>
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
              <h2 className="card-title"><FaLock /> {t("mockTestRulesTitle", lang)}</h2>
              <ul className="mock-rules-list">
                {mockTestRules.map((rule) => <li key={rule}>{rule}</li>)}
              </ul>
            </section>
          </aside>
        </div>
      </section>
      <ConfirmModal
        isOpen={Boolean(paidConfirmMockTypeId)}
        title={t("use100CoinsQ", lang)}
        description={`${t("extraCosts100", lang)}\n${t("yourCoins", lang)}: ${userCoins}`}
        cancelLabel={t("cancel", lang)}
        confirmLabel={t("useCoinsStart", lang)}
        confirmAriaLabel={t("useCoinsStart", lang)}
        onCancel={() => setPaidConfirmMockTypeId("")}
        onConfirm={handleConfirmPaidStart}
      />
    </DashboardLayout>
  );
}

export default MockTestsPage;
