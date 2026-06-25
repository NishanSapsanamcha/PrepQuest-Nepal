import { useMemo, useState } from "react";
import { FaCrown, FaFire, FaMedal, FaShieldAlt } from "react-icons/fa";
import BadgeIcon from "../components/badges/BadgeIcon";
import BadgeUnlockToast from "../components/badges/BadgeUnlockToast";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { mockBadges } from "../data/gamificationMockData";
import "./Badges.css";

const filters = ["All", "Earned", "Locked", "Starter", "Practice", "Daily Quiz", "Streak", "Tournament", "Accuracy", "Subject Mastery", "Rare", "Mythic"];

const RARE_TIERS = ["Rare", "Epic", "Legendary", "Mythic"];

function Badges() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedBadgeId, setSelectedBadgeId] = useState(mockBadges[0].id);
  const [unlockBadge, setUnlockBadge] = useState(null);
  const earned = mockBadges.filter((badge) => badge.status === "earned");
  const locked = mockBadges.filter((badge) => badge.status !== "earned");
  const nextBadge = mockBadges.find((badge) => badge.id === "seven_day_warrior");
  const selectedBadge = mockBadges.find((badge) => badge.id === selectedBadgeId) || mockBadges[0];

  const visibleBadges = useMemo(() => {
    return mockBadges.filter((badge) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Earned") return badge.status === "earned";
      if (activeFilter === "Locked") return badge.status !== "earned";
      if (activeFilter === "Rare") return RARE_TIERS.includes(badge.rarity);
      if (activeFilter === "Mythic") return badge.rarity === "Mythic";
      return badge.category === activeFilter;
    });
  }, [activeFilter]);

  const progressPercent = Math.min(100, Math.round((nextBadge.progress / nextBadge.target) * 100));

  // Hidden achievements stay masked in the UI until they are earned.
  const masked = (badge) => badge.isSecret && badge.status !== "earned";
  const displayName = (badge) => (masked(badge) ? "???" : badge.name);
  const displayDesc = (badge) => (masked(badge) ? "Keep playing to discover this badge." : badge.description);

  // The real unlock flow (when wired to the API) should call this with the
  // earned badge; here it previews the celebratory toast from the detail panel.
  const previewUnlock = (badge) => {
    setUnlockBadge(null);
    requestAnimationFrame(() => setUnlockBadge(badge));
  };

  const selectedMasked = masked(selectedBadge);
  const selectedIsNext = selectedBadge.id === nextBadge.id;

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
          <article className="stat-card"><div className="stat-icon"><FaFire /></div><div><div className="stat-value">7-Day Warrior</div><div className="stat-label">Next Badge</div><div className="stat-helper">Keep your streak alive</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaCrown /></div><div><div className="stat-value">{mockBadges.filter((badge) => RARE_TIERS.includes(badge.rarity)).length}</div><div className="stat-label">Rare Badges Available</div><div className="stat-helper">Premium achievement paths</div></div></article>
        </section>

        <section className="dashboard-card next-badge-card">
          <BadgeIcon shape={nextBadge.shape} iconKind={nextBadge.iconKind} rarity={nextBadge.rarity} size="lg" />
          <div>
            <p className="eyebrow">Next Badge Progress</p>
            <h2>{nextBadge.name}</h2>
            <p>Keep your streak for 3 more days to unlock this badge.</p>
            <div className="badge-progress-row"><span>{nextBadge.progress} / {nextBadge.target} days</span><strong>{nextBadge.reward}</strong></div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressPercent}%` }} /></div>
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
          <div className="badge-grid">
            {visibleBadges.map((badge) => {
              const percent = Math.min(100, Math.round((badge.progress / badge.target) * 100));
              const isEarned = badge.status === "earned";
              const isNext = badge.id === nextBadge.id;
              const isMasked = masked(badge);
              return (
                <button className={`dashboard-card badge-card rarity-${badge.rarity.toLowerCase()} ${badge.status}${selectedBadgeId === badge.id ? " selected" : ""}`} type="button" key={badge.id} onClick={() => setSelectedBadgeId(badge.id)}>
                  <div className="badge-card-top">
                    <BadgeIcon
                      shape={badge.shape}
                      iconKind={badge.iconKind}
                      rarity={badge.rarity}
                      size="sm"
                      locked={!isEarned && !isNext}
                      earned={isEarned}
                      isSecret={badge.isSecret}
                    />
                    <span className="status-chip">{isEarned ? "Earned" : "Locked"}</span>
                  </div>
                  <h3>{displayName(badge)}</h3>
                  <p>{displayDesc(badge)}</p>
                  <div className="badge-meta-row"><span>{isMasked ? "Hidden" : badge.category}</span><span className={`rarity-pill rarity-${badge.rarity.toLowerCase()}`}>{badge.rarity}</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${isMasked ? 0 : percent}%` }} /></div>
                  <div className="badge-meta-row"><span>{isMasked ? "??? / ???" : `${badge.progress}/${badge.target}`}</span><strong>{isMasked ? "???" : badge.reward}</strong></div>
                  {badge.earnedAt && <span className="earned-date">Earned {badge.earnedAt}</span>}
                </button>
              );
            })}
          </div>

          <aside className="dashboard-card badge-detail-card">
            <BadgeIcon
              shape={selectedBadge.shape}
              iconKind={selectedBadge.iconKind}
              rarity={selectedBadge.rarity}
              size="lg"
              locked={selectedBadge.status !== "earned" && !selectedIsNext}
              earned={selectedBadge.status === "earned"}
              isSecret={selectedBadge.isSecret}
            />
            <h2>{displayName(selectedBadge)}</h2>
            <p>{displayDesc(selectedBadge)}</p>
            <div className="detail-list">
              <div><span>Requirement</span><strong>{selectedMasked ? "???" : `${selectedBadge.progress} / ${selectedBadge.target}`}</strong></div>
              <div><span>Reward</span><strong>{selectedMasked ? "???" : selectedBadge.reward}</strong></div>
              <div><span>Rarity</span><strong className={`rarity-pill rarity-${selectedBadge.rarity.toLowerCase()}`}>{selectedBadge.rarity}</strong></div>
              <div><span>Status</span><strong>{selectedBadge.status}</strong></div>
            </div>
            <button className="action-btn compact preview-unlock-btn" type="button" onClick={() => previewUnlock(selectedBadge)}>
              Preview unlock animation
            </button>
          </aside>
        </section>
      </section>

      <BadgeUnlockToast badge={unlockBadge} onClose={() => setUnlockBadge(null)} />
    </DashboardLayout>
  );
}

export default Badges;
