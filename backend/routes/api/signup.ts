import {Request, Response} from "express";
import BingoDatabase, { User } from "../../src/Database";
import { Verify, Hash, HashOptions } from "../../src/Authentication";
import { AuthenticatedRequest } from "../../src/Server";

export default async function SignUp (req: AuthenticatedRequest, res: Response): Promise<void> {
	const body = req.body;
	const password = body.password;
	const firstName = body.firstName;
	const lastName = body.lastName;
	const email = body.email;
	const birthday = body.birthday;
	const avatarUrl = body.avatarUrl;
	const captcha = body.captcha;

	if (password === undefined || firstName === undefined || lastName === undefined || email === undefined || birthday === undefined || avatarUrl === undefined) {
		res.status(400).send("Bad Request");
		return;
	}

	try {
		const user = await req.server.createUser(password, firstName, lastName, email, birthday, avatarUrl);

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
	} catch (e) {
		res.status(401).send("Unauthorized");
	}
};
