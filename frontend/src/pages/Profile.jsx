import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Award,
	BadgeCheck,
	BookOpen,
	CalendarDays,
	Coins,
	Flame,
	Globe,
	Languages,
	Crown,
	Medal,
	ShieldCheck,
	Sparkles,
	Star,
	Target,
	Trophy,
	UserRound,
	Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const statCards = [
	{ label: "Badges earned", value: 6, Icon: Medal },
	{ label: "Best subject", value: "Constitution", Icon: BookOpen },
	{ label: "Avg accuracy", value: "84%", Icon: Target },
	{ label: "Tournament history", value: "4 battles", Icon: Trophy }
];

const favoriteBadges = [
	{ name: "Welcome Learner", detail: "Starter", Icon: Sparkles },
	{ name: "Constitution Starter", detail: "Subject Mastery", Icon: BookOpen },
	{ name: "7-Day Warrior", detail: "Streak", Icon: Flame },
	{ name: "Accuracy Ace", detail: "Rare", Icon: Target },
	{ name: "Mock Test Guardian", detail: "Mock Test", Icon: ShieldCheck }
];

const recentActivity = [
	{ label: "Daily quiz completed", detail: "30 questions answered", time: "Today" },
	{ label: "Friday tournament practice", detail: "Timed round finished", time: "Yesterday" },
	{ label: "Mock test review", detail: "Accuracy improved to 84%", time: "2 days ago" },
	{ label: "Badge earned", detail: "Welcome Learner unlocked", time: "3 days ago" }
];

function Profile() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const userName = user?.fullName || user?.name || localStorage.getItem("userName") || "Aspirant";
	const selectedExamKey = localStorage.getItem("selectedExam") || "nayab-subba";
	const preferredLanguage = localStorage.getItem("preferredLanguage") || "english";
	const examLabel = selectedExamKey === "sakha-adhikrit" ? "Sakha Adhikrit" : "Nayab Subba";
	const languageLabel = preferredLanguage === "both" ? "Both" : preferredLanguage === "nepali" ? "Nepali" : "English";

	return (
		<main className="profile-page">
			<div className="profile-backdrop" aria-hidden="true" />

			<div className="profile-shell">
				<header className="profile-hero">
					<button className="back-link" type="button" onClick={() => navigate("/dashboard")}>
						<ArrowLeft /> Back to Dashboard
					</button>

					<div className="hero-copy">
						<div className="hero-kicker">
							<UserRound /> User profile
						</div>
						<h1>Profile Summary</h1>
						<p>Your identity, progress, and favorite achievements in one motivating dashboard.</p>
					</div>

					<div className="hero-meta">
						<span className="hero-chip"><ShieldCheck /> {userName}</span>
						<span className="hero-chip ghost"><BookOpen /> {examLabel}</span>
						<span className="hero-chip ghost"><Languages /> {languageLabel}</span>
					</div>
				</header>

				<section className="profile-layout">
					<article className="panel identity-card">
						<div className="avatar-badge">
							<UserRound />
						</div>
						<div className="identity-copy">
							<span className="panel-kicker">User identity</span>
							<h2>{userName}</h2>
							<p>Level 5 • Focused Learner • Total XP 1250 • Coins 340 • Active streak 4 days.</p>
						</div>

						<div className="identity-meta">
							<div><strong>Level 5</strong><span>Current level</span></div>
							<div><strong>Focused Learner</strong><span>Rank title</span></div>
							<div><strong>1,250 XP</strong><span>Total XP</span></div>
							<div><strong>340 coins</strong><span>Coin balance</span></div>
							<div><strong>4 days</strong><span>Active streak</span></div>
						</div>
					</article>

					<article className="panel stats-card">
						<div className="section-heading">
							<div>
								<span className="panel-kicker">Stats dashboard</span>
								<h2>Performance snapshot</h2>
							</div>
							<Zap />
						</div>

						<div className="stats-grid">
							{statCards.map(({ label, value, Icon }) => (
								<div key={label} className="stats-tile">
									<Icon />
									<span>{label}</span>
									<strong>{value}</strong>
								</div>
							))}
						</div>

						<div className="profile-progress">
							<div className="progress-row">
								<span>Level progress</span>
								<strong>62%</strong>
							</div>
							<div className="progress-track"><span style={{ width: "62%" }} /></div>
						</div>
					</article>
				</section>

				<section className="profile-layout lower">
					<article className="panel badge-showcase-card">
						<div className="section-heading">
							<div>
								<span className="panel-kicker">Components showcase</span>
								<h2>Favorite earned badges</h2>
							</div>
							<BadgeCheck />
						</div>

						<div className="badge-mini-grid">
							{favoriteBadges.map((badge) => (
								<div key={badge.name} className="badge-mini-card">
									<badge.Icon />
									<div>
										<strong>{badge.name}</strong>
										<span>{badge.detail}</span>
									</div>
								</div>
							))}
						</div>
					</article>

					<article className="panel activity-card-panel">
						<div className="section-heading">
							<div>
								<span className="panel-kicker">Recent activity</span>
								<h2>Learning timeline</h2>
							</div>
							<CalendarDays />
						</div>

						<div className="timeline-list">
							{recentActivity.map((item) => (
								<div key={item.label} className="timeline-item">
									<div className="timeline-dot" />
									<div>
										<strong>{item.label}</strong>
										<p>{item.detail}</p>
									</div>
									<span>{item.time}</span>
								</div>
							))}
						</div>

						<div className="profile-callout">
							<Crown />
							<p>Friday tournaments and badge progress should continue feeding this profile dashboard in future iterations.</p>
						</div>
					</article>
				</section>

				<footer className="profile-footer">
					<Globe />
					<p>Your preferences stay consistent across the app and help personalize the experience.</p>
				</footer>
			</div>
		</main>
	);
}

export default Profile;