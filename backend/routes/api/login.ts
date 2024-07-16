
import {Request, Response} from "express";
import { AuthenticatedRequest } from "../../src/Server";
import passport from "passport";
import { User } from "../../src/Database";

export default async function LogIn (req: AuthenticatedRequest, res: Response): Promise<void> {
	const body = req.body;
	const email = body.email;
	const password = body.password;
	const captcha = body.captcha;

	passport.authenticate('local', function(err: any, user: User, info: object, status: number) {
		console.log('login.ts');
		console.log(err, user, info, status);

		if (err)
			return res.status(500).send("Internal Server Error");

		if (!user)
			return res.status(401).send("Unauthorized");

		return res.status(200).send({
			user: {
				email: user.email,
				uuid: user.uuid,
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
	})(req, res);
}