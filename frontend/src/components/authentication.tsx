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
	login: (email: string, password: string) => Promise<Session>;
	signup: (email: string, password: string, metadata: UserMetadata) => Promise<Session>;
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

	const login = (email: string, password: string) => {
		return new Promise<Session>((resolve, reject) => {
			setTimeout(() => {
				if (Math.random() > 0.5 || (email === "x" && password === "x")) {
					const data: Session = {
						user: {
							email: email,
							id: "x",
							metadata: {
								firstName: "x",
								lastName: "x",
								birthday: "x",
								accountType: "x",
								avatarUrl: "x",
								boards: []
							}
						},
						accessToken: "x",
						refreshToken: "x",
						expiresIn: 0,
						tokenType: "x"
					};
					resolve(data);
					setSession(data);
				} else {
					reject("Invalid email or password.");
				}
			}, 100);
		});
	};

	const signup = (email: string, password: string, metadata: UserMetadata) => {
		return new Promise<Session>((resolve, reject) => {
			console.log("Sending email and password to server...", email, password);

			setTimeout(() => {
				if (Math.random() > 0.5) {
					const data: Session = {
						user: {
							email: email,
							id: "x",
							metadata: metadata
						},
						accessToken: "x",
						refreshToken: "x",
						expiresIn: 0,
						tokenType: "x"
					};
					resolve(data);
					setSession(data);
				} else {
					Math.random() > 0.5 ? reject("Email already in use.") : reject("Password too weak.");
				}
			}, 100);
		});
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