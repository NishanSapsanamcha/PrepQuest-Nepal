import api from "./api";

// Fetches the authenticated user's saved daily-reward streak snapshot.
// Returns null if they have never synced one yet.
const getDailyRewardState = async () => {
	const { data } = await api.get("/users/me/daily-reward");
	return data?.dailyRewardState || null;
};

// Persists the current daily-reward streak snapshot so it survives a
// cleared browser, a different device, or a logout/login cycle.
const syncDailyRewardState = async (state) => {
	const { data } = await api.put("/users/me/daily-reward", state);
	return data?.dailyRewardState || null;
};

export { getDailyRewardState, syncDailyRewardState };
