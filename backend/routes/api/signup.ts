import { Request, Response } from "express";
import { User, addUser, getUserByEmail } from "../../Database";
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, Hash, hashOptions } from "../../src/Authentication";

export default async function SignUp (req: Request, res: Response): Promise<void> {

	const body = req.body;
	const password:  string | undefined = body.password;
	const firstName: string | undefined = body.firstName;
	const lastName:  string | undefined = body.lastName;
	const email: 	   string | undefined = body.email;
	const birthday:  string | undefined = body.birthday;
	const avatarUrl: string | undefined = body.avatarUrl;
	const captcha:   string | undefined = body.captcha;

	if (password === undefined || firstName === undefined || lastName === undefined || email === undefined || birthday === undefined || avatarUrl === undefined) {
		console.error("Error creating user (" + email + "): Missing required fields");
		res.status(400).send("Bad Request");
		return;
	}

	try {

		if (password.length < MIN_PASSWORD_LENGTH) throw "Password is too short";
		else if (password.length > MAX_PASSWORD_LENGTH) throw "Password is too long";

		if (getUserByEmail(email) != undefined)
			throw "Email already in use.";

		const hash = await Hash(password, hashOptions);
		const user = User.new(hash, firstName, lastName, email, birthday, avatarUrl)
		addUser(user.toDB());

		if (req.session.user === undefined) req.session.user = { id: user.uuid };
		else req.session.user.id = user.uuid;

		res.status(200).send({
			user: {
				email: user.email,
				id: user.uuid,
				metadata: {
					firstName: user.firstName,
					lastName: user.lastName,
					birthday: user.birthday,
					accountType: user.accountType,
					avatarUrl: user.avatarUrl,
					boards: user.boards
				}
			}
		});
		console.info("Created user:", email);
	} catch (e: unknown) {
		res.status(401).send("Unauthorized");
		console.error("Error creating user (" + email + "):", e);
	}
};
