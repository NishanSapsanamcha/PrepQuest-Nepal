import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	CalendarDays,
	CheckCircle2,
	Clock3,
	Coins,
	Crown,
	Medal,
	ShieldCheck,
	Sparkles,
	Target,
	Trophy,
	Users,
	Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import "./Tournament.css";

const scoringRules = [
	{ label: "Correct answer", value: "+100 points" },
	{ label: "Speed bonus", value: "Up to +50 points" },
	{ label: "Streak bonus", value: "+100 points" },
	{ label: "Wrong answer", value: "0 points" }
];

const rewardMatrix = [
	{ place: "1st", reward: "500 coins + Friday Battle Badge" },
	{ place: "2nd", reward: "300 coins + XP boost" },
	{ place: "3rd", reward: "150 coins + XP boost" },
	{ place: "4th-10th", reward: "70 coins + participation badge progress" },
	{ place: "All participants", reward: "25 coins + streak credit" }
];

const liveRanks = [
	{ rank: 1, name: "Aayush", track: "Nayab Subba", points: 820, streak: 18 },
	{ rank: 2, name: "Suman", track: "Sakha Adhikrit", points: 774, streak: 15 },
	{ rank: 3, name: "Ramesh", track: "Nayab Subba", points: 731, streak: 13 },
	{ rank: 4, name: "Bikash", track: "Sakha Adhikrit", points: 700, streak: 11 }
];

const history = [
	{ winner: "Aayush Shrestha", track: "Nayab Subba", points: 1180, prize: "500 coins + Badge" },
	{ winner: "Suman Thapa", track: "Sakha Adhikrit", points: 1125, prize: "300 coins + Badge" },
	{ winner: "Ramesh Karki", track: "Nayab Subba", points: 1090, prize: "150 coins + Badge" }
];

function Tournament() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const userName = user?.fullName || user?.name || localStorage.getItem("userName") || "Aspirant";

	return (
		<DashboardLayout activeKey="tournament">
		<div className="tournament-page">
			<div className="tournament-backdrop" aria-hidden="true" />

			<div className="tournament-shell">
				<header className="tournament-hero">
					<button className="back-link" type="button" onClick={() => navigate("/dashboard")}>
						<ArrowLeft /> Back to Dashboard
					</button>

					<div className="hero-copy">
						<div className="hero-kicker">
							<Trophy /> Friday Loksewa Battle
						</div>
						<h1>Friday Tournament</h1>
						<p>Next Battle starts in: 3 days 04 hours.</p>
						<p className="hero-subcopy">Join the weekly battle, earn rewards, and keep the leaderboard pressure healthy and fair.</p>
					</div>

					<div className="hero-meta">
						<span className="hero-chip"><ShieldCheck /> {userName}</span>
						<span className="hero-chip ghost"><CalendarDays /> Every Friday</span>
						<span className="hero-chip ghost"><Sparkles /> No betting. No coin loss.</span>
					</div>

					<button className="join-button" type="button">Join Friday Battle</button>
				</header>

				<section className="tournament-layout">
					<article className="panel rules-panel">
						<div className="section-heading">
							<div>
								<span className="panel-kicker">Scoring & rules</span>
								<h2>How the battle scores</h2>
							</div>
							<p>Simple scoring keeps the competition ethical, transparent, and motivating.</p>
						</div>

						<div className="scoring-grid">
							{scoringRules.map((rule) => (
								<div key={rule.label} className="score-row">
									<strong>{rule.label}</strong>
									<span>{rule.value}</span>
								</div>
							))}
						</div>

						<ul className="rules-list">
							<li><CheckCircle2 /> Registration is static in this build and serves as a visual mockup only.</li>
							<li><Target /> Questions are timed to reward accuracy and calm decision making.</li>
							<li><Coins /> Everyone earns rewards. No participant loses coins for joining.</li>
							<li><Zap /> Streak bonuses amplify consistency without punishing a bad round.</li>
						</ul>
					</article>

					<aside className="panel event-panel">
						<div className="section-heading compact">
							<div>
								<span className="panel-kicker">Live event</span>
								<h2>Registration open</h2>
							</div>
							<Clock3 />
						</div>

						<div className="event-countdown">
							<div>
								<span>Starts in</span>
								<strong>3 days</strong>
							</div>
							<div>
								<span>Hours</span>
								<strong>04</strong>
							</div>
							<div>
								<span>Status</span>
								<strong>Live preview</strong>
							</div>
						</div>

						<div className="event-preview">
							<div className="preview-header">
								<Users />
								<span>Ongoing / mock matches</span>
							</div>
							{liveRanks.map((row) => (
								<div key={row.rank} className="live-row">
									<span className={`live-rank rank-${row.rank}`}>#{row.rank}</span>
									<div className="live-name">
										<strong>{row.name}</strong>
										<span>{row.track}</span>
									</div>
									<strong>{row.points}</strong>
								</div>
							))}
						</div>
					</aside>
				</section>

				<section className="tournament-layout lower">
					<article className="panel reward-panel">
						<div className="section-heading">
							<div>
								<span className="panel-kicker">Reward matrix</span>
								<h2>Prize distribution</h2>
							</div>
							<p>Rewards are transparent and participation-safe, with no coin loss or betting mechanics.</p>
						</div>

						<div className="reward-table">
							{rewardMatrix.map((row) => (
								<div key={row.place} className="reward-row">
									<strong>{row.place}</strong>
									<span>{row.reward}</span>
								</div>
							))}
						</div>
					</article>

					<article className="panel history-panel">
						<div className="section-heading">
							<div>
								<span className="panel-kicker">Previous winners</span>
								<h2>Past podium profiles</h2>
							</div>
							<p>Use this history to frame the competition as an achievement loop, not a gamble.</p>
						</div>

						<div className="history-list">
							{history.map((winner) => (
								<div key={winner.winner} className="history-card">
									<div className="history-icon"><Crown /></div>
									<div>
										<strong>{winner.winner}</strong>
										<span>{winner.track}</span>
										<p>{winner.points} points • {winner.prize}</p>
									</div>
								</div>
							))}
						</div>
					</article>
				</section>

				<div className="ethical-banner">
					<ShieldCheck />
					<p>No betting. No coin loss. Every participant earns rewards.</p>
				</div>
			</div>
		</div>
		</DashboardLayout>
	);
}

export default Tournament;