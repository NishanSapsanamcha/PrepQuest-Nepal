import { useMemo, useState } from "react";
import { FaCrown, FaFire, FaMedal, FaShieldAlt } from "react-icons/fa";
import BadgeIcon from "../components/badges/BadgeIcon";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { mockBadges } from "../data/gamificationMockData";
import "./Badges.css";

const filters = ["All", "Earned", "Locked", "Starter", "Practice", "Daily Quiz", "Streak", "Tournament", "Accuracy", "Subject Mastery", "Rare"];

function Badges() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedBadgeId, setSelectedBadgeId] = useState(mockBadges[0].id);
  const earned = mockBadges.filter((badge) => badge.status === "earned");
  const locked = mockBadges.filter((badge) => badge.status !== "earned");
  const nextBadge = mockBadges.find((badge) => badge.id === "seven_day_warrior");
  const selectedBadge = mockBadges.find((badge) => badge.id === selectedBadgeId) || mockBadges[0];

  const visibleBadges = useMemo(() => {
    return mockBadges.filter((badge) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Earned") return badge.status === "earned";
      if (activeFilter === "Locked") return badge.status !== "earned";
      if (activeFilter === "Rare") return ["Rare", "Epic", "Legendary", "Mythic"].includes(badge.rarity);
      return badge.category === activeFilter;
    });
  }, [activeFilter]);

  const progressPercent = Math.min(100, Math.round((nextBadge.progress / nextBadge.target) * 100));

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
          <article className="stat-card"><div className="stat-icon"><FaMedal /></div><div><div className="stat-value">{earned.length}</div><div className="stat-label">Earned Badges</div><div className="stat-helper">Mock badge showcase</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaShieldAlt /></div><div><div className="stat-value">{locked.length}</div><div className="stat-label">Locked Badges</div><div className="stat-helper">Visible unlock goals</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaFire /></div><div><div className="stat-value">7-Day Warrior</div><div className="stat-label">Next Badge</div><div className="stat-helper">Keep your streak alive</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaCrown /></div><div><div className="stat-value">{mockBadges.filter((badge) => ["Rare", "Epic", "Legendary", "Mythic"].includes(badge.rarity)).length}</div><div className="stat-label">Rare Badges Available</div><div className="stat-helper">Premium achievement paths</div></div></article>
        </section>

        <section className="dashboard-card next-badge-card">
          <BadgeIcon icon={nextBadge.icon} category={nextBadge.category} rarity={nextBadge.rarity} status="next" size="lg" />
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
              const cardStatus = badge.id === nextBadge.id ? "next" : badge.status;
              return (
                <button className={`dashboard-card badge-card rarity-${badge.rarity.toLowerCase()} ${badge.status}${selectedBadgeId === badge.id ? " selected" : ""}`} type="button" key={badge.id} onClick={() => setSelectedBadgeId(badge.id)}>
                  <div className="badge-card-top">
                    <BadgeIcon icon={badge.icon} category={badge.category} rarity={badge.rarity} status={cardStatus} size="sm" />
                    <span className="status-chip">{badge.status === "earned" ? "Earned" : "Locked"}</span>
                  </div>
                  <h3>{badge.name}</h3>
                  <p>{badge.description}</p>
                  <div className="badge-meta-row"><span>{badge.category}</span><strong>{badge.rarity}</strong></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
                  <div className="badge-meta-row"><span>{badge.progress}/{badge.target}</span><strong>{badge.reward}</strong></div>
                  {badge.earnedAt && <span className="earned-date">Earned {badge.earnedAt}</span>}
                </button>
              );
            })}
          </div>

          <aside className="dashboard-card badge-detail-card">
            <BadgeIcon
              icon={selectedBadge.icon}
              category={selectedBadge.category}
              rarity={selectedBadge.rarity}
              status={selectedBadge.id === nextBadge.id ? "next" : selectedBadge.status}
              size="lg"
            />
            <h2>{selectedBadge.name}</h2>
            <p>{selectedBadge.description}</p>
            <div className="detail-list">
              <div><span>Requirement</span><strong>{selectedBadge.progress} / {selectedBadge.target}</strong></div>
              <div><span>Reward</span><strong>{selectedBadge.reward}</strong></div>
              <div><span>Rarity</span><strong>{selectedBadge.rarity}</strong></div>
              <div><span>Status</span><strong>{selectedBadge.status}</strong></div>
            </div>
          </aside>
        </section>
      </section>
    </DashboardLayout>
  );
}

export default Badges;

