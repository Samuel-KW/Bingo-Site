import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../components/authentication.tsx";

import "./LogIn.css";

export default function LogIn() {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const navigate = useNavigate();

	const auth = useAuth();
	if (!auth) throw new Error("No auth provider found");

	const handleLogin = async (event: FormEvent) => {
		event.preventDefault();

		setLoading(true);

		try {
			const session = await auth.login(email, password, "");
			alert("Logged in successfully! Welcome " + session.user.metadata.firstName);
			navigate("/");

		} catch (error: unknown) {
			if (typeof error === "string")
				alert(error);

		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="row flex flex-center">
			<div className="col-6 form-widget">
				<h1 className="header">Log In</h1>
				<p className="description">Enter your email and password:</p>
				<form className="form-widget" onSubmit={handleLogin}>
					<div>
						<input
							className="inputField"
							type="email"
							autoComplete="username"
							placeholder="Your email"
							value={email}
							required={true}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<input
							className="inputField"
							type="password"
							autoComplete="current-password"
							placeholder="Your password"
							value={password}
							required={true}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<div>
						<button className={"button block"} disabled={loading}>
							{loading ? <span>Loading</span> : <span>Log In</span>}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}