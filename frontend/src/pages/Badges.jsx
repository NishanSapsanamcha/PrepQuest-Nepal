import { useEffect, useMemo, useState } from "react";
import { FaCrown, FaFire, FaMedal, FaShieldAlt } from "react-icons/fa";
import BadgeIcon from "../components/badges/BadgeIcon";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useBadgeCelebration } from "../context/BadgeCelebrationContext";
import { getNextBadge, syncBadges } from "../utils/badgeUtils";
import "./Badges.css";

const filters = ["All", "Earned", "Locked", "Starter", "Practice", "Daily Quiz", "Streak", "Tournament", "Accuracy", "Subject Mastery", "Rare", "Mythic"];

const RARE_TIERS = ["Rare", "Epic", "Legendary", "Mythic"];

function Badges() {
  // Evaluate badges against real user activity (also persists newly earned).
  const badges = useMemo(() => syncBadges(), []);
  const { celebrate, previewBadge } = useBadgeCelebration();
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedBadgeId, setSelectedBadgeId] = useState(badges[0].id);

  const earned = badges.filter((badge) => badge.status === "earned");
  const locked = badges.filter((badge) => badge.status !== "earned");
  const nextBadge = getNextBadge(badges) || badges[0];
  const selectedBadge = badges.find((badge) => badge.id === selectedBadgeId) || badges[0];

  // Celebrate any badges earned since the last visit (rarest first).
  useEffect(() => {
    celebrate();
  }, [celebrate]);

  const visibleBadges = useMemo(() => {
    return badges.filter((badge) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Earned") return badge.status === "earned";
      if (activeFilter === "Locked") return badge.status !== "earned";
      if (activeFilter === "Rare") return RARE_TIERS.includes(badge.rarity);
      if (activeFilter === "Mythic") return badge.rarity === "Mythic";
      return badge.category === activeFilter;
    });
  }, [activeFilter, badges]);

  // Hidden achievements stay masked in the UI until they are earned.
  const masked = (badge) => badge.isSecret && badge.status !== "earned";
  const displayName = (badge) => (masked(badge) ? "???" : badge.name);
  const displayDesc = (badge) => (masked(badge) ? "Keep playing to discover this badge." : badge.description);

  const selectedMasked = masked(selectedBadge);

  return (
    <DashboardLayout activeKey="badges">
      <section className="dashboard-content badges-page">
        <header className="dashboard-header badges-header">
          <div className="header-left">
            <p className="eyebrow">Achievement System</p>
            <h1>Badges</h1>
            <p>Unlock achievements through quizzes, practice, mock tests, streaks, tournaments, and accuracy.</p>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card"><div className="stat-icon"><FaMedal /></div><div><div className="stat-value">{earned.length}</div><div className="stat-label">Earned Badges</div><div className="stat-helper">Your achievement showcase</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaShieldAlt /></div><div><div className="stat-value">{locked.length}</div><div className="stat-label">Locked Badges</div><div className="stat-helper">Visible unlock goals</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaFire /></div><div><div className="stat-value">{masked(nextBadge) ? "???" : nextBadge.name}</div><div className="stat-label">Next Badge</div><div className="stat-helper">Closest to unlocking</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaCrown /></div><div><div className="stat-value">{badges.filter((badge) => RARE_TIERS.includes(badge.rarity)).length}</div><div className="stat-label">Rare Badges Available</div><div className="stat-helper">Premium achievement paths</div></div></article>
        </section>

        <section className="dashboard-card next-badge-card">
          <BadgeIcon shape={nextBadge.shape} iconKind={nextBadge.iconKind} rarity={nextBadge.rarity} size="lg" isSecret={nextBadge.isSecret} locked={masked(nextBadge)} />
          <div>
            <p className="eyebrow">Next Badge Progress</p>
            <h2>{displayName(nextBadge)}</h2>
            <p>{masked(nextBadge) ? "A hidden achievement is within reach." : nextBadge.description}</p>
            <div className="badge-progress-row"><span>{masked(nextBadge) ? "??? / ???" : `${nextBadge.progress} / ${nextBadge.target}`}</span><strong>{masked(nextBadge) ? "???" : nextBadge.reward}</strong></div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${nextBadge.percent}%` }} /></div>
          </div>
        </section>

        <section className="dashboard-card badge-filter-card">
          <div className="tab-row">
            {filters.map((filter) => (
              <button className={`tab-pill${activeFilter === filter ? " active" : ""}`} type="button" key={filter} onClick={() => setActiveFilter(filter)}>
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section className="badges-layout">
          {visibleBadges.length === 0 ? (
            <div className="dashboard-card badge-empty">
              <p>No badges match this filter yet.</p>
              <span>Keep practicing to unlock more achievements.</span>
            </div>
          ) : (
          <div className="badge-grid">
            {visibleBadges.map((badge) => {
              const isEarned = badge.status === "earned";
              const isMasked = masked(badge);
              return (
                <button className={`dashboard-card badge-card rarity-${badge.rarity.toLowerCase()} ${badge.status}${selectedBadgeId === badge.id ? " selected" : ""}`} type="button" key={badge.id} onClick={() => setSelectedBadgeId(badge.id)}>
                  <div className="badge-card-top">
                    <span className={`status-chip ${isEarned ? "is-earned" : "is-locked"}`}>{isEarned ? "✓ Earned" : "Locked"}</span>
                  </div>
                  <div className={`badge-emblem rarity-${badge.rarity.toLowerCase()} ${isEarned ? "is-earned" : "is-locked"}`}>
                    <BadgeIcon
                      shape={badge.shape}
                      iconKind={badge.iconKind}
                      rarity={badge.rarity}
                      size={138}
                      locked={!isEarned}
                      earned={isEarned}
                      isSecret={badge.isSecret}
                    />
                  </div>
                  <h3 className="badge-name">{displayName(badge)}</h3>
                  <p className="badge-desc">{displayDesc(badge)}</p>
                  <div className="badge-chips">
                    <span className="cat-chip">{isMasked ? "Hidden" : badge.category}</span>
                    <span className={`rarity-pill rarity-${badge.rarity.toLowerCase()}`}>{badge.rarity}</span>
                  </div>
                  <div className="badge-card-bottom">
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${isMasked ? 0 : badge.percent}%` }} /></div>
                    <div className="badge-meta-row">
                      <span>{isMasked ? "??? / ???" : `${badge.progress}/${badge.target}`}</span>
                      <strong className="reward-tag">{isMasked ? "???" : badge.reward}</strong>
                    </div>
                    {isEarned && badge.earnedAt && <span className="earned-date">Earned {badge.earnedAt}</span>}
                  </div>
                </button>
              );
            })}
          </div>
          )}

          <aside className="dashboard-card badge-detail-card">
            <div className={`badge-detail-emblem rarity-${selectedBadge.rarity.toLowerCase()} ${selectedBadge.status === "earned" ? "is-earned" : "is-locked"}`}>
              <BadgeIcon
                shape={selectedBadge.shape}
                iconKind={selectedBadge.iconKind}
                rarity={selectedBadge.rarity}
                size={184}
                locked={selectedBadge.status !== "earned"}
                earned={selectedBadge.status === "earned"}
                isSecret={selectedBadge.isSecret}
              />
            </div>
            <span className={`status-chip ${selectedBadge.status === "earned" ? "is-earned" : "is-locked"}`}>{selectedBadge.status === "earned" ? "✓ Earned" : "Locked"}</span>
            <h2>{displayName(selectedBadge)}</h2>
            <p>{displayDesc(selectedBadge)}</p>
            <div className="detail-list">
              <div><span>Requirement</span><strong>{selectedMasked ? "???" : `${selectedBadge.progress} / ${selectedBadge.target}`}</strong></div>
              <div><span>Reward</span><strong>{selectedMasked ? "???" : selectedBadge.reward}</strong></div>
              <div><span>Rarity</span><strong className={`rarity-pill rarity-${selectedBadge.rarity.toLowerCase()}`}>{selectedBadge.rarity}</strong></div>
              <div><span>Status</span><strong>{selectedBadge.status === "earned" ? `Earned ${selectedBadge.earnedAt || ""}`.trim() : "Locked"}</strong></div>
            </div>
            <button className="action-btn compact preview-unlock-btn" type="button" onClick={() => previewBadge(selectedBadge)}>
              Preview unlock animation
            </button>
          </aside>
        </section>
      </section>
    </DashboardLayout>
  );
}

export default Badges;
