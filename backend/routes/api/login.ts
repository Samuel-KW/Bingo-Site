
import {Request, Response} from "express";
import { AuthenticatedRequest } from "../../src/Server";

export default async function LogIn (req: AuthenticatedRequest, res: Response): Promise<void> {
	const body = req.body;
	const email = body.email;
	const password = body.password;
	const captcha = body.captcha;

	if (email === undefined || password === undefined) {
		res.status(400).send("Bad Request");
		return;
	}

	try {
		const user = await req.server.logIn(email, password);

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
}