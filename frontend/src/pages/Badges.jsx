import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	ArrowRight,
	Award,
	BadgeCheck,
	Bell,
	BookOpenCheck,
	BookOpenText,
	CheckCircle2,
	Coins,
	Flame,
	Gift,
	Lightbulb,
	Lock,
	Medal,
	Sparkles as SparklesIcon,
	ShieldCheck,
	Sparkles,
	Star,
	Target,
	Trophy,
	Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Badges.css";

const badgeTabs = ["All", "Earned", "In Progress", "Locked", "Rare", "Legendary"];

const badgeCategories = [
	"Starter",
	"Practice",
	"Subject Mastery",
	"Accuracy",
	"Streak",
	"Mock Test",
	"Tournament",
	"Leaderboard",
	"Comeback",
	"Legendary"
];

const badgeCatalog = [
	{
		id: "daily-rookie",
		title: "Welcome Learner",
		category: "Starter",
		rarity: "Common",
		description: "A first-step welcome badge for completing onboarding and starting the journey.",
		condition: "Finish setup and complete your first practice session.",
		reward: { xp: 20, coins: 10 },
		progress: 100,
		status: "earned",
		icon: Flame,
		accent: "sunset",
		unlockedOn: "12 Jun 2026",
		nextAction: "Use this early momentum to aim for a practice badge next."
	},
	{
		id: "mock-master",
		title: "Constitution Starter",
		category: "Subject Mastery",
		rarity: "Common",
		description: "For building early confidence with Loksewa constitutional basics.",
		condition: "Answer 7/10 questions correctly in Constitution practice.",
		reward: { xp: 30, coins: 15 },
		progress: 70,
		status: "in-progress",
		icon: BookOpenCheck,
		accent: "ocean",
		nextAction: "Answer 3 more questions correctly to unlock this subject starter."
	},
	{
		id: "accuracy-ace",
		title: "Accuracy Ace",
		category: "Accuracy",
		rarity: "Rare",
		description: "A precision badge for learners who keep improving correctness over speed.",
		condition: "Reach 85% accuracy across 100 answered questions.",
		reward: { xp: 120, coins: 45 },
		progress: 67,
		status: "in-progress",
		icon: Target,
		accent: "leaf",
		nextAction: "Refine weak topics and raise your overall accuracy."
	},
	{
		id: "friday-fighter",
		title: "7-Day Warrior",
		category: "Streak",
		rarity: "Rare",
		description: "Celebrate consistency when your study habit stays alive all week.",
		condition: "Maintain a 7-day streak.",
		reward: { xp: 0, coins: 150 },
		progress: 57,
		progressLabel: "4/7 days",
		status: "in-progress",
		icon: Trophy,
		accent: "ember",
		nextAction: "Complete 3 more days to unlock the 7-day streak badge."
	},
	{
		id: "streak-guardian",
		title: "Mock Test Guardian",
		category: "Mock Test",
		rarity: "Rare",
		description: "A badge for repeatedly showing up to full-length assessments.",
		condition: "Complete 5 mock tests.",
		reward: { xp: 100, coins: 40 },
		progress: 100,
		status: "earned",
		icon: ShieldCheck,
		accent: "mint",
		unlockedOn: "08 Jun 2026",
		nextAction: "Try the next mock milestone badge to deepen the streak."
	},
	{
		id: "loksewa-legend",
		title: "30-Day Legend",
		category: "Legendary",
		rarity: "Legendary",
		description: "The peak badge for long-term commitment and platform mastery.",
		condition: "Maintain a 30-day streak and unlock 10 other badges.",
		reward: { xp: 500, coins: 200 },
		progress: 30,
		status: "locked",
		icon: Star,
		accent: "violet",
		nextAction: "Collect more badge categories before aiming for this legendary title."
	},
	{
		id: "tournament-bronze",
		title: "Friday Fighter",
		category: "Tournament",
		rarity: "Rare",
		description: "A competitive badge for joining weekly Friday battles.",
		condition: "Join 4 Friday tournaments.",
		reward: { xp: 150, coins: 60 },
		progress: 25,
		status: "locked",
		icon: Trophy,
		accent: "ember",
		nextAction: "Play this Friday battle to move closer to the tournament badge."
	},
	{
		id: "comeback-kid",
		title: "Comeback Kid",
		category: "Comeback",
		rarity: "Seasonal",
		description: "Reward for returning after a missed streak and getting back on track.",
		condition: "Return after 3 inactive days and finish one session.",
		reward: { xp: 60, coins: 30 },
		progress: 40,
		status: "in-progress",
		icon: Bell,
		accent: "mint",
		nextAction: "Finish one strong session after a break to strengthen your comeback."
	}
];

const statusMeta = {
	earned: {
		label: "Earned",
		Icon: CheckCircle2
	},
	close: {
		label: "Close",
		Icon: Zap
	},
	locked: {
		label: "Locked",
		Icon: Lock
	},
	"in-progress": {
		label: "In Progress",
		Icon: BookOpenText
	}
};

const accentLabels = {
	sunset: "Sunset",
	ocean: "Ocean",
	leaf: "Leaf",
	ember: "Ember",
	mint: "Mint",
	violet: "Violet"
};

function formatReward(reward) {
	return `+${reward.xp} XP and +${reward.coins} coins`;
}

function Badges() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState("All");

	const userName = user?.fullName || user?.name || localStorage.getItem("userName") || "Aspirant";
	const selectedExamKey = localStorage.getItem("selectedExam") || "nayab-subba";
	const selectedExamLabel = selectedExamKey === "sakha-adhikrit" ? "Sakha Adhikrit" : "Nayab Subba";

	const summary = useMemo(() => {
		const earned = badgeCatalog.filter((badge) => badge.status === "earned");
		const progress = badgeCatalog.filter((badge) => badge.status === "in-progress");
		const locked = badgeCatalog.filter((badge) => badge.status === "locked");
		const rare = badgeCatalog.filter((badge) => badge.rarity === "Rare");
		const rewardsEarned = earned.reduce(
			(totals, badge) => ({
				xp: totals.xp + badge.reward.xp,
				coins: totals.coins + badge.reward.coins
			}),
			{ xp: 0, coins: 0 }
		);
		const nextBadge = badgeCatalog.find((badge) => badge.title === "7-Day Warrior") || [...badgeCatalog]
			.filter((badge) => badge.status !== "earned")
			.sort((left, right) => right.progress - left.progress)[0];

		return {
			earnedCount: earned.length,
			progressCount: progress.length,
			lockedCount: locked.length,
			rareCount: rare.length,
			rewardsEarned,
			nextBadge
		};
	}, []);

	const filteredBadges = useMemo(() => {
		return badgeCatalog.filter((badge) => {
			if (activeTab === "All") {
				return true;
			}
			if (activeTab === "Earned") {
				return badge.status === "earned";
			}
			if (activeTab === "In Progress") {
				return badge.status === "in-progress";
			}
			if (activeTab === "Locked") {
				return badge.status === "locked";
			}
			if (activeTab === "Rare") {
				return badge.rarity === "Rare";
			}
			if (activeTab === "Legendary") {
				return badge.rarity === "Legendary";
			}
			return true;
		});
	}, [activeTab]);

	const groupedBadges = useMemo(() => {
		return badgeCategories
			.map((category) => ({
				category,
				items: filteredBadges.filter((badge) => badge.category === category)
			}))
			.filter((group) => group.items.length > 0);
	}, [filteredBadges]);

	const handleBack = () => {
		navigate("/dashboard");
	};

	return (
		<main className="badges-page">
			<div className="badges-backdrop" aria-hidden="true" />

			<div className="badges-shell">
				<header className="badges-hero">
					<button className="back-link" type="button" onClick={handleBack}>
						<ArrowLeft /> Back to Dashboard
					</button>

					<div className="hero-copy">
						<div className="hero-kicker">
							<Medal /> Achievement system
						</div>
						<h1>Badges &amp; Achievements</h1>
						<p>
							Track your learning achievements, unlock badges, and stay motivated in your Loksewa preparation.
						</p>
					</div>

					<div className="hero-meta">
						<div className="hero-chip">
							<ShieldCheck /> {userName}
						</div>
						<div className="hero-chip ghost">
							<Award /> {selectedExamLabel}
						</div>
						<div className="hero-chip ghost">
							<Sparkles /> Rewards update as you study
						</div>
					</div>
				</header>

				<section className="summary-grid" aria-label="Badge summary">
					<article className="summary-card highlight">
						<div className="summary-icon">
							<Medal />
						</div>
						<div>
							<span className="summary-label">Badges earned</span>
							<strong>{summary.earnedCount}</strong>
							<p>Unlocked from consistency, mastery, and momentum.</p>
						</div>
					</article>

					<article className="summary-card">
						<div className="summary-icon warm">
							<Lightbulb />
						</div>
						<div>
							<span className="summary-label">In progress</span>
							<strong>{summary.progressCount}</strong>
							<p>These badges are close enough to keep the goal visible.</p>
						</div>
					</article>

					<article className="summary-card">
						<div className="summary-icon cool">
							<Coins />
						</div>
						<div>
							<span className="summary-label">Rare badges</span>
							<strong>{summary.rareCount}</strong>
							<p>Special achievements with stronger visual weight.</p>
						</div>
					</article>

					<article className="summary-card">
						<div className="summary-icon dark">
							<Gift />
						</div>
						<div>
							<span className="summary-label">Next badge reward</span>
							<strong>{summary.rewardsEarned.xp} XP</strong>
							<p>{summary.rewardsEarned.coins} coins already secured from achievements.</p>
						</div>
					</article>
				</section>

				<section className="content-grid">
					<article className="panel next-target-panel">
						<div className="panel-header">
							<div>
								<span className="panel-kicker">Next target</span>
								<h2>{summary.nextBadge.title}</h2>
								<p className="hero-progress-copy">{summary.nextBadge.progressLabel || `${summary.nextBadge.progress}% complete`}</p>
							</div>
							<span className={`status-pill ${summary.nextBadge.status}`}>
								{(() => {
									const StatusIcon = statusMeta[summary.nextBadge.status].Icon;
									return <StatusIcon />;
								})()}
								{statusMeta[summary.nextBadge.status].label}
							</span>
						</div>

						<p className="panel-copy">{summary.nextBadge.description}</p>

						<div className="progress-block">
							<div className="progress-row">
								<span>Unlock progress</span>
								<strong>{summary.nextBadge.progress}%</strong>
							</div>
							<div className="progress-track" aria-hidden="true">
								<span style={{ width: `${summary.nextBadge.progress}%` }} />
							</div>
						</div>

						<div className="target-details">
							<div>
								<span>Condition</span>
								<strong>{summary.nextBadge.condition}</strong>
							</div>
							<div>
								<span>Reward</span>
								<strong>{formatReward(summary.nextBadge.reward)}</strong>
							</div>
							<div>
								<span>Next step</span>
								<strong>{summary.nextBadge.nextAction}</strong>
							</div>
							<button className="cta-button" type="button">Continue toward this badge</button>
						</div>
					</article>

					<aside className="panel rules-panel">
						<div className="panel-header compact">
							<div>
								<span className="panel-kicker">How badges work</span>
								<h2>Clear condition, clear reward</h2>
							</div>
							<Gift />
						</div>

						<ul className="rules-list">
							<li>
								<CheckCircle2 /> Earned badges are permanent once their condition is completed.
							</li>
							<li>
								<Target /> Close badges highlight the shortest path to your next unlock.
							</li>
							<li>
								<Trophy /> Locked badges tell you exactly what to do and what you gain.
							</li>
							<li>
								<Sparkles /> Rewards always include XP or coins, never just decoration.
							</li>
						</ul>
					</aside>
				</section>

				<section className="catalog-section" aria-labelledby="badge-catalog-title">
					<div className="section-heading">
						<div>
							<span className="panel-kicker">Badge catalog</span>
							<h2 id="badge-catalog-title">Every achievement has a purpose</h2>
						</div>
						<p>The catalog mixes earned, in-progress, and locked achievements so you can see progress at a glance.</p>
					</div>

					<div className="tab-row" role="tablist" aria-label="Badge filters">
						{badgeTabs.map((tab) => (
							<button
								key={tab}
								type="button"
								role="tab"
								aria-selected={activeTab === tab}
								className={`tab-pill${activeTab === tab ? " active" : ""}`}
								onClick={() => setActiveTab(tab)}
							>
								{tab}
							</button>
						))}
					</div>

					<div className="category-groups">
						{groupedBadges.map((group) => (
							<section key={group.category} className="badge-group">
								<div className="group-header">
									<h3>{group.category}</h3>
									<span>{group.items.length} badge{group.items.length === 1 ? "" : "s"}</span>
								</div>
								<div className="badge-grid">
									{group.items.map((badge) => {
							const Icon = badge.icon;
							const meta = statusMeta[badge.status];
							const StatusIcon = meta.Icon;

										return (
											<article key={badge.id} className={`badge-card ${badge.status}`}>
												<div className={`badge-top accent-${badge.accent}`}>
													<div className="badge-icon-wrap">
														<Icon />
													</div>
													<span className={`status-pill ${badge.status}`}>
														<StatusIcon />
														{meta.label}
													</span>
												</div>

												<div className="badge-body">
													<div className="badge-copy">
														<span className="badge-category">{badge.rarity}</span>
														<h3>{badge.title}</h3>
														<p>{badge.description}</p>
													</div>

													<div className="badge-meta">
														<div>
															<span>Condition</span>
															<strong>{badge.condition}</strong>
														</div>
														<div>
															<span>Reward</span>
															<strong>{formatReward(badge.reward)}</strong>
														</div>
													</div>

													<div className="badge-progress">
														<div className="progress-row">
															<span>Progress</span>
															<strong>{badge.progress}%</strong>
														</div>
														<div className="progress-track small" aria-hidden="true">
															<span style={{ width: `${badge.progress}%` }} />
														</div>
													</div>

													<p className="badge-next-action">{badge.nextAction}</p>

													<div className="badge-footer">
														{badge.unlockedOn ? (
															<span className="unlock-note">Unlocked on {badge.unlockedOn}</span>
														) : (
															<span className="unlock-note muted">{accentLabels[badge.accent]} path</span>
														)}
														<span className="reward-note">
															<ArrowRight /> Focus next
														</span>
													</div>
												</div>
											</article>
										);
									})}
								</div>
							</section>
						))}
					</div>
				</section>

				<div className="popup-mockup" role="status" aria-label="Badge unlocked mockup">
					<div className="popup-badge"><SparklesIcon /></div>
					<div>
						<strong>Badge Unlocked!</strong>
						<p>You earned Welcome Learner and +10 coins.</p>
					</div>
				</div>

				<footer className="badges-footer">
					<Gift />
					<p>
						How Badges Work: badges reward real progress, never coin loss or betting. Keep learning to unlock the next milestone.
					</p>
				</footer>
			</div>
		</main>
	);
}

export default Badges;
