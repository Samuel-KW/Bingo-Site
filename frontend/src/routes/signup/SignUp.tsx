import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../components/authentication.tsx';

import './SignUp.css'

export default function SignUp() {
	const [loading, setLoading] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const navigate = useNavigate();

	const auth = useAuth();
	if (!auth) throw new Error("No auth provider found");

	const handleSignUp = async (event: FormEvent) => {
		event.preventDefault();

		setLoading(true);

		try {
			const session = await auth.signup(email, password, {
				firstName: "x",
				lastName: "x",
				birthday: "x",
				accountType: "x",
				avatarUrl: "x",
				boards: []
			}, "");
			alert("Thank you for joining us! Welcome " + session.user.metadata.firstName);
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
				<h1 className="header">Sign Up</h1>
				<p className="description">Create a new account using your email and password:</p>
				<form className="form-widget" onSubmit={handleSignUp}>
					<div>
						<input
							className="inputField"
							type="email"
							placeholder="Your email"
							value={email}
							required={true}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<input
							className="inputField"
							type="password"
							placeholder="Your password"
							value={password}
							required={true}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<div>
						<button className={'button block'} disabled={loading}>
							{loading ? <span>Loading</span> : <span>Create Account</span>}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}