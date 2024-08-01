import { Request, Response } from "express";
import { addUser, getUserByEmail } from "../../Database";
import { Hash, hashOptions } from "../../src/Authentication";
import { User } from "../../src/User";
import { SignupSchema } from "./validation";

export default async function SignUp (req: Request, res: Response): Promise<void> {

	const result = SignupSchema.safeParse(req.body);

	if (!result.success) {
		console.error("Error creating user:", result.error);
		res.status(400).send("Bad Request");
		return;
	}

	const { password, firstName, lastName, email, birthday, avatarUrl } = result.data;

	try {

		if (getUserByEmail(email) != undefined)
			throw "Email already in use.";

		const hash = await Hash(password, hashOptions);
		const user = User.new({ email, password: hash, firstName, lastName, birthday, avatarUrl });
		addUser(user);

		if (!req.session.user) req.session.user = { id: user.uuid };
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
		console.error("Error creating user (" + email + "):", e);
		res.status(401).send("Unauthorized");
	}
};
