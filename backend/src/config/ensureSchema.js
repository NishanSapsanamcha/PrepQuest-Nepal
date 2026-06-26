import { DataTypes } from "sequelize";

const addColumnIfMissing = async (queryInterface, tableName, columnName, columnDefinition) => {
	const table = await queryInterface.describeTable(tableName);
	if (!table[columnName]) {
		await queryInterface.addColumn(tableName, columnName, columnDefinition);
	}
};

const ensureRuntimeSchema = async (sequelize) => {
	const queryInterface = sequelize.getQueryInterface();

	await addColumnIfMissing(queryInterface, "tournament_registrations", "ready_status", {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	});

	await addColumnIfMissing(queryInterface, "tournament_registrations", "speed_bonus_total", {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	});

	await addColumnIfMissing(queryInterface, "tournament_answers", "speed_bonus", {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	});

	await addColumnIfMissing(queryInterface, "tournament_results", "speed_bonus_total", {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	});
};

export { ensureRuntimeSchema };
