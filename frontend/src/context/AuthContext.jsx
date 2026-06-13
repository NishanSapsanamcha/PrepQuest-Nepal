import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "prepquest-auth";

const AuthContext = createContext(null);

const readStoredAuth = () => {
	const parse = (value) => {
		if (!value) {
			return null;
		}

		try {
			return JSON.parse(value);
		} catch {
			return null;
		}
	};

	return parse(localStorage.getItem(STORAGE_KEY)) || parse(sessionStorage.getItem(STORAGE_KEY));
};

const persistAuth = (authState, rememberMe) => {
	localStorage.removeItem(STORAGE_KEY);
	sessionStorage.removeItem(STORAGE_KEY);

	if (!authState) {
		return;
	}

	const storage = rememberMe ? localStorage : sessionStorage;
	storage.setItem(STORAGE_KEY, JSON.stringify(authState));
};

function AuthProvider({ children }) {
	const [authState, setAuthState] = useState(() => readStoredAuth());

	useEffect(() => {
		if (authState) {
			persistAuth(authState, authState.rememberMe);
		}
	}, [authState]);

	const login = (payload, rememberMe = true) => {
		const nextAuthState = {
			token: payload.token,
			user: payload.user,
			rememberMe
		};

		setAuthState(nextAuthState);
		persistAuth(nextAuthState, rememberMe);
	};

	const logout = () => {
		setAuthState(null);
		persistAuth(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user: authState?.user || null,
				token: authState?.token || null,
				isAuthenticated: Boolean(authState?.token),
				login,
				logout
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}

	return context;
};

export { AuthProvider, useAuth };
