import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Award,
	CalendarDays,
	Crown,
	Medal,
	ShieldCheck,
	Sparkles,
	Star,
	Target,
	Trophy,
	Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Leaderboard.css";

const periodTabs = ["Weekly", "Monthly", "Subject-wise", "Tournament"];
const trackTabs = ["All", "Nayab Subba", "Sakha Adhikrit"];

const leaderboardCollections = {
	Weekly: [
		{ rank: 1, name: "Aayush Shrestha", xp: 2840, track: "Nayab Subba", streak: 18, badges: 14, reward: "300 coins + Badge" },
		{ rank: 2, name: "Suman Thapa", xp: 2710, track: "Sakha Adhikrit", streak: 15, badges: 12, reward: "220 coins + Badge" },
		{ rank: 3, name: "Ramesh Karki", xp: 2595, track: "Nayab Subba", streak: 13, badges: 11, reward: "180 coins + Badge" },
		{ rank: 4, name: "Bikash Rai", xp: 2490, track: "Sakha Adhikrit", streak: 11, badges: 10, reward: "+150 coins" },
		{ rank: 5, name: "Mina Gurung", xp: 2410, track: "Nayab Subba", streak: 10, badges: 9, reward: "+120 coins" },
		{ rank: 6, name: "Prakash Adhikari", xp: 2360, track: "Sakha Adhikrit", streak: 9, badges: 8, reward: "+100 coins" },
		{ rank: 7, name: "Nisha Shrestha", xp: 2280, track: "Nayab Subba", streak: 8, badges: 8, reward: "+90 coins" },
		{ rank: 8, name: "Suresh Lama", xp: 2200, track: "Sakha Adhikrit", streak: 7, badges: 7, reward: "+80 coins" },
		{ rank: 9, name: "Anjali Rai", xp: 2145, track: "Nayab Subba", streak: 7, badges: 6, reward: "+70 coins" },
		{ rank: 10, name: "Hari Khatri", xp: 2088, track: "Sakha Adhikrit", streak: 6, badges: 6, reward: "+60 coins" },
		{ rank: 12, name: "You", xp: 1250, track: "Nayab Subba", streak: 4, badges: 2, reward: "Next tier at Rank #10" }
	],
	Monthly: [
		{ rank: 1, name: "Aayush Shrestha", xp: 11420, track: "Nayab Subba", streak: 21, badges: 18, reward: "600 coins + Badge" },
		{ rank: 2, name: "Suman Thapa", xp: 11030, track: "Sakha Adhikrit", streak: 19, badges: 16, reward: "450 coins + Badge" },
		{ rank: 3, name: "Ramesh Karki", xp: 10880, track: "Nayab Subba", streak: 17, badges: 15, reward: "300 coins + Badge" },
		{ rank: 4, name: "Bikash Rai", xp: 10120, track: "Sakha Adhikrit", streak: 14, badges: 12, reward: "+250 coins" },
		{ rank: 5, name: "Mina Gurung", xp: 9860, track: "Nayab Subba", streak: 13, badges: 11, reward: "+200 coins" },
		{ rank: 6, name: "Prakash Adhikari", xp: 9580, track: "Sakha Adhikrit", streak: 12, badges: 10, reward: "+180 coins" },
		{ rank: 7, name: "Nisha Shrestha", xp: 9325, track: "Nayab Subba", streak: 11, badges: 10, reward: "+160 coins" },
		{ rank: 8, name: "Suresh Lama", xp: 9055, track: "Sakha Adhikrit", streak: 10, badges: 9, reward: "+140 coins" },
		{ rank: 9, name: "Anjali Rai", xp: 8870, track: "Nayab Subba", streak: 9, badges: 8, reward: "+120 coins" },
		{ rank: 10, name: "Hari Khatri", xp: 8620, track: "Sakha Adhikrit", streak: 8, badges: 8, reward: "+100 coins" },
		{ rank: 12, name: "You", xp: 6500, track: "Nayab Subba", streak: 6, badges: 4, reward: "Next tier at Rank #10" }
	],
	"Subject-wise": [
		{ rank: 1, name: "Aayush Shrestha", xp: 880, track: "Nayab Subba", streak: 18, badges: 8, reward: "150 coins + Badge" },
		{ rank: 2, name: "Suman Thapa", xp: 860, track: "Sakha Adhikrit", streak: 15, badges: 8, reward: "120 coins + Badge" },
		{ rank: 3, name: "Ramesh Karki", xp: 840, track: "Nayab Subba", streak: 13, badges: 7, reward: "100 coins + Badge" },
		{ rank: 4, name: "Bikash Rai", xp: 820, track: "Sakha Adhikrit", streak: 11, badges: 6, reward: "+80 coins" },
		{ rank: 5, name: "Mina Gurung", xp: 790, track: "Nayab Subba", streak: 10, badges: 6, reward: "+70 coins" },
		{ rank: 6, name: "Prakash Adhikari", xp: 770, track: "Sakha Adhikrit", streak: 9, badges: 5, reward: "+60 coins" },
		{ rank: 7, name: "Nisha Shrestha", xp: 750, track: "Nayab Subba", streak: 8, badges: 5, reward: "+50 coins" },
		{ rank: 8, name: "Suresh Lama", xp: 730, track: "Sakha Adhikrit", streak: 7, badges: 5, reward: "+40 coins" },
		{ rank: 9, name: "Anjali Rai", xp: 710, track: "Nayab Subba", streak: 7, badges: 4, reward: "+30 coins" },
		{ rank: 10, name: "Hari Khatri", xp: 690, track: "Sakha Adhikrit", streak: 6, badges: 4, reward: "+20 coins" },
		{ rank: 12, name: "You", xp: 520, track: "Nayab Subba", streak: 4, badges: 2, reward: "Next tier at Rank #10" }
	],
	Tournament: [
		{ rank: 1, name: "Aayush Shrestha", xp: 1420, track: "Nayab Subba", streak: 18, badges: 10, reward: "500 coins + Badge" },
		{ rank: 2, name: "Suman Thapa", xp: 1360, track: "Sakha Adhikrit", streak: 15, badges: 9, reward: "300 coins + Badge" },
		{ rank: 3, name: "Ramesh Karki", xp: 1305, track: "Nayab Subba", streak: 13, badges: 9, reward: "150 coins + Badge" },
		{ rank: 4, name: "Bikash Rai", xp: 1240, track: "Sakha Adhikrit", streak: 11, badges: 8, reward: "+120 coins" },
		{ rank: 5, name: "Mina Gurung", xp: 1190, track: "Nayab Subba", streak: 10, badges: 7, reward: "+100 coins" },
		{ rank: 6, name: "Prakash Adhikari", xp: 1150, track: "Sakha Adhikrit", streak: 9, badges: 7, reward: "+90 coins" },
		{ rank: 7, name: "Nisha Shrestha", xp: 1110, track: "Nayab Subba", streak: 8, badges: 6, reward: "+80 coins" },
		{ rank: 8, name: "Suresh Lama", xp: 1075, track: "Sakha Adhikrit", streak: 7, badges: 6, reward: "+70 coins" },
		{ rank: 9, name: "Anjali Rai", xp: 1040, track: "Nayab Subba", streak: 7, badges: 5, reward: "+60 coins" },
		{ rank: 10, name: "Hari Khatri", xp: 1000, track: "Sakha Adhikrit", streak: 6, badges: 5, reward: "+50 coins" },
		{ rank: 12, name: "You", xp: 700, track: "Nayab Subba", streak: 4, badges: 2, reward: "Next tier at Rank #10" }
	]
};

const userTargetGap = 180;

function Leaderboard() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [activePeriod, setActivePeriod] = useState("Weekly");
	const [activeTrack, setActiveTrack] = useState("All");

	const userName = user?.fullName || user?.name || localStorage.getItem("userName") || "Aspirant";
	const currentRows = leaderboardCollections[activePeriod] || leaderboardCollections.Weekly;
	const podium = currentRows.slice(0, 3);

	const filteredRankings = useMemo(() => {
		return currentRows.filter((row) => row.rank >= 4 && row.rank <= 10 && (activeTrack === "All" || row.track === activeTrack));
	}, [activeTrack, currentRows]);

	const userRankCard = useMemo(() => {
		const baseXp = activePeriod === "Monthly" ? 6500 : activePeriod === "Subject-wise" ? 520 : activePeriod === "Tournament" ? 700 : 1250;
		return {
			rank: 12,
			xp: baseXp,
			nextTarget: `Earn ${userTargetGap} XP to reach Rank #10`,
			progress: 65,
			track: "Nayab Subba"
		};
	}, [activePeriod]);

	return (
		<main className="leaderboard-page">
			<div className="leaderboard-backdrop" aria-hidden="true" />

			<div className="leaderboard-shell">
				<header className="leaderboard-hero">
					<button className="back-link" type="button" onClick={() => navigate("/dashboard")}>
						<ArrowLeft /> Back to Dashboard
					</button>

					<div className="hero-copy">
						<div className="hero-kicker">
							<Award /> Weekly leaderboard
						</div>
						<h1>Leaderboard</h1>
						<p>Weekly leaderboard resets in: 3 days 6 hours.</p>
						<p className="hero-subcopy">See how you rank across the full PrepQuest community, compare track-based performance, and keep the goal gradient visible.</p>
					</div>

					<div className="hero-meta">
						<span className="hero-chip"><ShieldCheck /> {userName}</span>
						<span className="hero-chip ghost"><CalendarDays /> Resets every week</span>
						<span className="hero-chip ghost"><Sparkles /> Zero-risk, reward-only competition</span>
					</div>
				</header>

				<section className="leaderboard-tabs" aria-label="Leaderboard filters">
					<div className="tab-row">
						{periodTabs.map((tab) => (
							<button key={tab} type="button" className={`tab-pill${activePeriod === tab ? " active" : ""}`} onClick={() => setActivePeriod(tab)}>
								{tab}
							</button>
						))}
					</div>
					<div className="track-row">
						{trackTabs.map((track) => (
							<button key={track} type="button" className={`track-pill${activeTrack === track ? " active" : ""}`} onClick={() => setActiveTrack(track)}>
								{track}
							</button>
						))}
					</div>
				</section>

				<section className="leaderboard-summary" aria-label="Leaderboard summary">
					<article className="summary-card highlight">
						<div className="summary-icon"><Crown /></div>
						<div>
							<span className="summary-label">Top performer</span>
							<strong>{podium[0].name}</strong>
							<p>{podium[0].xp} XP • {podium[0].track}</p>
						</div>
					</article>

					<article className="summary-card">
						<div className="summary-icon warm"><Target /></div>
						<div>
							<span className="summary-label">Your target gap</span>
							<strong>{userTargetGap} XP</strong>
							<p>Reach Rank #10 through steady weekly activity.</p>
						</div>
					</article>

					<article className="summary-card">
						<div className="summary-icon cool"><Medal /></div>
						<div>
							<span className="summary-label">User position</span>
							<strong>#{userRankCard.rank}</strong>
							<p>{userRankCard.xp} XP • Current focus track: Nayab Subba</p>
						</div>
					</article>
				</section>

				<section className="leaderboard-layout">
					<article className="panel podium-panel">
						<div className="section-heading">
							<div>
								<span className="panel-kicker">Top 3 podium</span>
								<h2>Highlighted winners</h2>
							</div>
							<p>Podium cards show name, XP, track, streak, badges, and reward for the current board.</p>
						</div>

						<div className="podium-grid">
							{podium.map((row) => (
								<article key={row.rank} className={`podium-card rank-${row.rank}`}>
									<div className="podium-rank">
										{row.rank === 1 ? <Crown /> : row.rank === 2 ? <Medal /> : <Trophy />}
										<span>#{row.rank}</span>
									</div>
									<h3>{row.name}</h3>
									<p>{row.track}</p>
									<div className="podium-metric">
										<strong>{row.xp} XP</strong>
										<span>{row.streak}-day streak</span>
									</div>
									<div className="podium-meta">
										<span>{row.badges} badges</span>
										<span>{row.reward}</span>
									</div>
								</article>
							))}
						</div>
					</article>

					<aside className="sticky-column">
						<article className="panel sticky-user-card">
							<div className="section-heading compact">
								<div>
									<span className="panel-kicker">Your rank</span>
									<h2>Sticky progress</h2>
								</div>
								<Star />
							</div>
							<div className="user-rank-value">#{userRankCard.rank}</div>
							<p>{userRankCard.xp} XP</p>
							<p>{userRankCard.nextTarget}</p>
							<div className="progress-block">
								<div className="progress-row">
									<span>Progress to Rank #10</span>
									<strong>{userRankCard.progress}%</strong>
								</div>
								<div className="progress-track"><span style={{ width: `${userRankCard.progress}%` }} /></div>
							</div>
						</article>

						<article className="panel legend-card">
							<div className="section-heading compact">
								<div>
									<span className="panel-kicker">Rewards legend</span>
									<h2>Zero-risk rewards</h2>
								</div>
								<Zap />
							</div>
							<ul className="legend-list">
								<li><strong>Rank 1</strong><span>300 coins + Badge</span></li>
								<li><strong>Rank 2</strong><span>200 coins + Badge</span></li>
								<li><strong>Rank 3</strong><span>120 coins + Badge</span></li>
								<li><strong>All ranks</strong><span>Participation rewards only, no penalties</span></li>
							</ul>
						</article>
					</aside>
				</section>

				<section className="panel board-panel" aria-labelledby="rankings-title">
					<div className="section-heading">
						<div>
							<span className="panel-kicker">Rankings list</span>
							<h2 id="rankings-title">Ranks 4 to 10</h2>
						</div>
						<p>Filtered by track: {activeTrack}. Period view: {activePeriod}.</p>
					</div>

					<div className="board-list" role="list">
						{filteredRankings.map((row) => (
							<article key={row.rank} className="board-row" role="listitem">
								<div className="rank-cell">
									<span className={`rank-badge rank-${row.rank}`}>#{row.rank}</span>
									<div>
										<h3>{row.name}</h3>
										<p>{row.track}</p>
									</div>
								</div>
								<div className="metric-cell"><span>XP</span><strong>{row.xp}</strong></div>
								<div className="metric-cell"><span>Streak</span><strong>{row.streak} days</strong></div>
								<div className="metric-cell"><span>Badges</span><strong>{row.badges}</strong></div>
								<div className="metric-cell"><span>Reward</span><strong>{row.reward}</strong></div>
							</article>
						))}
					</div>
				</section>
			</div>
		</main>
	);
}

export default Leaderboard;