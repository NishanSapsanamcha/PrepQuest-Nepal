import api from "./api";

const registerUser = async (payload) => {
	const { data } = await api.post("/auth/register", payload);
	return data;
};

const loginUser = async ({ email, password }) => {
	const { data } = await api.post("/auth/login", { email, password });
	return data;
};

const requestPasswordReset = async (email) => {
	const { data } = await api.post("/auth/forgot-password", { email });
	return data;
};

const verifySecurityAnswer = async ({ email, securityAnswer }) => {
	const { data } = await api.post("/auth/forgot-password/verify", {
		email,
		securityAnswer
	});
	return data;
};

const resetPassword = async ({ resetToken, password, confirmPassword }) => {
	const { data } = await api.post("/auth/reset-password", {
		resetToken,
		password,
		confirmPassword
	});
	return data;
};

const completeSetup = async ({ selectedExam, preferredLanguage }) => {
	const { data } = await api.patch("/auth/setup", { selectedExam, preferredLanguage });
	return data;
};

export { completeSetup, loginUser, registerUser, requestPasswordReset, resetPassword, verifySecurityAnswer };
