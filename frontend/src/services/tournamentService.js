import api from "./api";

export const getCurrentTournaments = async () => {
	const { data } = await api.get("/tournaments/current");
	return data;
};

export const registerForTournament = async (tournamentId, payload) => {
	const { data } = await api.post(`/tournaments/${tournamentId}/register`, payload);
	return data;
};

export const getTournamentLiveState = async (tournamentId) => {
	const { data } = await api.get(`/tournaments/${tournamentId}/live-state`);
	return data;
};

export const submitTournamentAnswer = async (tournamentId, selectedOptionKey) => {
	const { data } = await api.post(`/tournaments/${tournamentId}/answer`, { selectedOptionKey });
	return data;
};

export const getTournamentResults = async (tournamentId) => {
	const { data } = await api.get(`/tournaments/${tournamentId}/results`);
	return data;
};
