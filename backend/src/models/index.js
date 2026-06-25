import { sequelize } from "../config/database.js";
import User from "./User.js";
import Tournament from "./Tournament.js";
import TournamentAnswer from "./TournamentAnswer.js";
import TournamentRegistration from "./TournamentRegistration.js";
import TournamentResult from "./TournamentResult.js";
import Badge from "./Badge.js";
import UserBadge from "./UserBadge.js";

Tournament.hasMany(TournamentRegistration, { foreignKey: "tournamentId", sourceKey: "id", as: "registrations" });
TournamentRegistration.belongsTo(Tournament, { foreignKey: "tournamentId", targetKey: "id", as: "tournament" });

Tournament.hasMany(TournamentAnswer, { foreignKey: "tournamentId", sourceKey: "id", as: "answers" });
TournamentAnswer.belongsTo(Tournament, { foreignKey: "tournamentId", targetKey: "id", as: "tournament" });

Tournament.hasMany(TournamentResult, { foreignKey: "tournamentId", sourceKey: "id", as: "results" });
TournamentResult.belongsTo(Tournament, { foreignKey: "tournamentId", targetKey: "id", as: "tournament" });

User.hasMany(TournamentRegistration, { foreignKey: "userId", as: "tournamentRegistrations" });
TournamentRegistration.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(TournamentAnswer, { foreignKey: "userId", as: "tournamentAnswers" });
TournamentAnswer.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(TournamentResult, { foreignKey: "userId", as: "tournamentResults" });
TournamentResult.belongsTo(User, { foreignKey: "userId", as: "user" });

Badge.hasMany(UserBadge, { foreignKey: "badgeId", sourceKey: "id", as: "userBadges" });
UserBadge.belongsTo(Badge, { foreignKey: "badgeId", targetKey: "id", as: "badge" });

User.hasMany(UserBadge, { foreignKey: "userId", as: "badges" });
UserBadge.belongsTo(User, { foreignKey: "userId", as: "user" });

const models = {
	User,
	Tournament,
	TournamentAnswer,
	TournamentRegistration,
	TournamentResult,
	Badge,
	UserBadge
};

export { sequelize, User, Tournament, TournamentAnswer, TournamentRegistration, TournamentResult, Badge, UserBadge };
export default models;
