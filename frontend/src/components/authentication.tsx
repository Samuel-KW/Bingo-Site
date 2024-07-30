import { useState, useMemo, useEffect, useContext, createContext, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom';

import { BingoBoard } from './bingo-board.tsx';

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
		uuid: string;
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

	const csrf = async () => {
		const req = await fetch("/api/csrf");
		const data = await req.json();
		return data.csrf;
	};

	const login = async (email: string, password: string, captcha: string = ""): Promise<Session> => {

		const csrfToken = await csrf();

		const params = new URLSearchParams({
			email,
			password,
			captcha
		});

		const req = await fetch("/api/login", {
			method: "POST",
			headers: {
				"Content-Type": `application/x-www-form-urlencoded`,
				"x-csrf-token": csrfToken,
				"credentials": "same-origin"
			},
			body: params.toString()
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

	const signup = async (email: string, password: string, metadata: UserMetadata, captcha: string = ""): Promise<Session> => {

		const csrfToken = await csrf();

		const body = {
			password, email,
			firstName: metadata.firstName || undefined,
			lastName: metadata.lastName || undefined,
			birthday: metadata.birthday || undefined,
			avatarUrl: metadata.avatarUrl || undefined,
			captcha: captcha || undefined
		};

		const req = await fetch("/api/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-csrf-token": csrfToken,
				"credentials": "same-origin"
			},
			body: JSON.stringify(body),
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