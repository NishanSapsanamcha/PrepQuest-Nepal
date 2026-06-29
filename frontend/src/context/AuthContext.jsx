import { createContext, useContext, useEffect, useState } from "react";
import {
	getActiveAccountId,
	getUser,
	resetLocalGamificationData,
	saveUser,
	setActiveAccountId,
} from "../utils/storageUtils";

const STORAGE_KEY = "prepquest-auth";

// The gamification profile (XP, coins, streak, tournament/daily-quiz
// history, etc.) lives in localStorage, separate from the real authenticated
// account. On every login: if this browser's local data belongs to a
// DIFFERENT account than the one logging in, wipe it first so one person's
// progress never leaks into another account's session. Then sync the real
// name/email in so Practice/Profile/etc. never fall back to a seeded name.
const syncLocalProfileWithAuthUser = (authUser) => {
	const displayName = authUser?.fullName || authUser?.name || authUser?.email;
	if (!displayName) return;

	const accountId = authUser?.id || authUser?.email || displayName;
	const previousAccountId = getActiveAccountId();
	// previousAccountId is null on a browser that predates this account-scoping
	// fix (or has never recorded an owner) - treat that as untrusted leftover
	// data too, not just a known-different account, so a stale session can
	// never carry over silently.
	if (previousAccountId !== accountId) {
		resetLocalGamificationData();
	}
	setActiveAccountId(accountId);

	saveUser({ ...getUser(), name: displayName, email: authUser?.email || "" });
	localStorage.setItem("userName", displayName);

	// Setup completion is authoritative on the server (User.setupCompleted).
	// Always re-derive the local cache from it on login so a wiped/missing
	// local flag can never force a returning user back through onboarding -
	// the one-time setup screen only shows when the server says it's unseen.
	if (authUser?.setupCompleted && authUser?.selectedExam && authUser?.preferredLanguage) {
		localStorage.setItem("selectedExam", authUser.selectedExam);
		localStorage.setItem("preferredLanguage", authUser.preferredLanguage);
		localStorage.setItem("onboardingCompleted", "true");
	} else {
		localStorage.removeItem("onboardingCompleted");
	}
};

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
		syncLocalProfileWithAuthUser(payload.user);
	};

	const logout = () => {
		setAuthState(null);
		persistAuth(null);
	};

	// Merge a partial user patch (e.g. after completing setup) into the
	// in-memory + persisted auth state without requiring a fresh login.
	const updateUser = (patch) => {
		setAuthState((current) => {
			if (!current) return current;
			const nextState = { ...current, user: { ...current.user, ...patch } };
			persistAuth(nextState, current.rememberMe);
			return nextState;
		});
	};

	return (
		<AuthContext.Provider
			value={{
				user: authState?.user || null,
				token: authState?.token || null,
				isAuthenticated: Boolean(authState?.token),
				login,
				logout,
				updateUser
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
