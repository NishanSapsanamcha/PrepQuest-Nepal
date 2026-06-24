import {
  FaBook,
  FaBullseye,
  FaCalendarAlt,
  FaCheck,
  FaClipboardList,
  FaCrown,
  FaFire,
  FaMedal,
  FaMoon,
  FaRedo,
  FaShieldAlt,
  FaSun,
  FaTrophy,
} from "react-icons/fa";
import { MdOutlineRateReview, MdTrendingUp } from "react-icons/md";

const iconByName = {
  starter: FaMedal,
  book: FaBook,
  calendar: FaCalendarAlt,
  fire: FaFire,
  clipboard: FaClipboardList,
  target: FaBullseye,
  trophy: FaTrophy,
  medal: FaMedal,
  refresh: FaRedo,
  crown: FaCrown,
  check: FaCheck,
  review: MdOutlineRateReview,
  sun: FaSun,
  moon: FaMoon,
  shield: FaShieldAlt,
  trending: MdTrendingUp,
};

const iconByCategory = {
  Starter: FaMedal,
  Practice: FaBook,
  "Daily Quiz": FaCalendarAlt,
  Streak: FaFire,
  "Mock Test": FaClipboardList,
  "Subject Mastery": FaBullseye,
  Accuracy: FaBullseye,
  Tournament: FaTrophy,
  Rank: FaCrown,
  Review: MdOutlineRateReview,
  Leaderboard: MdTrendingUp,
};

function resolveIcon(icon, category) {
  return iconByName[icon] || iconByCategory[category] || FaMedal;
}

function BadgeIcon({ icon, category, rarity = "Common", status = "locked", size = "sm" }) {
  const Icon = resolveIcon(icon, category);
  const rarityClass = `rarity-${String(rarity).toLowerCase()}`;
  const statusClass = `status-${status}`;
  const sizeClass = `size-${size}`;

  return (
    <span className={`badge-emblem ${rarityClass} ${statusClass} ${sizeClass}`} title={category}>
      <span className="badge-emblem-glow" aria-hidden="true" />
      <Icon className="badge-emblem-icon" />
      <span className="badge-emblem-corner" aria-hidden="true" />
    </span>
  );
}

export default BadgeIcon;
