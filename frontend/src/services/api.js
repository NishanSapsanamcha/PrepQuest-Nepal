import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json"
	}
});

api.interceptors.request.use((config) => {
	const parse = (value) => {
		if (!value) return null;
		try {
			return JSON.parse(value);
		} catch {
			return null;
		}
	};
	const auth = parse(localStorage.getItem("prepquest-auth")) || parse(sessionStorage.getItem("prepquest-auth"));
	if (auth?.token) {
		config.headers.Authorization = `Bearer ${auth.token}`;
	}
	return config;
});

export default api;
