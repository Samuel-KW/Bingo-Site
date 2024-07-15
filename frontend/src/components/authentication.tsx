import { useState, useMemo, useEffect, useContext, createContext, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom';

import { BingoBoard } from './bingo-card.tsx';

export type UserMetadata = {
	firstName: string;
	lastName: string;
	birthday: string;
	avatarUrl: string;
	accountType: string;
	boards: [ BingoBoard ] | [];
}

export type Session = {
	user: {
		email: string;
		id: string;
		metadata: UserMetadata;
	};
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	tokenType: string;
};

export type AuthDetails = {
	session: Session | null;
	login: (email: string, password: string, captcha: string) => Promise<Session>;
	signup: (email: string, password: string, metadata: UserMetadata, captcha: string) => Promise<Session>;
	logout: () => void;
} | null;

const AuthContext = createContext<AuthDetails>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {

	const [session, setSession] = useState<Session | null>(null)
	const navigate = useNavigate();

	useEffect(() => {
		const session = localStorage.getItem("session");

		if (session) {
			setSession(JSON.parse(session));
		}

	}, []);

	const login = async (email: string, password: string): Promise<Session> => {

		const req = await fetch("/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email, password,
				captcha: null
			})
		});

		const data = await req.json();
		const session = {
			user: data.user,
			accessToken: "",
			refreshToken: "",
			expiresIn: -1,
			tokenType: ""
		};

		setSession(session);
		return session;
	};

	const signup = async (email: string, password: string, metadata: UserMetadata, captcha: string): Promise<Session> => {

		const req = await fetch("/api/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				password, email,
				firstName: metadata.firstName,
				lastName: metadata.lastName,
				birthday: metadata.birthday,
				avatarUrl: metadata.avatarUrl,
				captcha
			})
		});

		const data = await req.json();
		const session = {
			user: data.user,
			accessToken: "",
			refreshToken: "",
			expiresIn: -1,
			tokenType: ""
		};
		setSession(session);
		return session
	};

	const logout = () => {
		setSession(null);
		navigate("login");
	};

	const details = useMemo(
		() => ({ session, login, signup, logout }),
		[session]
	);

	return <AuthContext.Provider value={details}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	return useContext(AuthContext);
};

export default AuthProvider;