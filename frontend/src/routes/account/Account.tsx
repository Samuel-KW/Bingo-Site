import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../components/authentication.tsx';


export default function Account() {
	const [loading, setLoading] = useState<boolean>(true);
	const [firstName, setFirstName] = useState<string | null>(null);
	const [lastName, setLastName] = useState<string | null>(null);
	const [email, setEmail] = useState<string | null>(null);
	const [password, setPassword] = useState<string | null>(null);
	const [birthday, setBirthday] = useState<string | null>(null);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

	const auth = useAuth();
	const session = auth?.session;
	if (!session) throw new Error("No auth provider found");

	const data = session.user.metadata;

	const getProfile = async () => {
		try {
			setLoading(true);

			setFirstName(data.firstName);
			setLastName(data.lastName);
			setBirthday(data.birthday);
			setAvatarUrl(data.avatarUrl);
			setEmail(session.user.email);
			setPassword("*********");

		} catch (error: unknown) {

			if (error instanceof Error)
				alert(error.message);

		} finally {
			setLoading(false);
		}
	};

	const updateProfile = async (e: FormEvent) => {
		e.preventDefault();

		try {
			setLoading(true);

			console.log("Updating profile ...");
			await new Promise(r => setTimeout(r, 1000));


		} catch (error: unknown) {

			if (error instanceof Error)
				alert(error.message);

		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getProfile();
	}, []);

	return (
		<form onSubmit={updateProfile} className="form-widget">
			<div>
				<label htmlFor="email">Email</label>
				<input id="email" type="text" value={email || ''} disabled />
			</div>
			<div>
				<label htmlFor="username">Name</label>
				<input
					id="username"
					type="text"
					required
					value={firstName || ''}
					onChange={(e) => setFirstName(e.target.value)}
				/>
			</div>
			<div>
				<label htmlFor="lastName">Last Name</label>
				<input
					id="lastName"
					type="text"
					required
					value={lastName || ''}
					onChange={(e) => setLastName(e.target.value)}
				/>
			</div>
			<div>
				<label htmlFor="birthday">Birthday</label>
				<input
					id="birthday"
					type="date"
					value={birthday || ''}
					onChange={(e) => setBirthday(e.target.value)}
				/>
			</div>
			<div>
				<label htmlFor="avatar">Avatar</label>
				<input
					id="avatar"
					type="text"
					value={avatarUrl || ''}
					onChange={(e) => setAvatarUrl(e.target.value)}
				/>
			</div>
			<div>
				<label htmlFor="password">Password</label>
				<input
					id="password"
					type="password"
					value={password || ''}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			<div>
				<button className="button block primary" type="submit" disabled={loading}>
					{loading ? 'Loading ...' : 'Update'}
				</button>
			</div>

			<div>
				<button className="button block" type="button" onClick={() => auth.logout()}>
					Sign Out
				</button>
			</div>
		</form>
	)
}