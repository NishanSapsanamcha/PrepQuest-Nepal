import { sequelize } from "../config/database.js";
import User from "./User.js";

const models = {
	User
};

export { sequelize, User };
export default models;
